import { prisma } from './prisma';
import { listStories, readableChapterWhere, type StoryCard } from './stories';
import { notify } from './notifications';
import { isBlockedBetween } from './settings';

export type PersonSummary = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  followers: number;
  storyCount: number;
  isFollowing: boolean;
};

export type Profile = PersonSummary & {
  role: 'READER' | 'CREATOR' | 'BOTH';
  joinedAt: Date;
  following: number;
  isMe: boolean;
  showsReadingActivity: boolean;
  stories: StoryCard[];
};

export async function toggleFollow(followerId: string, followingId: string) {
  if (followerId === followingId)
    throw new Error('You cannot follow yourself.');
  if (await isBlockedBetween(followerId, followingId))
    throw new Error('You cannot follow this person.');
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return false;
  }
  await prisma.follow.create({ data: { followerId, followingId } });
  const follower = await prisma.user.findUnique({
    where: { id: followerId },
    select: { fullName: true, username: true },
  });
  if (follower)
    await notify({
      userId: followingId,
      actorId: followerId,
      kind: 'FOLLOW',
      category: 'COMMUNITY',
      title: 'New follower',
      body: `${follower.fullName} started following you.`,
      href: `/u/${follower.username}`,
    });
  return true;
}

export async function isFollowing(followerId: string, followingId: string) {
  return (
    (await prisma.follow.count({
      where: { followerId, followingId },
    })) > 0
  );
}

const personSelect = {
  id: true,
  fullName: true,
  username: true,
  avatarUrl: true,
  bio: true,
  _count: { select: { followers: true, stories: true } },
} as const;

type PersonRow = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  _count: { followers: number; stories: number };
};

function toPerson(row: PersonRow, following: Set<string>): PersonSummary {
  return {
    id: row.id,
    name: row.fullName,
    username: row.username,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    followers: row._count.followers,
    storyCount: row._count.stories,
    isFollowing: following.has(row.id),
  };
}

async function followedIds(viewerId: string | null, candidates: string[]) {
  if (!viewerId || candidates.length === 0) return new Set<string>();
  const rows = await prisma.follow.findMany({
    where: { followerId: viewerId, followingId: { in: candidates } },
    select: { followingId: true },
  });
  return new Set(rows.map((row) => row.followingId));
}

export async function getFollowing(userId: string, viewerId = userId) {
  const rows = await prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: 'desc' },
    include: { following: { select: personSelect } },
  });
  const following = await followedIds(
    viewerId,
    rows.map((row) => row.followingId),
  );
  return rows.map((row) => toPerson(row.following, following));
}

export async function getFollowers(userId: string, viewerId = userId) {
  const rows = await prisma.follow.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: 'desc' },
    include: { follower: { select: personSelect } },
  });
  const following = await followedIds(
    viewerId,
    rows.map((row) => row.followerId),
  );
  return rows.map((row) => toPerson(row.follower, following));
}

export async function getProfile(
  username: string,
  viewerId: string | null,
): Promise<Profile | null> {
  const person = await prisma.user.findUnique({
    where: { username },
    select: {
      ...personSelect,
      role: true,
      createdAt: true,
      settings: { select: { profilePublic: true, showReadingActivity: true } },
      _count: { select: { followers: true, following: true, stories: true } },
    },
  });
  if (!person) return null;
  const isMe = viewerId === person.id;
  if (person.settings && !person.settings.profilePublic && !isMe) return null;
  const stories = await listStories({ authorId: person.id, limit: 12 });
  const following = await followedIds(viewerId, [person.id]);
  return {
    id: person.id,
    name: person.fullName,
    username: person.username,
    avatarUrl: person.avatarUrl,
    bio: person.bio,
    role: person.role,
    joinedAt: person.createdAt,
    followers: person._count.followers,
    following: person._count.following,
    stories,
    storyCount: person._count.stories,
    isFollowing: following.has(person.id),
    isMe,
    showsReadingActivity: person.settings?.showReadingActivity ?? false,
  };
}

export type CreatorUpdate = {
  storyId: string;
  storyTitle: string;
  coverUrl: string;
  chapterNumber: number;
  chapterTitle: string;
  publishedAt: Date;
  creatorName: string;
  creatorUsername: string;
};

/** What the people a reader follows have published lately. */
export async function getCreatorUpdates(
  userId: string,
  take = 10,
): Promise<CreatorUpdate[]> {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  if (follows.length === 0) return [];
  const chapters = await prisma.chapter.findMany({
    where: {
      ...readableChapterWhere(),
      story: { authorId: { in: follows.map((row) => row.followingId) } },
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take,
    include: {
      story: {
        select: {
          id: true,
          title: true,
          coverUrl: true,
          author: { select: { fullName: true, username: true } },
        },
      },
    },
  });
  return chapters.map((chapter) => ({
    storyId: chapter.story.id,
    storyTitle: chapter.story.title,
    coverUrl: chapter.story.coverUrl,
    chapterNumber: chapter.number,
    chapterTitle: chapter.title,
    publishedAt: chapter.publishedAt ?? chapter.createdAt,
    creatorName: chapter.story.author.fullName,
    creatorUsername: chapter.story.author.username,
  }));
}

export async function searchPeople(
  term: string,
  viewerId: string | null,
  take = 10,
): Promise<PersonSummary[]> {
  const query = term.trim();
  if (!query) return [];
  const rows = await prisma.user.findMany({
    where: {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { followers: { _count: 'desc' } },
    take,
    select: personSelect,
  });
  const following = await followedIds(
    viewerId,
    rows.map((row) => row.id),
  );
  return rows.map((row) => toPerson(row, following));
}
