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

const readerNav = [
  'Home',
  'Explore',
  'Library',
  'Reading Lists',
  'Following',
  'Notifications',
  'Messages',
  'Settings',
];
const creatorNav = [
  'Dashboard',
  'My Stories',
  'Chapters',
  'Analytics',
  'Earnings',
  'Followers',
  'Messages',
  'Settings',
];

const readerIcons = [
  House,
  Compass,
  Books,
  ListBullets,
  Users,
  Bell,
  ChatCircle,
  Gear,
];
const creatorIcons = [
  House,
  BookOpen,
  PenNib,
  ChartLineUp,
  CurrencyDollar,
  Users,
  ChatCircle,
  Gear,
];

export function DashboardShell({
  kind,
  name,
  avatarUrl,
  children,
}: {
  kind: 'reader' | 'creator';
  name: string;
  avatarUrl: string | null;
  children: React.ReactNode;
}) {
  const navigation = kind === 'reader' ? readerNav : creatorNav;
  const icons = kind === 'reader' ? readerIcons : creatorIcons;
  const navigationItems: NavigationItem[] = navigation.map((item, index) => {
    const Icon = icons[index];
    return {
      label: item,
      href:
        index === 0
          ? `/${kind}/dashboard`
          : kind === 'reader' && item === 'Explore'
            ? '/discover'
            : kind === 'reader' && item === 'Library'
              ? '/library'
              : `#${item.toLowerCase().replaceAll(' ', '-')}`,
      icon: <Icon weight={index === 0 ? 'fill' : 'regular'} />,
    };
  });
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
          <Link href="#notifications" aria-label="Notifications">
            <Bell aria-hidden="true" />
            <i />
          </Link>
          <span
            className="avatar"
            style={
              avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined
            }
          >
            {!avatarUrl && name.charAt(0)}
          </span>
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
