import { prisma } from './prisma';
import { readableStoryWhere, type StoryCard } from './stories';

export type ShelfEntry = {
  story: StoryCard;
  percent: number;
  chapter: number;
  paragraph: number;
  savedAt: Date | null;
  completedAt: Date | null;
  saved: boolean;
};

export type Shelf = {
  current: ShelfEntry[];
  saved: ShelfEntry[];
  completed: ShelfEntry[];
};

const storyInclude = {
  select: {
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
    _count: { select: { chapters: { where: { status: 'PUBLISHED' } } } },
  },
} as const;

type StoryRow = {
  id: string;
  title: string;
  synopsis: string;
  coverUrl: string;
  genre: string;
  audience: string;
  language: string;
  tags: string[];
  featured: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  author: { fullName: string; username: string; avatarUrl: string | null };
  _count: { chapters: number };
};

function toCard(story: StoryRow): StoryCard {
  return {
    id: story.id,
    title: story.title,
    synopsis: story.synopsis,
    coverUrl: story.coverUrl,
    genre: story.genre,
    audience: story.audience,
    language: story.language,
    tags: story.tags,
    featured: story.featured,
    authorName: story.author.fullName,
    authorUsername: story.author.username,
    authorAvatarUrl: story.author.avatarUrl,
    chapterCount: story._count.chapters,
    publishedAt: story.publishedAt,
    updatedAt: story.updatedAt,
  };
}

export async function getShelf(userId: string): Promise<Shelf> {
  const [progress, savedItems] = await Promise.all([
    prisma.readingProgress.findMany({
      where: { userId, story: readableStoryWhere() },
      orderBy: { updatedAt: 'desc' },
      include: { story: storyInclude },
    }),
    prisma.libraryItem.findMany({
      where: { userId, story: readableStoryWhere() },
      orderBy: { savedAt: 'desc' },
      include: { story: storyInclude },
    }),
  ]);

  const started = new Set(progress.map((row) => row.storyId));
  const savedIds = new Set(savedItems.map((item) => item.storyId));
  const entry = (
    story: StoryRow,
    values: Partial<ShelfEntry> = {},
  ): ShelfEntry => ({
    story: toCard(story),
    percent: 0,
    chapter: 1,
    paragraph: 0,
    savedAt: null,
    completedAt: null,
    saved: savedIds.has(story.id),
    ...values,
  });

  return {
    current: progress
      .filter((row) => !row.completedAt)
      .map((row) =>
        entry(row.story as StoryRow, {
          percent: row.percent,
          chapter: row.chapter,
          paragraph: row.paragraph,
        }),
      ),
    completed: progress
      .filter((row) => row.completedAt)
      .map((row) =>
        entry(row.story as StoryRow, {
          percent: 100,
          chapter: row.chapter,
          paragraph: row.paragraph,
          completedAt: row.completedAt,
        }),
      ),
    // A story being read is already on the current shelf; the saved shelf is
    // for the ones still waiting.
    saved: savedItems
      .filter((item) => !started.has(item.storyId))
      .map((item) =>
        entry(item.story as StoryRow, { savedAt: item.savedAt, saved: true }),
      ),
  };
}

export async function saveToLibrary(userId: string, storyId: string) {
  await prisma.libraryItem.upsert({
    where: { userId_storyId: { userId, storyId } },
    create: { userId, storyId },
    update: {},
  });
}

export async function removeFromLibrary(userId: string, storyId: string) {
  await prisma.libraryItem.deleteMany({ where: { userId, storyId } });
}

export async function isInLibrary(userId: string, storyId: string) {
  return (await prisma.libraryItem.count({ where: { userId, storyId } })) > 0;
}

export async function createReadingList(
  userId: string,
  input: { title: string; description?: string; isPublic?: boolean },
) {
  const title = input.title.trim();
  if (title.length < 2 || title.length > 60)
    throw new Error('A list name needs between 2 and 60 characters.');
  return prisma.readingList.create({
    data: {
      userId,
      title,
      description: input.description?.trim() || null,
      isPublic: input.isPublic ?? false,
    },
  });
}

async function ownedList(userId: string, listId: string) {
  const list = await prisma.readingList.findUnique({ where: { id: listId } });
  if (!list || list.userId !== userId)
    throw new Error('That reading list is not yours.');
  return list;
}

export async function addToReadingList(
  userId: string,
  listId: string,
  storyId: string,
) {
  await ownedList(userId, listId);
  await prisma.readingListItem.upsert({
    where: { listId_storyId: { listId, storyId } },
    create: { listId, storyId },
    update: {},
  });
}

export async function removeFromReadingList(
  userId: string,
  listId: string,
  storyId: string,
) {
  await ownedList(userId, listId);
  await prisma.readingListItem.deleteMany({ where: { listId, storyId } });
}

export async function deleteReadingList(userId: string, listId: string) {
  await ownedList(userId, listId);
  await prisma.readingList.delete({ where: { id: listId } });
}

export type ReadingListSummary = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  count: number;
  covers: string[];
};

export async function getReadingLists(
  userId: string,
): Promise<ReadingListSummary[]> {
  const lists = await prisma.readingList.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { items: true } },
      items: {
        take: 4,
        orderBy: { addedAt: 'desc' },
        include: { story: { select: { coverUrl: true } } },
      },
    },
  });
  return lists.map((list) => ({
    id: list.id,
    title: list.title,
    description: list.description,
    isPublic: list.isPublic,
    count: list._count.items,
    covers: list.items.map((item) => item.story.coverUrl),
  }));
}

export type ReadingGoalSummary = {
  target: number;
  finished: number;
  percent: number;
  year: number;
};

export async function getReadingGoal(
  userId: string,
): Promise<ReadingGoalSummary> {
  const year = new Date().getFullYear();
  const [goal, finished] = await Promise.all([
    prisma.readingGoal.findUnique({ where: { userId } }),
    prisma.readingProgress.count({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    }),
  ]);
  const target = goal?.target ?? 12;
  return {
    target,
    finished,
    percent: Math.min(100, Math.round((finished / target) * 100)),
    year,
  };
}

export async function setReadingGoal(userId: string, target: number) {
  if (!Number.isInteger(target) || target < 1 || target > 1000)
    throw new Error('Choose a goal between 1 and 1000 books.');
  const year = new Date().getFullYear();
  await prisma.readingGoal.upsert({
    where: { userId },
    create: { userId, target, year },
    update: { target, year },
  });
  return getReadingGoal(userId);
}
