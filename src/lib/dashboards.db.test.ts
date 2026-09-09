import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  countReadersByStory,
  getAudienceActivity,
  getCommunityPulse,
  getReadingStreak,
  getRecommendations,
  getScheduledChapters,
  getSpotlightCreator,
  getTrendingSerials,
  streakFromDays,
} from './dashboards';
import {
  createTestStory,
  createTestUser,
  deleteTestUsers,
} from '@/test/factories';

const DAY = 86_400_000;
const daysAgo = (count: number) => new Date(Date.now() - count * DAY);

const created: string[] = [];

async function newUser(
  overrides: Parameters<typeof createTestUser>[0] = {},
): Promise<string> {
  const user = await createTestUser(overrides);
  created.push(user.id);
  return user.id;
}

afterAll(async () => {
  await deleteTestUsers(...created);
});

describe('streakFromDays', () => {
  it('is zero when nothing has been read', () => {
    expect(streakFromDays([])).toBe(0);
  });

  it('counts today alone as one day', () => {
    expect(streakFromDays([daysAgo(0)])).toBe(1);
  });

  it('counts consecutive days back from today', () => {
    expect(streakFromDays([daysAgo(0), daysAgo(1), daysAgo(2)])).toBe(3);
  });

  it('ignores several reads on the same day', () => {
    expect(streakFromDays([daysAgo(0), daysAgo(0), daysAgo(1)])).toBe(2);
  });

  it('stops at the first missed day', () => {
    expect(streakFromDays([daysAgo(0), daysAgo(2), daysAgo(3)])).toBe(1);
  });

  it('still counts a run that ended yesterday, before today is over', () => {
    expect(streakFromDays([daysAgo(1), daysAgo(2)])).toBe(2);
  });

  it('is zero once two whole days have passed', () => {
    expect(streakFromDays([daysAgo(2), daysAgo(3)])).toBe(0);
  });
});

describe('getReadingStreak', () => {
  it('reports no streak for a reader who has never read', async () => {
    const readerId = await newUser();
    expect(await getReadingStreak(readerId)).toEqual({
      days: 0,
      lastReadAt: null,
    });
  });

  it('counts consecutive days of reading across stories', async () => {
    const authorId = await newUser({ role: 'CREATOR' });
    const readerId = await newUser();
    const stories = await Promise.all([
      createTestStory(authorId),
      createTestStory(authorId),
      createTestStory(authorId),
      createTestStory(authorId),
    ]);
    const ages = [0, 1, 2, 5];
    for (const [index, story] of stories.entries())
      await prisma.readingProgress.create({
        data: {
          userId: readerId,
          storyId: story.id,
          chapter: 1,
          paragraph: 1,
          percent: 20,
          startedAt: daysAgo(ages[index]),
          updatedAt: daysAgo(ages[index]),
        },
      });

    const streak = await getReadingStreak(readerId);
    expect(streak.days).toBe(3);
    expect(streak.lastReadAt).not.toBeNull();
  });

  it('counts the day a story was finished, not only the day it was touched', async () => {
    const authorId = await newUser({ role: 'CREATOR' });
    const readerId = await newUser();
    const story = await createTestStory(authorId);
    await prisma.readingProgress.create({
      data: {
        userId: readerId,
        storyId: story.id,
        chapter: 1,
        paragraph: 1,
        percent: 100,
        completed: true,
        startedAt: daysAgo(9),
        completedAt: daysAgo(0),
        updatedAt: daysAgo(9),
      },
    });
    expect((await getReadingStreak(readerId)).days).toBe(1);
  });
});

