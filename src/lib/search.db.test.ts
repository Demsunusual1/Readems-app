import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { search } from './search';
import { createPost } from './community';
import { createGroup } from './groups';
import {
  createTestStory,
  createTestUser,
  deleteTestUsers,
  uniqueSuffix,
} from '@/test/factories';

const word = `zephyrine${uniqueSuffix()}`;
let authorId: string;
let storyId: string;
let groupId: string;
let postId: string;

beforeAll(async () => {
  const author = await createTestUser({
    fullName: `Author ${word}`,
    role: 'CREATOR',
  });
  authorId = author.id;
  storyId = (await createTestStory(authorId, { title: `The ${word} Letters` }))
    .id;
  groupId = (
    await createGroup(authorId, {
      name: `${word} Circle`,
      tagline: 'A group for the test suite.',
      description: 'Nothing but tests.',
      topic: 'Community',
    })
  ).id;
  postId = (
    await createPost(authorId, { body: `A post mentioning ${word} once.` })
  ).id;
});

afterAll(async () => {
  await deleteTestUsers(authorId);
});

describe('search', () => {
  it('finds stories, people, groups and posts for one word', async () => {
    const results = await search(word, null);
    expect(results.stories.map((story) => story.id)).toEqual([storyId]);
    expect(results.people.map((person) => person.id)).toEqual([authorId]);
    expect(results.groups.map((group) => group.id)).toEqual([groupId]);
    expect(results.posts.map((post) => post.id)).toEqual([postId]);
    expect(results.total).toBe(4);
  });

  it('leads with the story when one matches', async () => {
    const results = await search(word, null);
    expect(results.top?.kind).toBe('story');
    expect(results.top?.href).toBe(`/stories/${storyId}`);
  });

  it('finds nothing for a term nobody used', async () => {
    const results = await search('quhwbdkzz', null);
    expect(results.total).toBe(0);
    expect(results.top).toBeNull();
  });

  it('returns nothing at all for an empty search', async () => {
    const results = await search('   ', null);
    expect(results.total).toBe(0);
    expect(results.stories).toEqual([]);
  });
});
