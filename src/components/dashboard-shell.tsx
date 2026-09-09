import Link from 'next/link';
import {
  Bell,
  BookOpen,
  Books,
  ChartLineUp,
  ChatCircle,
  Compass,
  CurrencyDollar,
  Gear,
  House,
  ListBullets,
  MagnifyingGlass,
  PenNib,
  Users,
  UserCircle,
} from '@phosphor-icons/react/dist/ssr';
import { ReademsLogo } from './readems-logo';
import { BottomNavigation } from './ui/bottom-navigation';
import { Input } from './ui/input';
import { Sidebar, type NavigationItem } from './ui/sidebar';

type NavigationEntry = {
  label: string;
  icon: typeof House;
  // A page that exists, or a section of this dashboard. Nothing points at a
  // route that has not been built.
  href: (username: string) => string;
};

const readerNav: NavigationEntry[] = [
  { label: 'Home', icon: House, href: () => '/reader/dashboard' },
  { label: 'Explore', icon: Compass, href: () => '/discover' },
  { label: 'Library', icon: Books, href: () => '/library' },
  { label: 'Reading Lists', icon: ListBullets, href: () => '/library' },
  { label: 'Following', icon: Users, href: (name) => `/u/${name}` },
  { label: 'Notifications', icon: Bell, href: () => '/notifications' },
  { label: 'Community', icon: ChatCircle, href: () => '/community' },
  { label: 'Settings', icon: Gear, href: () => '/settings' },
];

const creatorNav: NavigationEntry[] = [
  { label: 'Dashboard', icon: House, href: () => '/creator/dashboard' },
  { label: 'My Stories', icon: BookOpen, href: () => '/creator/stories' },
  { label: 'Chapters', icon: PenNib, href: () => '/creator/stories' },
  { label: 'Analytics', icon: ChartLineUp, href: () => '/creator/analytics' },
  {
    label: 'Earnings',
    icon: CurrencyDollar,
    href: () => '/creator/dashboard#earnings',
  },
  { label: 'Followers', icon: Users, href: (name) => `/u/${name}` },
  { label: 'Community', icon: ChatCircle, href: () => '/community' },
  { label: 'Settings', icon: Gear, href: () => '/settings' },
];

export function DashboardShell({
  kind,
  name,
  username,
  avatarUrl,
  unread = 0,
  children,
}: {
  kind: 'reader' | 'creator';
  name: string;
  username: string;
  avatarUrl: string | null;
  unread?: number;
  children: React.ReactNode;
}) {
  const navigationItems: NavigationItem[] = (
    kind === 'reader' ? readerNav : creatorNav
  ).map((entry, index) => ({
    label: entry.label,
    href: entry.href(username),
    icon: <entry.icon weight={index === 0 ? 'fill' : 'regular'} />,
  }));
  return (
    <main className={`dashboard-shell ${kind}`}>
      <header className="dash-header">
        <ReademsLogo />
        {kind === 'reader' && (
          <label className="dash-search">
            <span className="sr-only">Search stories</span>
            <Input
              type="search"
              placeholder="Search stories…"
              leadingIcon={<MagnifyingGlass size={20} />}
            />
          </label>
        )}
        <div className="dash-account">
          <Link
            href="/notifications"
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
            }
          >
            <Bell aria-hidden="true" />
            {unread > 0 && <i />}
          </Link>
          <Link
            href={`/u/${username}`}
            className="avatar"
            aria-label="Your profile"
            style={
              avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined
            }
          >
            {!avatarUrl && name.charAt(0)}
          </Link>
        </div>
      </header>
      <div className="dashboard-layout">
        <Sidebar
          items={navigationItems}
          activeHref={`/${kind}/dashboard`}
          label={`${kind} dashboard navigation`}
        />
        <div className="dash-body">{children}</div>
      </div>
      <BottomNavigation
        items={navigationItems}
        activeHref={`/${kind}/dashboard`}
        label={`${kind} dashboard navigation`}
      />
      {kind === 'creator' && (
        <Link className="support-link" href="/help">
          <UserCircle aria-hidden="true" /> Help &amp; Support{' '}
          <span aria-hidden="true">›</span>
        </Link>
      )}
    </main>
  );
}
