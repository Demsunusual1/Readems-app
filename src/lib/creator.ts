import type { ChapterStatus, StoryStatus } from '@prisma/client';
import { prisma } from './prisma';
import { notify, notifyMany } from './notifications';
import { paragraphsOf } from './stories';
import { countWords } from './creator-text';

export type CreatorStory = {
  id: string;
  title: string;
  synopsis: string;
  coverUrl: string;
  genre: string;
  status: StoryStatus;
  publishedAt: Date | null;
  updatedAt: Date;
  chapters: number;
  reads: number;
  likes: number;
  comments: number;
};

export type CreatorChapter = {
  id: string;
  number: number;
  title: string;
  body: string;
  status: ChapterStatus;
  publishedAt: Date | null;
  scheduledFor: Date | null;
  words: number;
  updatedAt: Date;
};

export type CreatorStoryDetail = CreatorStory & {
  chapters: never;
};

export const storyGenres = [
  'African Folktales',
  'Drama',
  'Romance',
  'Fantasy',
  'Mystery',
  'Sci-Fi',
  'Poetry',
  'Non-Fiction',
  'Historical Fiction',
  'Young Adult',
  'Thriller',
  'Contemporary',
] as const;

/** The cover artwork that ships with Readems, offered when creating a story. */
export const coverChoices = [
  '/readems/story-baobab-cover.png',
  '/readems/cover-last-train-to-makoko.png',
  '/readems/cover-letters-to-my-younger-self.png',
  '/readems/cover-shadows-of-the-drum.png',
  '/readems/featured-archivist-of-salt.png',
  '/readems/featured-beneath-the-baobab-tree.png',
  '/readems/featured-when-stars-learn-to-bloom.png',
  '/readems/library-cover-freedom-street.png',
] as const;

export { countWords };

export function storySlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return base || 'story';
}

async function ownStory(userId: string, storyId: string) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { id: true, authorId: true, title: true },
  });
  if (!story || story.authorId !== userId)
    throw new Error('That story is not yours.');
  return story;
}

async function ownChapter(userId: string, chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      story: { select: { id: true, title: true, authorId: true } },
    },
  });
  if (!chapter || chapter.story.authorId !== userId)
    throw new Error('That chapter is not yours.');
  return chapter;
}

export async function createStory(
  userId: string,
  input: {
    title: string;
    synopsis: string;
    genre: string;
    coverUrl?: string;
    audience?: string;
    tags?: string[];
  },
) {
  const title = input.title.trim();
  if (title.length < 2 || title.length > 120)
    throw new Error('A title needs between 2 and 120 characters.');
  let id = storySlug(title);
  if (await prisma.story.findUnique({ where: { id } }))
    id = `${id}-${Math.random().toString(36).slice(2, 6)}`;
  return prisma.story.create({
    data: {
      id,
      title,
      synopsis: input.synopsis.trim(),
      genre: input.genre,
      coverUrl: input.coverUrl || coverChoices[0],
      audience: input.audience || 'General',
      tags: input.tags ?? [],
      authorId: userId,
      status: 'DRAFT',
    },
  });
}

export async function updateStory(
  userId: string,
  storyId: string,
  input: Partial<{
    title: string;
    synopsis: string;
    genre: string;
    coverUrl: string;
    audience: string;
    tags: string[];
  }>,
) {
  await ownStory(userId, storyId);
  const title = input.title?.trim();
  if (title !== undefined && (title.length < 2 || title.length > 120))
    throw new Error('A title needs between 2 and 120 characters.');
  return prisma.story.update({
    where: { id: storyId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(input.synopsis !== undefined
        ? { synopsis: input.synopsis.trim() }
        : {}),
      ...(input.genre ? { genre: input.genre } : {}),
      ...(input.coverUrl ? { coverUrl: input.coverUrl } : {}),
      ...(input.audience ? { audience: input.audience } : {}),
      ...(input.tags ? { tags: input.tags } : {}),
    },
  });
}

export async function publishStory(
  userId: string,
  storyId: string,
  when?: Date,
) {
  await ownStory(userId, storyId);
  const scheduled = when && when.getTime() > Date.now();
  return prisma.story.update({
    where: { id: storyId },
    data: scheduled
      ? { status: 'SCHEDULED', scheduledFor: when }
      : { status: 'PUBLISHED', publishedAt: new Date(), scheduledFor: null },
  });
}

export async function unpublishStory(userId: string, storyId: string) {
  await ownStory(userId, storyId);
  return prisma.story.update({
    where: { id: storyId },
    data: { status: 'DRAFT' },
  });
}

export async function deleteStory(userId: string, storyId: string) {
  await ownStory(userId, storyId);
  await prisma.story.delete({ where: { id: storyId } });
}

export async function createChapter(
  userId: string,
  storyId: string,
  input: { title: string; body?: string },
) {
  await ownStory(userId, storyId);
  const title = input.title.trim();
  if (!title) throw new Error('Give the chapter a title.');
  const last = await prisma.chapter.findFirst({
    where: { storyId },
    orderBy: { number: 'desc' },
    select: { number: true },
  });
  return prisma.chapter.create({
    data: {
      storyId,
      number: (last?.number ?? 0) + 1,
      title,
      body: input.body ?? '',
      status: 'DRAFT',
    },
  });
}

export async function saveChapter(
  userId: string,
  chapterId: string,
  input: { title?: string; body?: string; authorNote?: string },
) {
  await ownChapter(userId, chapterId);
  const title = input.title?.trim();
  if (title !== undefined && !title)
    throw new Error('Give the chapter a title.');
  return prisma.chapter.update({
    where: { id: chapterId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.authorNote !== undefined
        ? { authorNote: input.authorNote.trim() || null }
        : {}),
    },
  });
}

