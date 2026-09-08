import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export type StoryCard = {
  id: string;
  title: string;
  synopsis: string;
  coverUrl: string;
  genre: string;
  audience: string;
  language: string;
  tags: string[];
  featured: boolean;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  chapterCount: number;
  publishedAt: Date | null;
  updatedAt: Date;
};

export type StoryChapter = {
  number: number;
  title: string;
  paragraphs: string[];
  authorNote: string | null;
};

export type StoryQuery = {
  query?: string;
  genre?: string;
  interests?: string[];
  featured?: boolean;
  authorId?: string;
  limit?: number;
};

// A story or chapter is readable once it is published, or once the moment it
// was scheduled for has passed. Scheduling therefore works without a worker
// process having to flip a status at the right second.
export function readableStoryWhere(now = new Date()): Prisma.StoryWhereInput {
  return {
    OR: [
      { status: 'PUBLISHED' },
      { status: 'SCHEDULED', scheduledFor: { lte: now } },
    ],
  };
}

export function readableChapterWhere(
  now = new Date(),
): Prisma.ChapterWhereInput {
  return {
    OR: [
      { status: 'PUBLISHED' },
      { status: 'SCHEDULED', scheduledFor: { lte: now } },
    ],
  };
}

export function paragraphsOf(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

const cardSelect = {
  id: true,
  title: true,
  synopsis: true,
  coverUrl: true,
  genre: true,
  audience: true,
  language: true,
  tags: true,
  featured: true,
  publishedAt: true,
  updatedAt: true,
  author: { select: { fullName: true, username: true, avatarUrl: true } },
} satisfies Prisma.StorySelect;

type CardRow = Prisma.StoryGetPayload<{ select: typeof cardSelect }>;

function toCard(story: CardRow, chapterCount: number): StoryCard {
  const { author, ...rest } = story;
  return {
    ...rest,
    authorName: author.fullName,
    authorUsername: author.username,
    authorAvatarUrl: author.avatarUrl,
    chapterCount,
  };
}

async function countReadableChapters(storyIds: string[], now: Date) {
  if (storyIds.length === 0) return new Map<string, number>();
  const counts = await prisma.chapter.groupBy({
    by: ['storyId'],
    where: { storyId: { in: storyIds }, ...readableChapterWhere(now) },
    _count: { _all: true },
  });
  return new Map(counts.map((row) => [row.storyId, row._count._all]));
}

export async function listStories(options: StoryQuery = {}) {
  const now = new Date();
  const term = options.query?.trim();
  const interests = options.interests?.filter(Boolean) ?? [];
  const conditions: Prisma.StoryWhereInput[] = [readableStoryWhere(now)];
  if (options.genre) conditions.push({ genre: options.genre });
  if (options.featured !== undefined)
    conditions.push({ featured: options.featured });
  if (options.authorId) conditions.push({ authorId: options.authorId });
  if (term)
    conditions.push({
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { synopsis: { contains: term, mode: 'insensitive' } },
        { genre: { contains: term, mode: 'insensitive' } },
        { tags: { has: term } },
        { author: { fullName: { contains: term, mode: 'insensitive' } } },
      ],
    });
  if (interests.length)
    conditions.push({
      OR: [{ genre: { in: interests } }, { tags: { hasSome: interests } }],
    });

  const stories = await prisma.story.findMany({
    where: { AND: conditions },
    select: cardSelect,
    orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
    take: options.limit,
  });
  const counts = await countReadableChapters(
    stories.map((story) => story.id),
    now,
  );
  return stories.map((story) => toCard(story, counts.get(story.id) ?? 0));
}

export async function getStory(id: string) {
  const now = new Date();
  const story = await prisma.story.findFirst({
    where: { id, ...readableStoryWhere(now) },
    select: cardSelect,
  });
  if (!story) return null;
  const chapterCount = await prisma.chapter.count({
    where: { storyId: id, ...readableChapterWhere(now) },
  });
  return toCard(story, chapterCount);
}

export async function getPublishedChapters(
  storyId: string,
): Promise<StoryChapter[]> {
  const chapters = await prisma.chapter.findMany({
    where: { storyId, ...readableChapterWhere() },
    orderBy: { number: 'asc' },
    select: { number: true, title: true, body: true, authorNote: true },
  });
  return chapters.map(({ body, ...chapter }) => ({
    ...chapter,
    paragraphs: paragraphsOf(body),
  }));
}

export async function getChapterByNumber(
  storyId: string,
  number: number,
): Promise<StoryChapter | null> {
  if (!Number.isInteger(number) || number < 1) return null;
  const chapter = await prisma.chapter.findFirst({
    where: { storyId, number, ...readableChapterWhere() },
    select: { number: true, title: true, body: true, authorNote: true },
  });
  return chapter
    ? {
        number: chapter.number,
        title: chapter.title,
        authorNote: chapter.authorNote,
        paragraphs: paragraphsOf(chapter.body),
      }
    : null;
}
