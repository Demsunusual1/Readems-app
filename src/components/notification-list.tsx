'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ChatCircle,
  Heart,
  Star,
  Trophy,
  UserPlus,
  UsersThree,
} from '@phosphor-icons/react';
import { relativeTime } from '@/lib/time';
import {
  readAllNotifications,
  readNotification,
} from '@/app/notifications/actions';

export type NotificationItem = {
  id: string;
  kind: string;
  category: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

const icons: Record<string, typeof BookOpen> = {
  FOLLOW: UserPlus,
  CHAPTER: BookOpen,
  COMMENT: ChatCircle,
  REPLY: ChatCircle,
  LIKE: Heart,
  REVIEW: Star,
  GROUP: UsersThree,
  MILESTONE: Trophy,
  SYSTEM: BookOpen,
};

export function NotificationList({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const unread = notifications.filter((item) => !item.read).length;

  if (notifications.length === 0)
    return (
      <p className="notifications-empty">
        Nothing here yet. Follow a writer, or start a story, and this is where
        you will hear about it.
      </p>
    );

  return (
    <>
      {unread > 0 && (
        <div className="notifications-actions">
          <span>
            {unread} unread {unread === 1 ? 'notification' : 'notifications'}
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await readAllNotifications();
                router.refresh();
              })
            }
          >
            Mark all read
          </button>
        </div>
      )}
      <ul className="notifications-list">
        {notifications.map((item) => {
          const Icon = icons[item.kind] ?? BookOpen;
          return (
            <li key={item.id} className={item.read ? undefined : 'is-unread'}>
              <Link
                href={item.href}
                onClick={() =>
                  startTransition(async () => {
                    await readNotification(item.id);
                  })
                }
              >
                <span className="notification-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </span>
                <small>{relativeTime(new Date(item.createdAt))}</small>
                {!item.read && (
                  <span className="notification-dot" aria-label="Unread" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
