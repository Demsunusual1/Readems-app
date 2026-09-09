'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  createChapter,
  createStory,
  deleteChapter,
  deleteStory,
  publishChapter,
  publishStory,
  saveChapter,
  unpublishChapter,
  unpublishStory,
  updateStory,
} from '@/lib/creator';

export type CreatorResult = {
  ok: boolean;
  message?: string;
  storyId?: string;
  chapterId?: string;
  savedAt?: string;
};

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in to write on Readems.');
  return user;
}

function failure(error: unknown): CreatorResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : 'That did not work. Try again.',
  };
}

function refresh(storyId?: string) {
  revalidatePath('/creator/stories');
  revalidatePath('/creator/dashboard');
  if (storyId) {
    revalidatePath(`/creator/stories/${storyId}`);
    revalidatePath(`/stories/${storyId}`);
  }
}

export async function startStory(
  _previous: CreatorResult | null,
  formData: FormData,
): Promise<CreatorResult> {
  try {
    const user = await requireUser();
    const story = await createStory(user.id, {
      title: String(formData.get('title') ?? ''),
      synopsis: String(formData.get('synopsis') ?? ''),
      genre: String(formData.get('genre') ?? 'Drama'),
      coverUrl: String(formData.get('coverUrl') ?? '') || undefined,
      audience: String(formData.get('audience') ?? '') || undefined,
      tags: String(formData.get('tags') ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    refresh(story.id);
    return { ok: true, storyId: story.id };
  } catch (error) {
    return failure(error);
  }
}

export async function editStory(
  storyId: string,
  _previous: CreatorResult | null,
  formData: FormData,
): Promise<CreatorResult> {
  try {
    const user = await requireUser();
    await updateStory(user.id, storyId, {
      title: String(formData.get('title') ?? ''),
      synopsis: String(formData.get('synopsis') ?? ''),
      genre: String(formData.get('genre') ?? 'Drama'),
      coverUrl: String(formData.get('coverUrl') ?? '') || undefined,
      audience: String(formData.get('audience') ?? '') || undefined,
      tags: String(formData.get('tags') ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    refresh(storyId);
    return { ok: true, message: 'Saved.' };
  } catch (error) {
    return failure(error);
  }
}

export async function setStoryPublished(
  storyId: string,
  published: boolean,
): Promise<CreatorResult> {
  try {
    const user = await requireUser();
    if (published) await publishStory(user.id, storyId);
    else await unpublishStory(user.id, storyId);
    refresh(storyId);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function removeStory(storyId: string): Promise<CreatorResult> {
  try {
    const user = await requireUser();
    await deleteStory(user.id, storyId);
    refresh();
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function addChapter(
  storyId: string,
  _previous: CreatorResult | null,
  formData: FormData,
): Promise<CreatorResult> {
  try {
    const user = await requireUser();
    const chapter = await createChapter(user.id, storyId, {
      title: String(formData.get('title') ?? ''),
    });
    refresh(storyId);
    return { ok: true, chapterId: chapter.id };
  } catch (error) {
    return failure(error);
  }
}

export async function saveChapterDraft(
  chapterId: string,
  storyId: string,
  input: { title: string; body: string; authorNote?: string },
): Promise<CreatorResult> {
  try {
    const user = await requireUser();
    await saveChapter(user.id, chapterId, input);
    refresh(storyId);
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (error) {
    return failure(error);
  }
}

export async function setChapterPublished(
  chapterId: string,
  storyId: string,
  published: boolean,
  when?: string,
): Promise<CreatorResult> {
  try {
    const user = await requireUser();
    if (published)
      await publishChapter(
        user.id,
        chapterId,
        when ? new Date(when) : undefined,
      );
    else await unpublishChapter(user.id, chapterId);
    refresh(storyId);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function removeChapter(
  chapterId: string,
  storyId: string,
): Promise<CreatorResult> {
  try {
    const user = await requireUser();
    await deleteChapter(user.id, chapterId);
    refresh(storyId);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
