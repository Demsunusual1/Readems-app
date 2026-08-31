'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ReademsLogo } from './readems-logo';

export function LandingHeader({ dashboardHref }: { dashboardHref?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header" id="top">
      <div className="landing-shell header-inner">
        <ReademsLogo />
        <nav
          className={open ? 'header-nav open' : 'header-nav'}
          aria-label="Primary navigation"
        >
          <Link href={dashboardHref ?? '/login'}>
            {dashboardHref ? 'Dashboard' : 'Log In'}
          </Link>
          <Link
            className="button button-primary"
            href={dashboardHref ?? '/signup'}
          >
            {dashboardHref ? 'My Readems' : 'Join Readems'}
          </Link>
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
