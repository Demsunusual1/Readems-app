import { prisma } from './prisma';

export type StoryReaction = {
  likes: number;
  liked: boolean;
  rating: number | null;
  ratingCount: number;
  readers: number;
};

export type StoryReview = {
  id: string;
  rating: number;
  body: string | null;
  createdAt: Date;
  likes: number;
  liked: boolean;
  mine: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
};

export async function toggleStoryLike(userId: string, storyId: string) {
  const existing = await prisma.storyLike.findUnique({
    where: { userId_storyId: { userId, storyId } },
  });
  if (existing) {
    await prisma.storyLike.delete({
      where: { userId_storyId: { userId, storyId } },
    });
    return false;
  }
  await prisma.storyLike.create({ data: { userId, storyId } });
  return true;
}

export async function getStoryReaction(
  storyId: string,
  viewerId: string | null,
): Promise<StoryReaction> {
  const [likes, liked, ratings, readers] = await Promise.all([
    prisma.storyLike.count({ where: { storyId } }),
    viewerId
      ? prisma.storyLike.count({ where: { storyId, userId: viewerId } })
      : Promise.resolve(0),
    prisma.review.aggregate({
      where: { storyId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.readingProgress.count({ where: { storyId } }),
  ]);
  const average = ratings._avg.rating;
  return {
    likes,
    liked: liked > 0,
    rating: average === null ? null : Math.round(average * 10) / 10,
    ratingCount: ratings._count.rating,
    readers,
  };
}

export async function saveReview(
  userId: string,
  storyId: string,
  input: { rating: number; body?: string },
) {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)
    throw new Error('Choose a rating between one and five stars.');
  const body = input.body?.trim() ?? '';
  if (body.length > 2000)
    throw new Error('A review can be up to 2000 characters.');
  return prisma.review.upsert({
    where: { userId_storyId: { userId, storyId } },
    create: { userId, storyId, rating: input.rating, body: body || null },
    update: { rating: input.rating, body: body || null },
  });
}

export async function deleteReview(userId: string, storyId: string) {
  await prisma.review.deleteMany({ where: { userId, storyId } });
}

export async function getReviews(
  storyId: string,
  viewerId: string | null,
  take = 20,
): Promise<StoryReview[]> {
  const reviews = await prisma.review.findMany({
    where: { storyId },
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      user: {
        select: { id: true, fullName: true, username: true, avatarUrl: true },
      },
      _count: { select: { likes: true } },
      likes: viewerId
        ? { where: { userId: viewerId }, select: { userId: true } }
        : false,
    },
  });
  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    body: review.body,
    createdAt: review.createdAt,
    likes: review._count.likes,
    liked: Array.isArray(review.likes) ? review.likes.length > 0 : false,
    mine: review.userId === viewerId,
    author: {
      id: review.user.id,
      name: review.user.fullName,
      username: review.user.username,
      avatarUrl: review.user.avatarUrl,
    },
  }));
}

export async function getReviewByReader(userId: string, storyId: string) {
  return prisma.review.findUnique({
    where: { userId_storyId: { userId, storyId } },
    select: { rating: true, body: true },
  });
}

export async function toggleReviewLike(userId: string, reviewId: string) {
  const existing = await prisma.reviewLike.findUnique({
    where: { userId_reviewId: { userId, reviewId } },
  });
  if (existing) {
    await prisma.reviewLike.delete({
      where: { userId_reviewId: { userId, reviewId } },
    });
    return false;
  }
  await prisma.reviewLike.create({ data: { userId, reviewId } });
  return true;
}
