import { prisma } from './prisma';

export type ChapterComment = {
  id: string;
  body: string;
  createdAt: Date;
  likes: number;
  liked: boolean;
  mine: boolean;
  canRemove: boolean;
  author: { name: string; username: string; avatarUrl: string | null };
  replies: ChapterComment[];
};

const MAX_LENGTH = 2000;

export async function addComment(
  userId: string,
  chapterId: string,
  body: string,
  parentId?: string,
) {
  const text = body.trim();
  if (!text) throw new Error('Write something before posting.');
  if (text.length > MAX_LENGTH)
    throw new Error(`A comment can be up to ${MAX_LENGTH} characters.`);
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { chapterId: true, parentId: true },
    });
    if (!parent || parent.chapterId !== chapterId)
      throw new Error('That comment is not on this chapter.');
    // One level of replies keeps a conversation readable on a phone.
    if (parent.parentId) throw new Error('Reply to the first comment instead.');
  }
  return prisma.comment.create({
    data: { userId, chapterId, body: text, parentId: parentId ?? null },
  });
}

export async function deleteComment(userId: string, commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      userId: true,
      chapter: { select: { story: { select: { authorId: true } } } },
    },
  });
  if (!comment) throw new Error('That comment is already gone.');
  const allowed =
    comment.userId === userId || comment.chapter.story.authorId === userId;
  if (!allowed) throw new Error('You can only remove your own comment.');
  await prisma.comment.delete({ where: { id: commentId } });
}

export async function toggleCommentLike(userId: string, commentId: string) {
  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });
  if (existing) {
    await prisma.commentLike.delete({
      where: { userId_commentId: { userId, commentId } },
    });
    return false;
  }
  await prisma.commentLike.create({ data: { userId, commentId } });
  return true;
}

export async function countComments(chapterId: string) {
  return prisma.comment.count({ where: { chapterId } });
}

export async function getComments(
  chapterId: string,
  viewerId: string | null,
): Promise<ChapterComment[]> {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { story: { select: { authorId: true } } },
  });
  const storyAuthorId = chapter?.story.authorId ?? null;

  const rows = await prisma.comment.findMany({
    where: { chapterId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { fullName: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true } },
      likes: viewerId
        ? { where: { userId: viewerId }, select: { userId: true } }
        : false,
    },
  });

  const shape = (row: (typeof rows)[number]): ChapterComment => ({
    id: row.id,
    body: row.body,
    createdAt: row.createdAt,
    likes: row._count.likes,
    liked: Array.isArray(row.likes) ? row.likes.length > 0 : false,
    mine: row.userId === viewerId,
    canRemove:
      viewerId !== null &&
      (row.userId === viewerId || storyAuthorId === viewerId),
    author: {
      name: row.user.fullName,
      username: row.user.username,
      avatarUrl: row.user.avatarUrl,
    },
    replies: [],
  });

  const threads = new Map<string, ChapterComment>();
  const ordered: ChapterComment[] = [];
  for (const row of rows.filter((row) => !row.parentId)) {
    const comment = shape(row);
    threads.set(row.id, comment);
    ordered.push(comment);
  }
  for (const row of rows.filter((row) => row.parentId)) {
    threads.get(row.parentId as string)?.replies.push(shape(row));
  }
  return ordered;
}
