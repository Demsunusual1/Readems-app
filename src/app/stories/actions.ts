'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  deleteReview,
  saveReview,
  toggleReviewLike,
  toggleStoryLike,
} from '@/lib/reviews';

export type StoryActionResult = {
  ok: boolean;
  message?: string;
  liked?: boolean;
};

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in to join the conversation.');
  return user;
}

function failure(error: unknown): StoryActionResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : 'That did not work. Try again.',
  };
}

export async function likeStory(storyId: string): Promise<StoryActionResult> {
  try {
    const user = await requireUser();
    const liked = await toggleStoryLike(user.id, storyId);
    revalidatePath(`/stories/${storyId}`);
    return { ok: true, liked };
  } catch (error) {
    return failure(error);
  }
}

export async function likeReview(
  reviewId: string,
  storyId: string,
): Promise<StoryActionResult> {
  try {
    const user = await requireUser();
    const liked = await toggleReviewLike(user.id, reviewId);
    revalidatePath(`/stories/${storyId}`);
    return { ok: true, liked };
  } catch (error) {
    return failure(error);
  }
}

export async function submitReview(
  storyId: string,
  _previous: StoryActionResult | null,
  formData: FormData,
): Promise<StoryActionResult> {
  try {
    const user = await requireUser();
    await saveReview(user.id, storyId, {
      rating: Number(formData.get('rating')),
      body: String(formData.get('body') ?? ''),
    });
    revalidatePath(`/stories/${storyId}`);
    return { ok: true, message: 'Thank you for the review.' };
  } catch (error) {
    return failure(error);
  }
}

export async function removeReview(
  storyId: string,
): Promise<StoryActionResult> {
  try {
    const user = await requireUser();
    await deleteReview(user.id, storyId);
    revalidatePath(`/stories/${storyId}`);
    return { ok: true, message: 'Your review was removed.' };
  } catch (error) {
    return failure(error);
  }
}
