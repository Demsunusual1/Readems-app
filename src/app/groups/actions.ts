'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  createGroup,
  createGroupEvent,
  joinGroup,
  leaveGroup,
  toggleRsvp,
} from '@/lib/groups';

export type GroupResult = {
  ok: boolean;
  message?: string;
  joined?: boolean;
  attending?: boolean;
  groupId?: string;
};

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in to take part in groups.');
  return user;
}

function failure(error: unknown): GroupResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : 'That did not work. Try again.',
  };
}

export async function toggleMembership(
  groupId: string,
  joined: boolean,
): Promise<GroupResult> {
  try {
    const user = await requireUser();
    if (joined) await leaveGroup(user.id, groupId);
    else await joinGroup(user.id, groupId);
    revalidatePath('/groups');
    revalidatePath(`/groups/${groupId}`);
    revalidatePath('/community');
    return { ok: true, joined: !joined };
  } catch (error) {
    return failure(error);
  }
}

export async function startGroup(
  _previous: GroupResult | null,
  formData: FormData,
): Promise<GroupResult> {
  try {
    const user = await requireUser();
    const group = await createGroup(user.id, {
      name: String(formData.get('name') ?? ''),
      tagline: String(formData.get('tagline') ?? ''),
      description: String(formData.get('description') ?? ''),
      topic: String(formData.get('topic') ?? 'Community'),
      isPublic: formData.get('isPublic') !== 'off',
    });
    revalidatePath('/groups');
    return { ok: true, groupId: group.id, message: 'Group created.' };
  } catch (error) {
    return failure(error);
  }
}

export async function scheduleEvent(
  groupId: string,
  _previous: GroupResult | null,
  formData: FormData,
): Promise<GroupResult> {
  try {
    const user = await requireUser();
    await createGroupEvent(user.id, groupId, {
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      startsAt: new Date(String(formData.get('startsAt') ?? '')),
    });
    revalidatePath(`/groups/${groupId}`);
    return { ok: true, message: 'Event scheduled.' };
  } catch (error) {
    return failure(error);
  }
}

export async function respondToEvent(
  eventId: string,
  groupId: string,
): Promise<GroupResult> {
  try {
    const user = await requireUser();
    const attending = await toggleRsvp(user.id, eventId);
    revalidatePath(`/groups/${groupId}`);
    return { ok: true, attending };
  } catch (error) {
    return failure(error);
  }
}
