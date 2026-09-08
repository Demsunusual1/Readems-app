import { prisma } from './prisma';

export type DailyCount = { day: string; count: number };

export type CreatorAnalytics = {
  from: Date;
  to: Date;
  reads: number;
  readsBefore: number;
  followers: number;
  followersGained: number;
  engagement: number;
  finished: number;
  readsOverTime: DailyCount[];
  topStories: {
    id: string;
    title: string;
    coverUrl: string;
    genre: string;
    chapters: number;
    reads: number;
  }[];
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function emptyDays(from: Date, to: Date) {
  const days: DailyCount[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  while (cursor <= to) {
    days.push({ day: dayKey(cursor), count: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

/**
 * What a writer's own work has actually done. Everything here is counted from
 * stored rows: there is no traffic-source or location tracking to report.
 */
export async function getCreatorAnalytics(
  userId: string,
  days = 30,
): Promise<CreatorAnalytics> {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const previousFrom = new Date(from.getTime() - days * 86_400_000);

  const [
    stories,
    reads,
    readsBefore,
    followers,
    followersGained,
    likes,
    comments,
    reviews,
    finished,
    readRows,
  ] = await Promise.all([
    prisma.story.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        coverUrl: true,
        genre: true,
        _count: { select: { chapters: true, progress: true } },
      },
    }),
    prisma.readingProgress.count({
      where: { story: { authorId: userId }, startedAt: { gte: from } },
    }),
    prisma.readingProgress.count({
      where: {
        story: { authorId: userId },
        startedAt: { gte: previousFrom, lt: from },
      },
    }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({
      where: { followingId: userId, createdAt: { gte: from } },
    }),
    prisma.storyLike.count({
      where: { story: { authorId: userId }, createdAt: { gte: from } },
    }),
    prisma.comment.count({
      where: {
        chapter: { story: { authorId: userId } },
        createdAt: { gte: from },
      },
    }),
    prisma.review.count({
      where: { story: { authorId: userId }, createdAt: { gte: from } },
    }),
    prisma.readingProgress.count({
      where: { story: { authorId: userId }, completedAt: { not: null } },
    }),
    prisma.readingProgress.findMany({
      where: { story: { authorId: userId }, startedAt: { gte: from } },
      select: { startedAt: true },
    }),
  ]);

  const byDay = new Map(emptyDays(from, to).map((day) => [day.day, day]));
  for (const row of readRows) {
    const day = byDay.get(dayKey(row.startedAt));
    if (day) day.count += 1;
  }

  return {
    from,
    to,
    reads,
    readsBefore,
    followers,
    followersGained,
    engagement: likes + comments + reviews,
    finished,
    readsOverTime: [...byDay.values()],
    topStories: stories
      .map((story) => ({
        id: story.id,
        title: story.title,
        coverUrl: story.coverUrl,
        genre: story.genre,
        chapters: story._count.chapters,
        reads: story._count.progress,
      }))
      .sort((a, b) => b.reads - a.reads)
      .slice(0, 5),
  };
}

export function percentChange(now: number, before: number) {
  if (before === 0) return now === 0 ? 0 : 100;
  return Math.round(((now - before) / before) * 100);
}
