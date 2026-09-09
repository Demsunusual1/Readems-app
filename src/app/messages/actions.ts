'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  markConversationRead,
  sendMessage,
  startConversation,
} from '@/lib/messages';

export type MessagesResult = {
  ok: boolean;
  message?: string;
  conversationId?: string;
};

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in to send a message.');
  return user;
}

function failure(error: unknown): MessagesResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : 'That did not work. Try again.',
  };
}

export async function openConversation(
  otherUserId: string,
): Promise<MessagesResult> {
  try {
    const user = await requireUser();
    const conversation = await startConversation(user.id, otherUserId);
    revalidatePath('/messages');
    return { ok: true, conversationId: conversation.id };
  } catch (error) {
    return failure(error);
  }
}

export async function postMessage(
  conversationId: string,
  _previous: MessagesResult | null,
  formData: FormData,
): Promise<MessagesResult> {
  try {
    const user = await requireUser();
    await sendMessage(
      user.id,
      conversationId,
      String(formData.get('body') ?? ''),
    );
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath('/messages');
    return { ok: true, conversationId };
  } catch (error) {
    return failure(error);
  }
}

export async function readConversation(
  conversationId: string,
): Promise<MessagesResult> {
  try {
    const user = await requireUser();
    await markConversationRead(user.id, conversationId);
    revalidatePath('/messages');
    return { ok: true, conversationId };
  } catch (error) {
    return failure(error);
  }
}
