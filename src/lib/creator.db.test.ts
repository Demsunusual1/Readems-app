import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  createChapter,
  createStory,
  deleteChapter,
  getMyStories,
  getMyStory,
  publishChapter,
  publishStory,
  saveChapter,
  updateStory,
} from './creator';
import { getNotifications } from './notifications';
import { toggleFollow } from './people';
import { getChapterByNumber, getStory } from './stories';
import { createTestUser, deleteTestUsers } from '@/test/factories';

let creatorId: string;
let readerId: string;
let intruderId: string;
let storyId: string;

beforeAll(async () => {
  creatorId = (
    await createTestUser({ fullName: 'Tunde Adeyemi', role: 'CREATOR' })
  ).id;
  readerId = (await createTestUser({ fullName: 'A Follower' })).id;
  intruderId = (await createTestUser()).id;
  await toggleFollow(readerId, creatorId);
});

afterAll(async () => {
  await deleteTestUsers(creatorId, readerId, intruderId);
});

describe('writing a story', () => {
  it('starts as a draft that readers cannot open', async () => {
    const story = await createStory(creatorId, {
      title: 'The Last Train to Makoko',
      synopsis: 'A journalist returns home to uncover the truth.',
      genre: 'Mystery',
      coverUrl: '/readems/cover-last-train-to-makoko.png',
    });
    storyId = story.id;
    expect(storyId).toMatch(/^the-last-train-to-makoko/);
    expect(story.status).toBe('DRAFT');
    expect(await getStory(storyId)).toBeNull();

    const mine = await getMyStories(creatorId);
    expect(mine.drafts.map((item) => item.id)).toContain(storyId);
    expect(mine.published).toHaveLength(0);
  });

  it('refuses a story without a title', async () => {
    await expect(
      createStory(creatorId, { title: ' ', synopsis: 'x', genre: 'Drama' }),
    ).rejects.toThrow();
  });

  it('keeps other people out of a story that is not theirs', async () => {
    await expect(
      updateStory(intruderId, storyId, { title: 'Mine now' }),
    ).rejects.toThrow();
    expect(await getMyStory(intruderId, storyId)).toBeNull();
  });

  it('writes a chapter, saves it again, and keeps it unpublished', async () => {
    const chapter = await createChapter(creatorId, storyId, {
      title: 'Crossroads',
      body: 'The train screeched into Makoko.',
    });
    expect(chapter.number).toBe(1);

    await saveChapter(creatorId, chapter.id, {
      title: 'Crossroads',
      body: 'The train screeched into Makoko.\n\nSteam curled around the rails.',
    });
    const stored = await prisma.chapter.findUniqueOrThrow({
      where: { id: chapter.id },
    });
    expect(stored.body).toContain('Steam curled');
    expect(stored.status).toBe('DRAFT');
    expect(await getChapterByNumber(storyId, 1)).toBeNull();
  });

  it('publishes the story and its chapter, and readers can open them', async () => {
    await publishStory(creatorId, storyId);
    const chapter = await prisma.chapter.findFirstOrThrow({
      where: { storyId },
    });
    await publishChapter(creatorId, chapter.id);

    expect((await getStory(storyId))?.title).toBe('The Last Train to Makoko');
    expect((await getChapterByNumber(storyId, 1))?.title).toBe('Crossroads');

    const mine = await getMyStories(creatorId);
    expect(mine.published.map((item) => item.id)).toContain(storyId);
  });

  it('counts a story with a chapter waiting to go out as scheduled', async () => {
    // A published story with a chapter queued for later is work in the
    // pipeline, and the writer's shelf is where they look for it.
    const later = await createChapter(creatorId, storyId, {
      title: 'The Platform at Dawn',
      body: 'The first train had not come yet.',
    });
    await publishChapter(
      creatorId,
      later.id,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    try {
      const mine = await getMyStories(creatorId);
      expect(mine.scheduled.map((item) => item.id)).toContain(storyId);
    } finally {
      await prisma.chapter.delete({ where: { id: later.id } });
    }
  });

  it('tells the writer’s followers about a published chapter', async () => {
    const second = await createChapter(creatorId, storyId, {
      title: 'The Confession',
      body: 'She had been waiting on the platform for an hour.',
    });
    await publishChapter(creatorId, second.id);

    const [latest] = await getNotifications(readerId);
    expect(latest.kind).toBe('CHAPTER');
    expect(latest.body).toContain('The Last Train to Makoko');
    expect(latest.href).toBe(`/stories/${storyId}/chapters/2`);
  });

  it('schedules a chapter for later, and it stays closed until then', async () => {
    const third = await createChapter(creatorId, storyId, {
      title: 'No Turning Back',
      body: 'The last carriage was empty.',
    });
    await publishChapter(
      creatorId,
      third.id,
      new Date(Date.now() + 86_400_000),
    );
    expect(await getChapterByNumber(storyId, 3)).toBeNull();

    const mine = await getMyStory(creatorId, storyId);
    expect(mine?.chapters.find((c) => c.number === 3)?.status).toBe(
      'SCHEDULED',
    );
  });

  it('counts words so the editor can show them', async () => {
    const mine = await getMyStory(creatorId, storyId);
    const first = mine?.chapters.find((chapter) => chapter.number === 1);
    expect(first?.words).toBe(10);
  });

  it('removes a chapter and renumbers nothing behind it', async () => {
    const mine = await getMyStory(creatorId, storyId);
    const third = mine!.chapters.find((chapter) => chapter.number === 3)!;
    await deleteChapter(creatorId, third.id);
    const after = await getMyStory(creatorId, storyId);
    expect(after?.chapters.map((chapter) => chapter.number)).toEqual([1, 2]);
  });
});
