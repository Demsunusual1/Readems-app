import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BookOpen,
  Compass,
  House,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getNotifications } from '@/lib/notifications';
import { NotificationList } from '@/components/notification-list';
import { Logo } from '@/components/ui/logo';
import '@/components/notifications.css';

export const metadata: Metadata = {
  title: 'Notifications | Readems',
  description: 'Stay updated with your stories and community.',
};

const tabs = [
  ['All', undefined],
  ['Reading', 'READING'],
  ['Community', 'COMMUNITY'],
  ['Creator', 'CREATOR'],
] as const;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const { tab } = await searchParams;
  const active = tabs.find(([name]) => name === tab)?.[0] ?? ('All' as const);
  const category = tabs.find(([name]) => name === active)?.[1];

  const notifications = await getNotifications(user.id, { category });

  return (
    <div className="notifications-page">
      <header className="notifications-hero">
        <Logo tone="light" />
        <h1>Notifications</h1>
        <p>Stay updated with your stories and community.</p>
      </header>

      <nav className="notifications-tabs" aria-label="Notification types">
        {tabs.map(([name]) => (
          <Link
            key={name}
            href={
              name === 'All' ? '/notifications' : `/notifications?tab=${name}`
            }
            className={active === name ? 'is-active' : undefined}
            aria-current={active === name ? 'page' : undefined}
          >
            {name}
          </Link>
        ))}
      </nav>

      <main className="notifications-main">
        <NotificationList
          notifications={notifications.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </main>

      <nav className="community-bottom-nav" aria-label="Primary navigation">
        <Link href="/">
          <House />
          <span>Home</span>
        </Link>
        <Link href="/discover">
          <Compass />
          <span>Discover</span>
        </Link>
        <Link href="/library">
          <BookOpen />
          <span>Library</span>
        </Link>
        <Link href="/community">
          <UsersThree />
          <span>Community</span>
        </Link>
      </nav>
    </div>
  );
}
