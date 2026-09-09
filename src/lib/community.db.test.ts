import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  addPostComment,
  createPost,
  deletePost,
  getFeed,
  getPost,
  togglePostLike,
} from './community';
import { toggleFollow } from './people';
import { createTestUser, deleteTestUsers } from '@/test/factories';

let writerId: string;
let readerId: string;
let strangerId: string;
let postId: string;

beforeAll(async () => {
  writerId = (await createTestUser({ fullName: 'Nia Writes' })).id;
  readerId = (await createTestUser({ fullName: 'Kwame Reads' })).id;
  strangerId = (await createTestUser({ fullName: 'Distant Person' })).id;
  await toggleFollow(readerId, writerId);
});

afterAll(async () => {
  await deleteTestUsers(writerId, readerId, strangerId);
});

describe('the community feed', () => {
  it('posts a thought and shows it to everyone', async () => {
    const post = await createPost(writerId, {
      body: 'Just finished Whispers of the Lagoon. Stunning imagery.',
      topic: 'Books',
    });
    postId = post.id;

    const feed = await getFeed({ viewerId: readerId });
    const mine = feed.find((item) => item.id === postId);
    expect(mine?.body).toContain('Stunning imagery');
    expect(mine?.author.name).toBe('Nia Writes');
    expect(mine?.likes).toBe(0);
    expect(mine?.comments).toBe(0);
  });

  it('refuses an empty post', async () => {
    await expect(createPost(writerId, { body: '   ' })).rejects.toThrow();
  });

  it('narrows the feed to the people a reader follows', async () => {
    const stranger = await createPost(strangerId, {
      body: 'A post from somebody unrelated.',
    });

    const following = await getFeed({ viewerId: readerId, following: true });
    expect(following.map((item) => item.id)).toContain(postId);
    expect(following.map((item) => item.id)).not.toContain(stranger.id);
  });

  it('narrows the feed to a topic', async () => {
    const feed = await getFeed({ viewerId: readerId, topic: 'Books' });
    expect(feed.every((item) => item.topic === 'Books')).toBe(true);
    expect(feed.map((item) => item.id)).toContain(postId);
  });

  it('counts likes once per person', async () => {
    expect(await togglePostLike(readerId, postId)).toBe(true);
    expect(await togglePostLike(readerId, postId)).toBe(false);
    await togglePostLike(readerId, postId);

    const post = await getPost(postId, readerId);
    expect(post?.likes).toBe(1);
    expect(post?.liked).toBe(true);
    expect((await getPost(postId, strangerId))?.liked).toBe(false);
  });

  it('keeps replies with the post they answer', async () => {
    await addPostComment(readerId, postId, 'It stayed with me too.');
    const post = await getPost(postId, readerId);
    expect(post?.comments).toBe(1);
    expect(post?.replies[0].body).toBe('It stayed with me too.');
    expect(post?.replies[0].author.name).toBe('Kwame Reads');
  });

  it('lets only the author remove a post', async () => {
    await expect(deletePost(strangerId, postId)).rejects.toThrow();
    await deletePost(writerId, postId);
    expect(await getPost(postId, readerId)).toBeNull();
  });
});
