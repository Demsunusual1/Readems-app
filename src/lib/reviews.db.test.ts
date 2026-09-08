import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  getReviews,
  getStoryReaction,
  saveReview,
  deleteReview,
  toggleReviewLike,
  toggleStoryLike,
} from './reviews';
import {
  createTestStory,
  createTestUser,
  deleteTestUsers,
} from '@/test/factories';

let authorId: string;
let readerId: string;
let otherId: string;
let storyId: string;

beforeAll(async () => {
  authorId = (await createTestUser({ role: 'CREATOR' })).id;
  readerId = (await createTestUser()).id;
  otherId = (await createTestUser()).id;
  storyId = (await createTestStory(authorId)).id;
});

afterAll(async () => {
  await deleteTestUsers(authorId, readerId, otherId);
});

describe('likes and reviews', () => {
  it('counts a like once per reader and lets it be taken back', async () => {
    expect(await toggleStoryLike(readerId, storyId)).toBe(true);
    expect(await toggleStoryLike(otherId, storyId)).toBe(true);

    const reaction = await getStoryReaction(storyId, readerId);
    expect(reaction.likes).toBe(2);
    expect(reaction.liked).toBe(true);

    expect(await toggleStoryLike(readerId, storyId)).toBe(false);
    expect((await getStoryReaction(storyId, readerId)).likes).toBe(1);
    expect((await getStoryReaction(storyId, readerId)).liked).toBe(false);
  });

  it('averages the ratings that readers actually left', async () => {
    await saveReview(readerId, storyId, {
      rating: 5,
      body: 'It stayed with me long after the last page.',
    });
    await saveReview(otherId, storyId, { rating: 4 });

    const reaction = await getStoryReaction(storyId, readerId);
    expect(reaction.ratingCount).toBe(2);
    expect(reaction.rating).toBe(4.5);
  });

  it('keeps one review per reader, editable afterwards', async () => {
    await saveReview(readerId, storyId, { rating: 3, body: 'On reflection.' });
    const reviews = await getReviews(storyId, readerId);
    const mine = reviews.filter((review) => review.author.id === readerId);
    expect(mine).toHaveLength(1);
    expect(mine[0].rating).toBe(3);
    expect(mine[0].body).toBe('On reflection.');
    expect(mine[0].mine).toBe(true);
  });

  it('refuses a rating outside one to five', async () => {
    await expect(
      saveReview(readerId, storyId, { rating: 0 }),
    ).rejects.toThrow();
    await expect(
      saveReview(readerId, storyId, { rating: 6 }),
    ).rejects.toThrow();
  });

  it('counts a like on a review and tells the reader they left it', async () => {
    const review = (await getReviews(storyId, readerId)).find(
      (item) => item.author.id === readerId,
    )!;
    expect(await toggleReviewLike(otherId, review.id)).toBe(true);

    const seenByOther = (await getReviews(storyId, otherId)).find(
      (item) => item.id === review.id,
    );
    expect(seenByOther?.likes).toBe(1);
    expect(seenByOther?.liked).toBe(true);
    expect(seenByOther?.mine).toBe(false);

    const seenByReader = (await getReviews(storyId, readerId)).find(
      (item) => item.id === review.id,
    );
    expect(seenByReader?.liked).toBe(false);
  });

  it('removes a review, and the average with it', async () => {
    await deleteReview(readerId, storyId);
    const reaction = await getStoryReaction(storyId, readerId);
    expect(reaction.ratingCount).toBe(1);
    expect(reaction.rating).toBe(4);
  });

  it('reports no rating at all when nobody has left one', async () => {
    const empty = await createTestStory(authorId);
    const reaction = await getStoryReaction(empty.id, readerId);
    expect(reaction.rating).toBeNull();
    expect(reaction.ratingCount).toBe(0);
    expect(reaction.likes).toBe(0);
  });
});
