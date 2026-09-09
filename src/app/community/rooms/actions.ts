'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  closeRoom,
  createRoom,
  joinRoom,
  leaveRoom,
  postRoomMessage,
  raiseHand,
  reactToRoom,
  setOnStage,
  type RoomReactionKind,
} from '@/lib/rooms';

export type RoomResult = {
  ok: boolean;
  message?: string;
  roomId?: string;
  joined?: boolean;
  handRaised?: boolean;
  reacted?: boolean;
};

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in to take part in rooms.');
  return user;
}

function failure(error: unknown): RoomResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : 'That did not work. Try again.',
  };
}

function refresh(roomId?: string) {
  revalidatePath('/community/rooms');
  if (roomId) revalidatePath(`/community/rooms/${roomId}`);
  revalidatePath('/community');
}

export async function startRoom(
  _previous: RoomResult | null,
  formData: FormData,
): Promise<RoomResult> {
  try {
    const user = await requireUser();
    const room = await createRoom(user.id, {
      title: String(formData.get('title') ?? ''),
      tagline: String(formData.get('tagline') ?? ''),
      description: String(formData.get('description') ?? ''),
    });
    refresh(room.id);
    return { ok: true, roomId: room.id, message: 'Room open.' };
  } catch (error) {
    return failure(error);
  }
}

export async function toggleRoomMembership(
  roomId: string,
  joined: boolean,
): Promise<RoomResult> {
  try {
    const user = await requireUser();
    if (joined) await leaveRoom(user.id, roomId);
    else await joinRoom(user.id, roomId);
    refresh(roomId);
    return { ok: true, joined: !joined };
  } catch (error) {
    return failure(error);
  }
}

export async function toggleHand(roomId: string): Promise<RoomResult> {
  try {
    const user = await requireUser();
    const handRaised = await raiseHand(user.id, roomId);
    refresh(roomId);
    return { ok: true, handRaised };
  } catch (error) {
    return failure(error);
  }
}

export async function moveOnStage(
  roomId: string,
  userId: string,
  onStage: boolean,
): Promise<RoomResult> {
  try {
    const user = await requireUser();
    await setOnStage(user.id, roomId, userId, onStage);
    refresh(roomId);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function sendRoomMessage(
  roomId: string,
  _previous: RoomResult | null,
  formData: FormData,
): Promise<RoomResult> {
  try {
    const user = await requireUser();
    await postRoomMessage(user.id, roomId, String(formData.get('body') ?? ''));
    refresh(roomId);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function reactInRoom(
  roomId: string,
  kind: RoomReactionKind,
): Promise<RoomResult> {
  try {
    const user = await requireUser();
    const reacted = await reactToRoom(user.id, roomId, kind);
    refresh(roomId);
    return { ok: true, reacted };
  } catch (error) {
    return failure(error);
  }
}

export async function endRoom(roomId: string): Promise<RoomResult> {
  try {
    const user = await requireUser();
    await closeRoom(user.id, roomId);
    refresh(roomId);
    return { ok: true, message: 'Room closed.' };
  } catch (error) {
    return failure(error);
  }
}
