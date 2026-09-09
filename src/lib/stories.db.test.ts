import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  getChapterByNumber,
  getPublishedChapters,
  getStory,
  listStories,
} from './stories';

const run = Math.random().toString(36).slice(2, 8);
const authorId = `author-${run}`;
const genre = `Genre ${run}`;
const published = `published-${run}`;
const draft = `draft-${run}`;
const scheduled = `scheduled-${run}`;

beforeAll(async () => {
  await prisma.user.create({
    data: {
      id: authorId,
      fullName: 'Ada Storyteller',
      username: `ada_${run}`,
      email: `ada_${run}@example.com`,
      passwordHash: 'scrypt:unused:unused',
      role: 'CREATOR',
      interests: [],
    },
  });
  await prisma.story.create({
    data: {
      id: published,
      title: 'A Published Story',
      synopsis: 'Readable today.',
      coverUrl: '/readems/story-baobab-cover.png',
      genre,
      tags: ['Drama', 'Family'],
      authorId,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 60_000),
      chapters: {
        create: [
          {
            number: 1,
            title: 'First Light',
            body: 'One paragraph.\n\nTwo paragraphs.',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 60_000),
          },
          {
            number: 2,
            title: 'Still Writing',
            body: 'Unfinished.',
            status: 'DRAFT',
          },
          {
            number: 3,
            title: 'Next Week',
            body: 'Queued.',
            status: 'SCHEDULED',
            scheduledFor: new Date(Date.now() + 86_400_000),
          },
        ],
      },
    },
  });
  await prisma.story.create({
    data: {
      id: draft,
      title: 'A Draft Story',
      synopsis: 'Not ready.',
      coverUrl: '/readems/story-baobab-cover.png',
      genre,
      tags: [],
      authorId,
      status: 'DRAFT',
    },
  });
  await prisma.story.create({
    data: {
      id: scheduled,
      title: 'A Scheduled Story',
      synopsis: 'Later.',
      coverUrl: '/readems/story-baobab-cover.png',
      genre,
      tags: [],
      authorId,
      status: 'SCHEDULED',
      scheduledFor: new Date(Date.now() + 86_400_000),
    },
  });
});

afterAll(async () => {
  await prisma.story.deleteMany({ where: { authorId } });
  await prisma.user.delete({ where: { id: authorId } });
});

describe('story catalogue', () => {
  it('lists only stories readers may open', async () => {
    const ids = (await listStories({ genre })).map((story) => story.id);
    expect(ids).toContain(published);
    expect(ids).not.toContain(draft);
    expect(ids).not.toContain(scheduled);
  });

  it('reports the author and the number of readable chapters', async () => {
    const story = await getStory(published);
    expect(story?.authorName).toBe('Ada Storyteller');
    expect(story?.authorUsername).toBe(`ada_${run}`);
    expect(story?.chapterCount).toBe(1);
  });

  it('hides unpublished stories from direct access', async () => {
    expect(await getStory(draft)).toBeNull();
    expect(await getStory(scheduled)).toBeNull();
  });

  it('returns published chapters in order with paragraphs split out', async () => {
    const chapters = await getPublishedChapters(published);
    expect(chapters.map((chapter) => chapter.number)).toEqual([1]);
    expect(chapters[0].paragraphs).toEqual([
      'One paragraph.',
      'Two paragraphs.',
    ]);
  });

  it('refuses chapters that are not published yet', async () => {
    expect(await getChapterByNumber(published, 1)).not.toBeNull();
    expect(await getChapterByNumber(published, 2)).toBeNull();
    expect(await getChapterByNumber(published, 3)).toBeNull();
  });

  it('searches titles and matches reader interests', async () => {
    const byTitle = await listStories({ query: 'a PUBLISHED story' });
    expect(byTitle.map((story) => story.id)).toContain(published);

    const byInterest = await listStories({ genre, interests: ['Family'] });
    expect(byInterest.map((story) => story.id)).toEqual([published]);

    const byOtherInterest = await listStories({ genre, interests: ['Poetry'] });
    expect(byOtherInterest).toHaveLength(0);
  });
});