export async function publishChapter(
  userId: string,
  chapterId: string,
  when?: Date,
) {
  const chapter = await ownChapter(userId, chapterId);
  const scheduled = when && when.getTime() > Date.now();
  const updated = await prisma.chapter.update({
    where: { id: chapterId },
    data: scheduled
      ? { status: 'SCHEDULED', scheduledFor: when }
      : { status: 'PUBLISHED', publishedAt: new Date(), scheduledFor: null },
  });

  // A story with a published chapter should be readable, and the people
  // following the writer should hear about it.
  if (!scheduled) {
    const story = await prisma.story.findUniqueOrThrow({
      where: { id: chapter.story.id },
      select: { status: true },
    });
    if (story.status === 'DRAFT')
      await prisma.story.update({
        where: { id: chapter.story.id },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      });

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
    });
    await notifyMany(
      followers.map((row) => row.followerId),
      {
        actorId: userId,
        kind: 'CHAPTER',
        category: 'READING',
        title: 'New chapter published',
        body: `Chapter ${updated.number} of ${chapter.story.title} is now live.`,
        href: `/stories/${chapter.story.id}/chapters/${updated.number}`,
      },
    );
  }
  return updated;
}

export async function unpublishChapter(userId: string, chapterId: string) {
  await ownChapter(userId, chapterId);
  return prisma.chapter.update({
    where: { id: chapterId },
    data: { status: 'DRAFT', scheduledFor: null },
  });
}

export async function deleteChapter(userId: string, chapterId: string) {
  await ownChapter(userId, chapterId);
  await prisma.chapter.delete({ where: { id: chapterId } });
}

function toCreatorStory(story: {
  id: string;
  title: string;
  synopsis: string;
  coverUrl: string;
  genre: string;
  status: StoryStatus;
  publishedAt: Date | null;
  updatedAt: Date;
  _count: { chapters: number; progress: number; likes: number };
}): CreatorStory {
  return {
    id: story.id,
    title: story.title,
    synopsis: story.synopsis,
    coverUrl: story.coverUrl,
    genre: story.genre,
    status: story.status,
    publishedAt: story.publishedAt,
    updatedAt: story.updatedAt,
    chapters: story._count.chapters,
    reads: story._count.progress,
    likes: story._count.likes,
    comments: 0,
  };
}

export async function getMyStories(userId: string) {
  const stories = await prisma.story.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { chapters: true, progress: true, likes: true } },
    },
  });
  const commentCounts = await prisma.comment.groupBy({
    by: ['chapterId'],
    where: { chapter: { story: { authorId: userId } } },
    _count: { _all: true },
  });
  const chapterOwners = await prisma.chapter.findMany({
    where: { id: { in: commentCounts.map((row) => row.chapterId) } },
    select: { id: true, storyId: true },
  });
  const commentsByStory = new Map<string, number>();
  for (const row of commentCounts) {
    const storyId = chapterOwners.find(
      (chapter) => chapter.id === row.chapterId,
    )?.storyId;
    if (storyId)
      commentsByStory.set(
        storyId,
        (commentsByStory.get(storyId) ?? 0) + row._count._all,
      );
  }

  const shaped = stories.map((story) => ({
    ...toCreatorStory(story),
    comments: commentsByStory.get(story.id) ?? 0,
  }));

  return {
    all: shaped,
    published: shaped.filter((story) => story.status === 'PUBLISHED'),
    drafts: shaped.filter((story) => story.status === 'DRAFT'),
    scheduled: shaped.filter((story) => story.status === 'SCHEDULED'),
  };
}

export async function getMyStory(userId: string, storyId: string) {
  const story = await prisma.story.findFirst({
    where: { id: storyId, authorId: userId },
    include: {
      _count: { select: { chapters: true, progress: true, likes: true } },
      chapters: { orderBy: { number: 'asc' } },
    },
  });
  if (!story) return null;
  return {
    ...toCreatorStory(story),
    audience: story.audience,
    tags: story.tags,
    scheduledFor: story.scheduledFor,
    chapters: story.chapters.map(
      (chapter): CreatorChapter => ({
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        body: chapter.body,
        status: chapter.status,
        publishedAt: chapter.publishedAt,
        scheduledFor: chapter.scheduledFor,
        updatedAt: chapter.updatedAt,
        words: countWords(chapter.body),
      }),
    ),
  };
}

export async function getMyChapter(userId: string, chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { story: { select: { id: true, title: true, authorId: true } } },
  });
  if (!chapter || chapter.story.authorId !== userId) return null;
  return {
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    body: chapter.body,
    authorNote: chapter.authorNote,
    status: chapter.status,
    scheduledFor: chapter.scheduledFor,
    words: countWords(chapter.body),
    characters: chapter.body.length,
    paragraphs: paragraphsOf(chapter.body).length,
    updatedAt: chapter.updatedAt,
    story: { id: chapter.story.id, title: chapter.story.title },
  };
}

/** Tells a writer that their story went live, used when scheduling lands. */
export async function announcePublication(userId: string, storyId: string) {
  const story = await ownStory(userId, storyId);
  await notify({
    userId,
    kind: 'SYSTEM',
    category: 'CREATOR',
    title: 'Story published',
    body: `${story.title} is live.`,
    href: `/stories/${story.id}`,
  });
}
