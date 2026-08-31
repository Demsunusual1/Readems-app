'use client';

import Link from 'next/link';
import { useState } from 'react';

export function LandingHeader({ dashboardHref }: { dashboardHref?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header" id="top">
      <div className="section header-inner">
        <Link className="logo" href="/" aria-label="Readems home">
          <span aria-hidden="true">▱</span>Readems
        </Link>
        <nav
          className={open ? 'header-nav open' : 'header-nav'}
          aria-label="Primary navigation"
        >
          {dashboardHref ? (
            <Link href={dashboardHref}>Dashboard</Link>
          ) : (
            <Link href="/login">Log In</Link>
          )}
          <Link
            className="button button-primary join-button"
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
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
