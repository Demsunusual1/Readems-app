import Image from 'next/image';
import Link from 'next/link';
import { Bell, MagnifyingGlass, SignOut } from '@phosphor-icons/react/dist/ssr';
import { Logo } from './ui/logo';

export function LandingHeader({ dashboardHref }: { dashboardHref?: string }) {
  const accountHref = dashboardHref ?? '/login';

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
          {dashboardHref && (
            <form action="/api/logout" method="post">
              <button className="landing-logout" type="submit">
                Log out
              </button>
            </form>
          )}
        </nav>
        <nav className="landing-mobile-actions" aria-label="Landing shortcuts">
          <Link href="/discover" aria-label="Search stories">
            <MagnifyingGlass aria-hidden="true" />
          </Link>
          <Link
            className="landing-notifications"
            href={accountHref}
            aria-label="Notifications"
          >
            <Bell aria-hidden="true" />
            <span aria-label="3 notifications">3</span>
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
          {dashboardHref && (
            <form action="/api/logout" method="post">
              <button
                className="landing-mobile-logout"
                type="submit"
                aria-label="Log out"
              >
                <SignOut aria-hidden="true" />
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
