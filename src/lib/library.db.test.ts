import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  addToReadingList,
  createReadingList,
  getReadingGoal,
  getReadingLists,
  getShelf,
  isInLibrary,
  removeFromLibrary,
  removeFromReadingList,
  saveToLibrary,
  setReadingGoal,
} from './library';
import {
  createTestStory,
  createTestUser,
  deleteTestUsers,
} from '@/test/factories';

let readerId: string;
let authorId: string;
let reading: string;
let saved: string;
let finished: string;

beforeAll(async () => {
  const reader = await createTestUser();
  const author = await createTestUser({ role: 'CREATOR' });
  readerId = reader.id;
  authorId = author.id;
  reading = (
    await createTestStory(authorId, {
      title: 'Still Reading',
      chapters: [
        { title: 'One', body: 'A.\n\nB.' },
        { title: 'Two', body: 'C.\n\nD.' },
      ],
    })
  ).id;
  saved = (await createTestStory(authorId, { title: 'Saved For Later' })).id;
  finished = (await createTestStory(authorId, { title: 'All Done' })).id;

  await prisma.readingProgress.create({
    data: {
      userId: readerId,
      storyId: reading,
      chapter: 1,
      paragraph: 1,
      completed: true,
      percent: 50,
    },
  });
  await prisma.readingProgress.create({
    data: {
      userId: readerId,
      storyId: finished,
      chapter: 1,
      paragraph: 1,
      completed: true,
      percent: 100,
      completedAt: new Date(),
    },
  });
});

afterAll(async () => {
  await deleteTestUsers(readerId, authorId);
});

describe('a reader’s library', () => {
  it('separates what is being read, saved and finished', async () => {
    await saveToLibrary(readerId, saved);
    const shelf = await getShelf(readerId);

    expect(shelf.current.map((entry) => entry.story.id)).toEqual([reading]);
    expect(shelf.current[0].percent).toBe(50);
    expect(shelf.saved.map((entry) => entry.story.id)).toEqual([saved]);
    expect(shelf.completed.map((entry) => entry.story.id)).toEqual([finished]);
  });

  it('saves and unsaves a story without duplicating it', async () => {
    await saveToLibrary(readerId, reading);
    await saveToLibrary(readerId, reading);
    expect(await isInLibrary(readerId, reading)).toBe(true);
    expect(
      await prisma.libraryItem.count({
        where: { userId: readerId, storyId: reading },
      }),
    ).toBe(1);

    await removeFromLibrary(readerId, reading);
    expect(await isInLibrary(readerId, reading)).toBe(false);
  });

  it('keeps a story that is being read out of the saved shelf', async () => {
    await saveToLibrary(readerId, reading);
    const shelf = await getShelf(readerId);
    expect(shelf.saved.map((entry) => entry.story.id)).not.toContain(reading);
    expect(shelf.current.map((entry) => entry.story.id)).toContain(reading);
    // It is still saved, and the shelf says so, so the control that removes it
    // shows the right state.
    expect(shelf.current[0].saved).toBe(true);
    await removeFromLibrary(readerId, reading);
    expect((await getShelf(readerId)).current[0].saved).toBe(false);
  });

  it('collects stories into named reading lists', async () => {
    const list = await createReadingList(readerId, {
      title: 'African Voices',
      description: 'Stories that centre our voices.',
      isPublic: true,
    });
    await addToReadingList(readerId, list.id, reading);
    await addToReadingList(readerId, list.id, saved);
    await addToReadingList(readerId, list.id, saved);

    const [stored] = await getReadingLists(readerId);
    expect(stored.title).toBe('African Voices');
    expect(stored.isPublic).toBe(true);
    expect(stored.count).toBe(2);
    expect(stored.covers).toHaveLength(2);

    await removeFromReadingList(readerId, list.id, saved);
    expect((await getReadingLists(readerId))[0].count).toBe(1);
  });

  it('refuses to change a list that belongs to somebody else', async () => {
    const other = await createTestUser();
    const list = await createReadingList(other.id, { title: 'Theirs' });
    await expect(
      addToReadingList(readerId, list.id, reading),
    ).rejects.toThrow();
    await deleteTestUsers(other.id);
  });

  it('reports the annual reading goal against stories actually finished', async () => {
    const initial = await getReadingGoal(readerId);
    expect(initial.finished).toBe(1);
    expect(initial.target).toBeGreaterThan(0);

    const updated = await setReadingGoal(readerId, 24);
    expect(updated.target).toBe(24);
    expect((await getReadingGoal(readerId)).percent).toBe(4);
  });

  it('refuses a goal that is not a sensible number of books', async () => {
    await expect(setReadingGoal(readerId, 0)).rejects.toThrow();
    await expect(setReadingGoal(readerId, 1001)).rejects.toThrow();
  });
});
