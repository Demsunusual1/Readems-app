'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  addToReadingList,
  createReadingList,
  deleteReadingList,
  isInLibrary,
  removeFromLibrary,
  removeFromReadingList,
  saveToLibrary,
  setReadingGoal,
} from '@/lib/library';

export type ActionResult = { ok: boolean; message?: string; saved?: boolean };

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in to use your library.');
  return user;
}

function failure(error: unknown): ActionResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : 'That did not work. Try again.',
  };
}

export async function toggleLibraryStory(
  storyId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const saved = await isInLibrary(user.id, storyId);
    if (saved) await removeFromLibrary(user.id, storyId);
    else await saveToLibrary(user.id, storyId);
    revalidatePath('/library');
    revalidatePath(`/stories/${storyId}`);
    return { ok: true, saved: !saved };
  } catch (error) {
    return failure(error);
  }
}

export async function createList(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await createReadingList(user.id, {
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      isPublic: formData.get('isPublic') === 'on',
    });
    revalidatePath('/library');
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function addStoryToList(
  listId: string,
  storyId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await addToReadingList(user.id, listId, storyId);
    revalidatePath('/library');
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function removeStoryFromList(
  listId: string,
  storyId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await removeFromReadingList(user.id, listId, storyId);
    revalidatePath('/library');
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteList(listId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await deleteReadingList(user.id, listId);
    revalidatePath('/library');
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function updateReadingGoal(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await setReadingGoal(user.id, Number(formData.get('target')));
    revalidatePath('/library');
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
