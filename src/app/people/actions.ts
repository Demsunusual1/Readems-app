'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { toggleFollow } from '@/lib/people';

export type FollowResult = {
  ok: boolean;
  following?: boolean;
  message?: string;
};

export async function followPerson(
  personId: string,
  username: string,
): Promise<FollowResult> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Sign in to follow people.');
    const following = await toggleFollow(user.id, personId);
    revalidatePath(`/u/${username}`);
    return { ok: true, following };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'That did not work. Try again.',
    };
  }
}
