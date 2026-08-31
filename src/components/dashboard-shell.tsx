import Link from 'next/link';
import { ReademsLogo } from './readems-logo';

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
  return (
    <main className={`dashboard-shell ${kind}`}>
      <header className="dash-header">
        <ReademsLogo />
        {kind === 'reader' && (
          <label className="dash-search">
            <span className="sr-only">Search stories</span>
            <input type="search" placeholder="Search stories…" />
          </label>
        )}
        <div className="dash-account">
          <Link href="#notifications" aria-label="Notifications">
            ♢<i />
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
      <div className="dash-body">{children}</div>
      <nav className="dash-nav" aria-label={`${kind} dashboard navigation`}>
        {navigation.map((item, index) => (
          <Link
            className={index === 0 ? 'active' : ''}
            key={item}
            href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
          >
            <span aria-hidden="true">
              {['⌂', '◇', '▱', '☷', '♙', '♢', '□', '⚙'][index]}
            </span>
            {item}
          </Link>
        ))}
      </nav>
      {kind === 'creator' && (
        <Link className="support-link" href="/help">
          ◎ Help &amp; Support <span>›</span>
        </Link>
      )}
    </main>
  );
}