describe('getTrendingSerials', () => {
  it('ranks stories by how many people started them in the window', async () => {
    const authorId = await newUser({ role: 'CREATOR' });
    const busy = await createTestStory(authorId, { title: 'Busy Serial' });
    const quiet = await createTestStory(authorId, { title: 'Quiet Serial' });
    const readers = await Promise.all([newUser(), newUser(), newUser()]);
    for (const readerId of readers)
      await prisma.readingProgress.create({
        data: {
          userId: readerId,
          storyId: busy.id,
          chapter: 1,
          paragraph: 1,
          startedAt: daysAgo(1),
        },
      });

    const trending = await getTrendingSerials({ days: 30, limit: 100 });
    const busyRow = trending.find((story) => story.id === busy.id);
    expect(busyRow?.readers).toBe(3);
    expect(busyRow?.chapterCount).toBe(1);
    expect(trending.some((story) => story.id === quiet.id)).toBe(false);
  });

  it('ignores reads that fall outside the window', async () => {
    const authorId = await newUser({ role: 'CREATOR' });
    const readerId = await newUser();
    const story = await createTestStory(authorId, { title: 'Old News' });
    await prisma.readingProgress.create({
      data: {
        userId: readerId,
        storyId: story.id,
        chapter: 1,
        paragraph: 1,
        startedAt: daysAgo(40),
      },
    });
    const trending = await getTrendingSerials({ days: 30, limit: 100 });
    expect(trending.some((row) => row.id === story.id)).toBe(false);
  });
});

describe('countReadersByStory', () => {
  it('counts one reader per story and leaves unread stories out', async () => {
    const authorId = await newUser({ role: 'CREATOR' });
    const read = await createTestStory(authorId);
    const unread = await createTestStory(authorId);
    const readers = await Promise.all([newUser(), newUser()]);
    for (const readerId of readers)
      await prisma.readingProgress.create({
        data: { userId: readerId, storyId: read.id, chapter: 1, paragraph: 1 },
      });

    const counts = await countReadersByStory([read.id, unread.id]);
    expect(counts.get(read.id)).toBe(2);
    expect(counts.get(unread.id)).toBeUndefined();
  });

  it('asks the database nothing when there are no stories', async () => {
    expect((await countReadersByStory([])).size).toBe(0);
  });
});

describe('getRecommendations', () => {
  it('suggests unread stories in the reader’s interests', async () => {
    const authorId = await newUser({ role: 'CREATOR' });
    const readerId = await newUser({ interests: ['Fantasy'] });
    const unread = await createTestStory(authorId, {
      title: 'Unread Fantasy',
      genre: 'Fantasy',
    });
    const alreadyRead = await createTestStory(authorId, {
      title: 'Read Fantasy',
      genre: 'Fantasy',
    });
    const ownWork = await createTestStory(readerId, {
      title: 'My Own Fantasy',
      genre: 'Fantasy',
    });
    await prisma.readingProgress.create({
      data: {
        userId: readerId,
        storyId: alreadyRead.id,
        chapter: 1,
        paragraph: 1,
      },
    });

    const suggestions = await getRecommendations(readerId, ['Fantasy'], 20);
    const ids = suggestions.map((story) => story.id);
    expect(ids).toContain(unread.id);
    expect(ids).not.toContain(alreadyRead.id);
    expect(ids).not.toContain(ownWork.id);
  });

  it('returns nothing rather than guessing when there is no match', async () => {
    const readerId = await newUser();
    expect(
      await getRecommendations(readerId, ['A Genre Nobody Writes'], 6),
    ).toEqual([]);
  });
});

describe('getCommunityPulse', () => {
  it('moves with the rows it counts', async () => {
    const before = await getCommunityPulse();

    const authorId = await newUser({ role: 'CREATOR' });
    const readerId = await newUser();
    const story = await createTestStory(authorId, { title: 'Pulse Story' });
    await prisma.readingProgress.create({
      data: { userId: readerId, storyId: story.id, chapter: 1, paragraph: 1 },
    });
    const chapter = await prisma.chapter.findFirstOrThrow({
      where: { storyId: story.id },
    });
    await prisma.comment.create({
      data: { userId: readerId, chapterId: chapter.id, body: 'Lovely.' },
    });

    const after = await getCommunityPulse();
    expect(after.activeReaders).toBe(before.activeReaders + 1);
    expect(after.storiesShared).toBe(before.storiesShared + 1);
    expect(after.commentsToday).toBe(before.commentsToday + 1);
  });
});

