import { prisma } from './prisma';
import {
  listStories,
  readableChapterWhere,
  readableStoryWhere,
  type StoryCard,
} from './stories';

const DAY = 86_400_000;

/** The UTC calendar day a moment falls in, as a sortable key. */
function dayKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export type ReadingStreak = {
  days: number;
  lastReadAt: Date | null;
};

/**
 * How many days in a row a reader has read, counting back from today. Days are
 * counted in UTC, which is what the server stores; a reader whose midnight is
 * elsewhere may see a day tick over early or late.
 *
 * A run that ended yesterday still counts, because today is not over yet.
 */
export function streakFromDays(moments: Date[], now = new Date()): number {
  if (moments.length === 0) return 0;
  const seen = new Set(moments.map(dayKey));
  const cursor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  if (!seen.has(dayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!seen.has(dayKey(cursor))) return 0;
  }
  let days = 0;
  while (seen.has(dayKey(cursor))) {
    days += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return days;
}

export async function getReadingStreak(
  userId: string,
  now = new Date(),
): Promise<ReadingStreak> {
  const rows = await prisma.readingProgress.findMany({
    where: { userId },
    select: { updatedAt: true, completedAt: true },
    orderBy: { updatedAt: 'desc' },
  });
  const moments = rows.flatMap((row) =>
    row.completedAt ? [row.updatedAt, row.completedAt] : [row.updatedAt],
  );
  const lastReadAt = moments.reduce<Date | null>(
    (latest, moment) => (!latest || moment > latest ? moment : latest),
    null,
  );
  return { days: streakFromDays(moments, now), lastReadAt };
}

export type TrendingSerial = {
  id: string;
  title: string;
  coverUrl: string;
  genre: string;
  chapterCount: number;
  readers: number;
};

/**
 * Trending means what the rows can show: the readable stories the most people
 * have started inside the window. There is no view counter to draw on.
 */
export async function getTrendingSerials(
  options: { days?: number; limit?: number } = {},
): Promise<TrendingSerial[]> {
  const days = options.days ?? 30;
  const limit = options.limit ?? 6;
  const now = new Date();
  const from = new Date(now.getTime() - days * DAY);

  const grouped = await prisma.readingProgress.groupBy({
    by: ['storyId'],
    where: { startedAt: { gte: from }, story: readableStoryWhere(now) },
    _count: { _all: true },
    orderBy: { _count: { storyId: 'desc' } },
    take: limit,
  });
  if (grouped.length === 0) return [];

  const stories = await prisma.story.findMany({
    where: { id: { in: grouped.map((row) => row.storyId) } },
    select: {
      id: true,
      title: true,
      coverUrl: true,
      genre: true,
      _count: { select: { chapters: { where: readableChapterWhere(now) } } },
    },
  });
  const byId = new Map(stories.map((story) => [story.id, story]));

  return grouped.flatMap((row) => {
    const story = byId.get(row.storyId);
    if (!story) return [];
    return [
      {
        id: story.id,
        title: story.title,
        coverUrl: story.coverUrl,
        genre: story.genre,
        chapterCount: story._count.chapters,
        readers: row._count._all,
      },
    ];
  });
}

/** How many people have a reading record for each of these stories. */
export async function countReadersByStory(storyIds: string[]) {
  if (storyIds.length === 0) return new Map<string, number>();
  const grouped = await prisma.readingProgress.groupBy({
    by: ['storyId'],
    where: { storyId: { in: storyIds } },
    _count: { _all: true },
  });
  return new Map(grouped.map((row) => [row.storyId, row._count._all]));
}

/**
 * Stories in a reader's interests that they have not opened and did not write.
 * When nothing matches the caller gets an empty list, not a filler selection.
 */
export async function getRecommendations(
  userId: string,
  interests: string[],
  limit = 6,
): Promise<StoryCard[]> {
  const chosen = interests.filter(Boolean);
  if (chosen.length === 0) return [];
  const [candidates, progress] = await Promise.all([
    listStories({ interests: chosen, limit: limit + 20 }),
    prisma.readingProgress.findMany({
      where: { userId },
      select: { storyId: true },
    }),
  ]);
  const read = new Set(progress.map((row) => row.storyId));
  const author = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  return candidates
    .filter(
      (story) =>
        !read.has(story.id) && story.authorUsername !== author?.username,
    )
    .slice(0, limit);
}

export type CommunityPulse = {
  activeReaders: number;
  storiesShared: number;
  commentsToday: number;
};

/** Counts behind the community strip, each one a row count. */
export async function getCommunityPulse(
  now = new Date(),
): Promise<CommunityPulse> {
  const monthAgo = new Date(now.getTime() - 30 * DAY);
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const [readers, storiesShared, commentsToday] = await Promise.all([
    prisma.readingProgress.groupBy({
      by: ['userId'],
      where: { updatedAt: { gte: monthAgo } },
    }),
    prisma.story.count({ where: readableStoryWhere(now) }),
    prisma.comment.count({
      where: { createdAt: { gte: startOfToday }, hiddenAt: null },
    }),
  ]);
  return { activeReaders: readers.length, storiesShared, commentsToday };
}

export type SpotlightCreator = {
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  followers: number;
  publishedWorks: number;
  rating: number | null;
  bestKnownFor: string | null;
};

/**
 * The most-followed account that has actually published something. Returns
 * null when nobody qualifies, so the section can be left out entirely.
 */
export async function getSpotlightCreator(): Promise<SpotlightCreator | null> {
  const person = await prisma.user.findFirst({
    where: { stories: { some: { status: 'PUBLISHED' } } },
    orderBy: { followers: { _count: 'desc' } },
    select: {
      id: true,
      fullName: true,
      username: true,
      avatarUrl: true,
      bio: true,
      _count: { select: { followers: true } },
    },
  });
  if (!person) return null;

  const [publishedWorks, rating, best] = await Promise.all([
    prisma.story.count({
      where: { authorId: person.id, ...readableStoryWhere() },
    }),
    prisma.review.aggregate({
      where: { story: { authorId: person.id }, hiddenAt: null },
      _avg: { rating: true },
    }),
    prisma.story.findFirst({
      where: { authorId: person.id, ...readableStoryWhere() },
      orderBy: { progress: { _count: 'desc' } },
      select: { title: true },
    }),
  ]);

  return {
    name: person.fullName,
    username: person.username,
    avatarUrl: person.avatarUrl,
    bio: person.bio,
    followers: person._count.followers,
    publishedWorks,
    rating:
      rating._avg.rating === null
        ? null
        : Math.round(rating._avg.rating * 10) / 10,
    bestKnownFor: best?.title ?? null,
  };
}

export type ScheduledChapter = {
  id: string;
  storyId: string;
  storyTitle: string;
  number: number;
  title: string;
  scheduledFor: Date;
};

/** A writer's queue: chapters with a date set that has not arrived yet. */
export async function getScheduledChapters(
  userId: string,
  take = 5,
  now = new Date(),
): Promise<ScheduledChapter[]> {
  const rows = await prisma.chapter.findMany({
    where: {
      story: { authorId: userId },
      status: 'SCHEDULED',
      scheduledFor: { gt: now },
    },
    orderBy: { scheduledFor: 'asc' },
    take,
    select: {
      id: true,
      number: true,
      title: true,
      scheduledFor: true,
      story: { select: { id: true, title: true } },
    },
  });
  return rows.flatMap((row) =>
    row.scheduledFor
      ? [
          {
            id: row.id,
            storyId: row.story.id,
            storyTitle: row.story.title,
            number: row.number,
            title: row.title,
            scheduledFor: row.scheduledFor,
          },
        ]
      : [],
  );
}

export type AudienceActivity = {
  days: number;
  reads: number;
  likes: number;
  comments: number;
  newFollowers: number;
};

/** What a writer's audience did lately, counted per kind rather than summed. */
export async function getAudienceActivity(
  userId: string,
  days = 7,
  now = new Date(),
): Promise<AudienceActivity> {
  const from = new Date(now.getTime() - days * DAY);
  const [reads, likes, comments, newFollowers] = await Promise.all([
    prisma.readingProgress.count({
      where: { story: { authorId: userId }, startedAt: { gte: from } },
    }),
    prisma.storyLike.count({
      where: { story: { authorId: userId }, createdAt: { gte: from } },
    }),
    prisma.comment.count({
      where: {
        chapter: { story: { authorId: userId } },
        createdAt: { gte: from },
        hiddenAt: null,
      },
    }),
    prisma.follow.count({
      where: { followingId: userId, createdAt: { gte: from } },
    }),
  ]);
  return { days, reads, likes, comments, newFollowers };
}
