import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { notify } from './notifications';

async function postAndActor(postId: string, userId: string) {
  const [post, actor] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, groupId: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    }),
  ]);
  return post && actor
    ? {
        post,
        actor,
        href: post.groupId ? `/groups/${post.groupId}` : '/community',
      }
    : null;
}

export const postTopics = ['Books', 'Writing', 'Poetry', 'Culture'] as const;

export type PostTopic = (typeof postTopics)[number];

export type PostReply = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string; username: string; avatarUrl: string | null };
};

export type CommunityPost = {
  id: string;
  body: string;
  title: string | null;
  topic: string | null;
  kind: 'THOUGHT' | 'SHORT_STORY' | 'POEM' | 'QUESTION';
  createdAt: Date;
  likes: number;
  comments: number;
  liked: boolean;
  mine: boolean;
  groupId: string | null;
  groupName: string | null;
  promptTitle: string | null;
  story: { id: string; title: string; coverUrl: string } | null;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  replies: PostReply[];
};

const MAX_BODY = 4000;

export async function createPost(
  authorId: string,
  input: {
    body: string;
    title?: string;
    topic?: string;
    kind?: CommunityPost['kind'];
    groupId?: string;
    promptId?: string;
    storyId?: string;
  },
) {
  const body = input.body.trim();
  if (!body) throw new Error('Write something before posting.');
  if (body.length > MAX_BODY)
    throw new Error(`A post can be up to ${MAX_BODY} characters.`);
  if (input.groupId) {
    const member = await prisma.groupMember.count({
      where: { groupId: input.groupId, userId: authorId },
    });
    if (!member) throw new Error('Join the group before posting in it.');
  }
  return prisma.post.create({
    data: {
      authorId,
      body,
      title: input.title?.trim() || null,
      topic: input.topic || null,
      kind: input.kind ?? 'THOUGHT',
      groupId: input.groupId ?? null,
      promptId: input.promptId ?? null,
      storyId: input.storyId ?? null,
    },
  });
}

export async function deletePost(userId: string, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      authorId: true,
      group: { select: { createdById: true } },
    },
  });
  if (!post) throw new Error('That post is already gone.');
  const allowed =
    post.authorId === userId || post.group?.createdById === userId;
  if (!allowed) throw new Error('You can only remove your own post.');
  await prisma.post.delete({ where: { id: postId } });
}

export async function togglePostLike(userId: string, postId: string) {
  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  if (existing) {
    await prisma.postLike.delete({
      where: { userId_postId: { userId, postId } },
    });
    return false;
  }
  await prisma.postLike.create({ data: { userId, postId } });
  const context = await postAndActor(postId, userId);
  if (context)
    await notify({
      userId: context.post.authorId,
      actorId: userId,
      kind: 'LIKE',
      category: 'COMMUNITY',
      title: 'New like',
      body: `${context.actor.fullName} liked your post.`,
      href: context.href,
    });
  return true;
}

export async function addPostComment(
  userId: string,
  postId: string,
  body: string,
) {
  const text = body.trim();
  if (!text) throw new Error('Write something before replying.');
  if (text.length > 2000)
    throw new Error('A reply can be up to 2000 characters.');
  const comment = await prisma.postComment.create({
    data: { userId, postId, body: text },
  });
  const context = await postAndActor(postId, userId);
  if (context)
    await notify({
      userId: context.post.authorId,
      actorId: userId,
      kind: 'REPLY',
      category: 'COMMUNITY',
      title: 'New reply',
      body: `${context.actor.fullName} replied to your post.`,
      href: context.href,
    });
  return comment;
}

export async function deletePostComment(userId: string, commentId: string) {
  const comment = await prisma.postComment.findUnique({
    where: { id: commentId },
    select: { userId: true, post: { select: { authorId: true } } },
  });
  if (!comment) throw new Error('That reply is already gone.');
  if (comment.userId !== userId && comment.post.authorId !== userId)
    throw new Error('You can only remove your own reply.');
  await prisma.postComment.delete({ where: { id: commentId } });
}

function postInclude(viewerId: string | null) {
  return {
    author: {
      select: { id: true, fullName: true, username: true, avatarUrl: true },
    },
    group: { select: { id: true, name: true } },
    prompt: { select: { title: true } },
    story: { select: { id: true, title: true, coverUrl: true } },
    _count: { select: { likes: true, comments: true } },
    likes: viewerId
      ? { where: { userId: viewerId }, select: { userId: true } }
      : (false as const),
    comments: {
      orderBy: { createdAt: 'asc' as const },
      take: 5,
      include: {
        user: { select: { fullName: true, username: true, avatarUrl: true } },
      },
    },
  };
}

type PostRow = Prisma.PostGetPayload<{
  include: ReturnType<typeof postInclude>;
}>;

function toPost(row: PostRow, viewerId: string | null): CommunityPost {
  return {
    id: row.id,
    body: row.body,
    title: row.title,
    topic: row.topic,
    kind: row.kind,
    createdAt: row.createdAt,
    likes: row._count.likes,
    comments: row._count.comments,
    liked: Array.isArray(row.likes) ? row.likes.length > 0 : false,
    mine: row.authorId === viewerId,
    groupId: row.group?.id ?? null,
    groupName: row.group?.name ?? null,
    promptTitle: row.prompt?.title ?? null,
    story: row.story ?? null,
    author: {
      id: row.author.id,
      name: row.author.fullName,
      username: row.author.username,
      avatarUrl: row.author.avatarUrl,
    },
    replies: row.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: {
        name: comment.user.fullName,
        username: comment.user.username,
        avatarUrl: comment.user.avatarUrl,
      },
    })),
  };
}

export async function getFeed(options: {
  viewerId: string | null;
  following?: boolean;
  topic?: string;
  groupId?: string | null;
  authorId?: string;
  take?: number;
}): Promise<CommunityPost[]> {
  const where: Prisma.PostWhereInput = {
    groupId: options.groupId ?? null,
    ...(options.topic ? { topic: options.topic } : {}),
    ...(options.authorId ? { authorId: options.authorId } : {}),
  };
  if (options.following) {
    if (!options.viewerId) return [];
    const follows = await prisma.follow.findMany({
      where: { followerId: options.viewerId },
      select: { followingId: true },
    });
    where.authorId = { in: follows.map((row) => row.followingId) };
  }
  const rows = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.take ?? 25,
    include: postInclude(options.viewerId),
  });
  return rows.map((row) => toPost(row, options.viewerId));
}

export async function getPost(postId: string, viewerId: string | null) {
  const row = await prisma.post.findUnique({
    where: { id: postId },
    include: postInclude(viewerId),
  });
  return row ? toPost(row, viewerId) : null;
}

export async function getCurrentPrompt() {
  return prisma.prompt.findFirst({ orderBy: { weekOf: 'desc' } });
}