describe('getSpotlightCreator', () => {
  it('picks the most-followed account that has a published story', async () => {
    const spotlight = await getSpotlightCreator();
    const candidates = await prisma.user.findMany({
      where: { stories: { some: { status: 'PUBLISHED' } } },
      select: { _count: { select: { followers: true } } },
    });
    const best = Math.max(0, ...candidates.map((row) => row._count.followers));

    if (candidates.length === 0) {
      expect(spotlight).toBeNull();
      return;
    }
    expect(spotlight).not.toBeNull();
    expect(spotlight?.followers).toBe(best);
    expect(spotlight?.publishedWorks).toBeGreaterThan(0);
  });
});

describe('getScheduledChapters', () => {
  it('lists only chapters still waiting for their date, soonest first', async () => {
    const authorId = await newUser({ role: 'CREATOR' });
    const story = await createTestStory(authorId, { title: 'Serialised' });
    await prisma.chapter.createMany({
      data: [
        {
          storyId: story.id,
          number: 3,
          title: 'Later',
          body: 'x',
          status: 'SCHEDULED',
          scheduledFor: new Date(Date.now() + 14 * DAY),
        },
        {
          storyId: story.id,
          number: 2,
          title: 'Sooner',
          body: 'x',
          status: 'SCHEDULED',
          scheduledFor: new Date(Date.now() + 7 * DAY),
        },
      ],
    });

    const scheduled = await getScheduledChapters(authorId, 10);
    expect(scheduled.map((chapter) => chapter.title)).toEqual([
      'Sooner',
      'Later',
    ]);
    expect(scheduled[0].storyTitle).toBe('Serialised');
    expect(scheduled[0].storyId).toBe(story.id);
  });

  it('is empty for a writer with nothing queued', async () => {
    const authorId = await newUser({ role: 'CREATOR' });
    await createTestStory(authorId);
    expect(await getScheduledChapters(authorId, 10)).toEqual([]);
  });
});

describe('getAudienceActivity', () => {
  it('counts reads, likes, comments and follows inside the window only', async () => {
    const authorId = await newUser({ role: 'CREATOR' });
    const recent = await newUser();
    const old = await newUser();
    const story = await createTestStory(authorId, { title: 'Audience Story' });
    const chapter = await prisma.chapter.findFirstOrThrow({
      where: { storyId: story.id },
    });

    await prisma.readingProgress.create({
      data: {
        userId: recent,
        storyId: story.id,
        chapter: 1,
        paragraph: 1,
        startedAt: daysAgo(1),
      },
    });
    await prisma.readingProgress.create({
      data: {
        userId: old,
        storyId: story.id,
        chapter: 1,
        paragraph: 1,
        startedAt: daysAgo(20),
      },
    });
    await prisma.storyLike.create({
      data: { userId: recent, storyId: story.id, createdAt: daysAgo(2) },
    });
    await prisma.storyLike.create({
      data: { userId: old, storyId: story.id, createdAt: daysAgo(20) },
    });
    await prisma.comment.create({
      data: {
        userId: recent,
        chapterId: chapter.id,
        body: 'Recent.',
        createdAt: daysAgo(3),
      },
    });
    await prisma.follow.create({
      data: {
        followerId: recent,
        followingId: authorId,
        createdAt: daysAgo(2),
      },
    });
    await prisma.follow.create({
      data: { followerId: old, followingId: authorId, createdAt: daysAgo(30) },
    });

    const activity = await getAudienceActivity(authorId, 7);
    expect(activity).toEqual({
      days: 7,
      reads: 1,
      likes: 1,
      comments: 1,
      newFollowers: 1,
    });
  });
});
