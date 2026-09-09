import type { NotificationCategory, NotificationKind } from '@prisma/client';
import { prisma } from './prisma';

export type NotificationView = {
  id: string;
  kind: NotificationKind;
  category: NotificationCategory;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: Date;
  actor: { name: string; username: string; avatarUrl: string | null } | null;
};

export async function notify(input: {
  userId: string;
  actorId?: string | null;
  kind: NotificationKind;
  category: NotificationCategory;
  title: string;
  body: string;
  href: string;
}) {
  // Nobody needs telling about their own doing.
  if (input.actorId && input.actorId === input.userId) return null;
  if (!input.title.trim() || !input.body.trim() || !input.href.trim())
    throw new Error(
      'A notification needs a title, a body and somewhere to go.',
    );
  return prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId ?? null,
      kind: input.kind,
      category: input.category,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });
}

/** Sends the same notification to many people, skipping the actor. */
export async function notifyMany(
  userIds: string[],
  input: Omit<Parameters<typeof notify>[0], 'userId'>,
) {
  const recipients = userIds.filter((id) => id !== input.actorId);
  if (recipients.length === 0) return 0;
  const result = await prisma.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      actorId: input.actorId ?? null,
      kind: input.kind,
      category: input.category,
      title: input.title,
      body: input.body,
      href: input.href,
    })),
  });
  return result.count;
}

export async function getNotifications(
  userId: string,
  options: { category?: NotificationCategory; take?: number } = {},
): Promise<NotificationView[]> {
  const rows = await prisma.notification.findMany({
    where: {
      userId,
      ...(options.category ? { category: options.category } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: options.take ?? 50,
    include: {
      actor: { select: { fullName: true, username: true, avatarUrl: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    category: row.category,
    title: row.title,
    body: row.body,
    href: row.href,
    read: row.readAt !== null,
    createdAt: row.createdAt,
    actor: row.actor
      ? {
          name: row.actor.fullName,
          username: row.actor.username,
          avatarUrl: row.actor.avatarUrl,
        }
      : null,
  }));
}

export async function countUnread(userId: string) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markRead(userId: string, notificationId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
