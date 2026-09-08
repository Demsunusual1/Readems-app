import Image from 'next/image';
import Link from 'next/link';
import { Bell, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { Logo } from './ui/logo';

export function LandingHeader({
  dashboardHref,
  unread = 0,
}: {
  dashboardHref?: string;
  unread?: number;
}) {
  const accountHref = dashboardHref ?? '/login';
  const bellHref = dashboardHref ? '/notifications' : '/login';

  return (
    <header className="landing-header" id="top">
      <div className="landing-header-inner">
        <Logo tone="light" />
        <nav className="landing-desktop-nav" aria-label="Primary navigation">
          <Link href="/discover">Discover</Link>
          <Link href="/discover#genre-heading">Categories</Link>
          <Link href="/#community-title">Community</Link>
          <Link href={accountHref}>
            {dashboardHref ? 'Dashboard' : 'Log In'}
          </Link>
          <Link
            className="landing-header-cta"
            href={dashboardHref ?? '/signup'}
          >
            {dashboardHref ? 'Open Readems' : 'Join Readems'}
          </Link>
        </nav>
        <nav className="landing-mobile-actions" aria-label="Landing shortcuts">
          <Link href="/search" aria-label="Search stories">
            <MagnifyingGlass aria-hidden="true" />
          </Link>
          <Link
            className="landing-notifications"
            href={bellHref}
            aria-label="Notifications"
          >
            <Bell aria-hidden="true" />
            {unread > 0 && (
              <span aria-label={`${unread} unread notifications`}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          <Link
            className="landing-avatar"
            href={accountHref}
            aria-label={dashboardHref ? 'Open dashboard' : 'Log in'}
          >
            <Image
              src="/readems/creator-chinelo-okoye.png"
              alt=""
              width={42}
              height={42}
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}
