import { prisma } from './prisma';

export async function getStoryReadingState(userId: string, storyId: string) {
  const [progress, libraryEntry] = await Promise.all([
    prisma.readingProgress.findUnique({
      where: { userId_storyId: { userId, storyId } },
    }),
    prisma.libraryEntry.findUnique({
      where: { userId_storyId: { userId, storyId } },
    }),
  ]);

  return { progress, saved: Boolean(libraryEntry) };
}

export async function markChapterOpened(
  userId: string,
  storyId: string,
  chapterNumber: number,
) {
  const existing = await prisma.readingProgress.findUnique({
    where: { userId_storyId: { userId, storyId } },
  });

  return prisma.readingProgress.upsert({
    where: { userId_storyId: { userId, storyId } },
    update: {
      chapterNumber,
      ...(existing?.chapterNumber === chapterNumber
        ? {}
        : { progressPercent: 0 }),
    },
    create: {
      userId,
      storyId,
      chapterNumber,
      progressPercent: 0,
    },
  });
}

export async function getRecentReadingProgress(userId: string, take = 3) {
  return prisma.readingProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take,
  });
}
