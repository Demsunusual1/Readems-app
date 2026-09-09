import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  addComment,
  countComments,
  deleteComment,
  getComments,
  toggleCommentLike,
} from './comments';
import {
  createTestStory,
  createTestUser,
  deleteTestUsers,
} from '@/test/factories';

let authorId: string;
let readerId: string;
let otherId: string;
let chapterId: string;

beforeAll(async () => {
  authorId = (await createTestUser({ role: 'CREATOR' })).id;
  readerId = (await createTestUser()).id;
  otherId = (await createTestUser()).id;
  const story = await createTestStory(authorId);
  chapterId = (
    await prisma.chapter.findFirstOrThrow({
      where: { storyId: story.id },
    })
  ).id;
});

afterAll(async () => {
  await deleteTestUsers(authorId, readerId, otherId);
});

describe('chapter comments', () => {
  it('keeps replies under the comment they answer', async () => {
    const first = await addComment(readerId, chapterId, 'The ending got me.');
    await addComment(otherId, chapterId, 'It did the same to me.', first.id);

    const [thread] = await getComments(chapterId, readerId);
    expect(thread.body).toBe('The ending got me.');
    expect(thread.mine).toBe(true);
    expect(thread.replies).toHaveLength(1);
    expect(thread.replies[0].body).toBe('It did the same to me.');
    expect(thread.replies[0].mine).toBe(false);
    expect(await countComments(chapterId)).toBe(2);
  });

  it('refuses an empty comment and one that runs too long', async () => {
    await expect(addComment(readerId, chapterId, '   ')).rejects.toThrow();
    await expect(
      addComment(readerId, chapterId, 'x'.repeat(2001)),
    ).rejects.toThrow();
  });

  it('will not nest a reply under another reply', async () => {
    const [thread] = await getComments(chapterId, readerId);
    const reply = thread.replies[0];
    await expect(
      addComment(readerId, chapterId, 'Replying to a reply.', reply.id),
    ).rejects.toThrow();
  });

  it('counts a like once per reader', async () => {
    const [thread] = await getComments(chapterId, readerId);
    expect(await toggleCommentLike(otherId, thread.id)).toBe(true);
    expect(await toggleCommentLike(otherId, thread.id)).toBe(false);
    await toggleCommentLike(otherId, thread.id);

    const seenByOther = (await getComments(chapterId, otherId))[0];
    expect(seenByOther.likes).toBe(1);
    expect(seenByOther.liked).toBe(true);
    expect((await getComments(chapterId, readerId))[0].liked).toBe(false);
  });

  it('lets a reader delete their own comment but not somebody else’s', async () => {
    const [thread] = await getComments(chapterId, readerId);
    await expect(deleteComment(otherId, thread.id)).rejects.toThrow();
    await deleteComment(readerId, thread.id);
    expect(await countComments(chapterId)).toBe(0);
  });

  it('lets the story’s author remove a comment on their chapter', async () => {
    const comment = await addComment(otherId, chapterId, 'Off topic.');
    await deleteComment(authorId, comment.id);
    expect(await countComments(chapterId)).toBe(0);
  });
});
