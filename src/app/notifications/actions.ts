'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { markAllRead, markRead } from '@/lib/notifications';

export async function readNotification(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await markRead(user.id, notificationId);
  revalidatePath('/notifications');
  return { ok: true };
}

export async function readAllNotifications() {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await markAllRead(user.id);
  revalidatePath('/notifications');
  return { ok: true };
}
