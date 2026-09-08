'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  addPostComment,
  createPost,
  deletePost,
  deletePostComment,
  togglePostLike,
} from '@/lib/community';

export type CommunityResult = {
  ok: boolean;
  message?: string;
  liked?: boolean;
};

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in to join the conversation.');
  return user;
}

function failure(error: unknown): CommunityResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : 'That did not work. Try again.',
  };
}

function refresh(groupId?: string | null) {
  revalidatePath('/community');
  if (groupId) revalidatePath(`/groups/${groupId}`);
}

export async function publishPost(
  groupId: string | null,
  promptId: string | null,
  _previous: CommunityResult | null,
  formData: FormData,
): Promise<CommunityResult> {
  try {
    const user = await requireUser();
    await createPost(user.id, {
      body: String(formData.get('body') ?? ''),
      title: String(formData.get('title') ?? '') || undefined,
      topic: String(formData.get('topic') ?? '') || undefined,
      groupId: groupId ?? undefined,
      promptId: promptId ?? undefined,
    });
    refresh(groupId);
    return { ok: true, message: 'Posted.' };
  } catch (error) {
    return failure(error);
  }
}

export async function likePost(
  postId: string,
  groupId?: string | null,
): Promise<CommunityResult> {
  try {
    const user = await requireUser();
    const liked = await togglePostLike(user.id, postId);
    refresh(groupId);
    return { ok: true, liked };
  } catch (error) {
    return failure(error);
  }
}

export async function replyToPost(
  postId: string,
  groupId: string | null,
  _previous: CommunityResult | null,
  formData: FormData,
): Promise<CommunityResult> {
  try {
    const user = await requireUser();
    await addPostComment(user.id, postId, String(formData.get('body') ?? ''));
    refresh(groupId);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function removePost(
  postId: string,
  groupId?: string | null,
): Promise<CommunityResult> {
  try {
    const user = await requireUser();
    await deletePost(user.id, postId);
    refresh(groupId);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function removeReply(
  commentId: string,
  groupId?: string | null,
): Promise<CommunityResult> {
  try {
    const user = await requireUser();
    await deletePostComment(user.id, commentId);
    refresh(groupId);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
