import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  countUnread,
  getNotifications,
  markAllRead,
  notify,
} from './notifications';
import { toggleFollow } from './people';
import { addComment } from './comments';
import { saveReview, toggleStoryLike } from './reviews';
import {
  createTestStory,
  createTestUser,
  deleteTestUsers,
} from '@/test/factories';

let authorId: string;
let readerId: string;
let storyId: string;
let chapterId: string;

beforeAll(async () => {
  authorId = (
    await createTestUser({
      fullName: 'Chinelo Author',
      role: 'CREATOR',
    })
  ).id;
  readerId = (await createTestUser({ fullName: 'Tunde Reader' })).id;
  const story = await createTestStory(authorId, { title: 'Notified Story' });
  storyId = story.id;
  chapterId = (await prisma.chapter.findFirstOrThrow({ where: { storyId } }))
    .id;
});

afterAll(async () => {
  await deleteTestUsers(authorId, readerId);
});

describe('notifications', () => {
  it('tells somebody when a reader follows them', async () => {
    await toggleFollow(readerId, authorId);
    const [latest] = await getNotifications(authorId);
    expect(latest.kind).toBe('FOLLOW');
    expect(latest.title).toBe('New follower');
    expect(latest.body).toContain('Tunde Reader');
    expect(latest.href).toBe(
      '/u/' +
        (await prisma.user.findUniqueOrThrow({ where: { id: readerId } }))
          .username,
    );
    expect(await countUnread(authorId)).toBe(1);
  });

  it('tells the author when somebody comments on their chapter', async () => {
    await addComment(readerId, chapterId, 'This chapter undid me.');
    const [latest] = await getNotifications(authorId);
    expect(latest.kind).toBe('COMMENT');
    expect(latest.category).toBe('CREATOR');
    expect(latest.href).toContain(`/stories/${storyId}/chapters/1`);
  });

  it('tells the author about a like and a review', async () => {
    await toggleStoryLike(readerId, storyId);
    expect((await getNotifications(authorId))[0].kind).toBe('LIKE');

    await saveReview(readerId, storyId, { rating: 5, body: 'Wonderful.' });
    expect((await getNotifications(authorId))[0].kind).toBe('REVIEW');
  });

  it('never tells somebody about their own doing', async () => {
    const before = await countUnread(authorId);
    await toggleStoryLike(authorId, storyId);
    expect(await countUnread(authorId)).toBe(before);
  });

  it('separates notifications by what they are about', async () => {
    const community = await getNotifications(authorId, {
      category: 'COMMUNITY',
    });
    expect(community.every((item) => item.category === 'COMMUNITY')).toBe(true);
    expect(community.map((item) => item.kind)).toContain('FOLLOW');
  });

  it('marks everything read once, and stays read', async () => {
    expect(await countUnread(authorId)).toBeGreaterThan(0);
    await markAllRead(authorId);
    expect(await countUnread(authorId)).toBe(0);
    expect((await getNotifications(authorId))[0].read).toBe(true);
  });

  it('refuses to deliver a notification with nowhere to go', async () => {
    await expect(
      notify({
        userId: authorId,
        kind: 'SYSTEM',
        category: 'READING',
        title: '',
        body: 'No title.',
        href: '/',
      }),
    ).rejects.toThrow();
  });
});
