import Link from 'next/link';
import {
  Bell,
  CalendarBlank,
  CaretRight,
  ChartLineUp,
  CurrencyDollar,
  Gear,
  Lifebuoy,
  SignOut,
  SquaresFour,
  Users,
} from '@phosphor-icons/react/dist/ssr';
import { CreatorNavigation } from './creator-navigation';
import { ReademsLogo } from './readems-logo';
import './creator-studio.css';

const tools = [
  {
    label: 'Dashboard',
    copy: 'Overview of your creator activity',
    href: '/creator/dashboard',
    Icon: SquaresFour,
  },
  {
    label: 'Analytics',
    copy: 'Reads, engagement and audience insights',
    href: '/creator/analytics',
    Icon: ChartLineUp,
  },
  {
    label: 'Earnings',
    copy: 'Revenue, transactions and payouts',
    href: '/creator/earnings',
    Icon: CurrencyDollar,
  },
  {
    label: 'Followers',
    copy: 'Manage and understand your audience',
    href: '/creator/followers',
    Icon: Users,
  },
  {
    label: 'Chapter Schedule',
    copy: 'Plan and manage chapter releases',
    href: '/creator/schedule',
    Icon: CalendarBlank,
  },
  {
    label: 'Notifications',
    copy: 'Updates, activity and creator alerts',
    href: '/creator/notifications',
    Icon: Bell,
  },
  {
    label: 'Settings',
    copy: 'Profile, account and publishing preferences',
    href: '/creator/settings',
    Icon: Gear,
  },
  {
    label: 'Help & Support',
    copy: 'Guides and support for creators',
    href: '/creator/help',
    Icon: Lifebuoy,
  },
] as const;

export function CreatorStudio({ name }: { name: string }) {
  return (
    <main className="studio-page">
      <header className="studio-header">
        <ReademsLogo />
        <span>Creator Studio</span>
      </header>
      <section className="studio-hero">
        <small>CREATOR STUDIO</small>
        <h1>Your creative workspace</h1>
        <p>Welcome, {name}. Manage your stories, audience and performance.</p>
      </section>
      <section className="studio-tools" aria-label="Creator Studio tools">
        {tools.map(({ label, copy, href, Icon }) => (
          <Link href={href} key={label}>
            <span>
              <Icon />
            </span>
            <div>
              <strong>{label}</strong>
              <small>{copy}</small>
            </div>
            <CaretRight />
          </Link>
        ))}
        <form action="/api/logout" method="post">
          <button type="submit">
            <span>
              <SignOut />
            </span>
            <div>
              <strong>Logout</strong>
              <small>Sign out securely</small>
            </div>
            <CaretRight />
          </button>
        </form>
      </section>
      <CreatorNavigation active="studio" />
    </main>
  );
}

export function CreatorToolPage({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="studio-page studio-tool-page">
      <header className="studio-header">
        <ReademsLogo />
        <Link href="/creator/studio">Creator Studio</Link>
      </header>
      <section className="studio-hero">
        <small>CREATOR STUDIO</small>
        <h1>{title}</h1>
        <p>{copy}</p>
      </section>
      <section className="studio-placeholder">
        {children ?? (
          <p>
            This workspace is connected and ready for its feature
            implementation.
          </p>
        )}
      </section>
      <CreatorNavigation active="studio" />
    </main>
  );
}
