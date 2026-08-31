'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ReademsLogo } from './readems-logo';
export function LandingHeader({ dashboardHref }: { dashboardHref?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header" id="top">
      <div className="section header-inner">
        <ReademsLogo />
        <nav
          className={`header-nav ${open ? 'open' : ''}`}
          aria-label="Primary navigation"
        >
          <a href="#stories">Discover</a>
          <a href="#belong">Community</a>
          <a href="#genres">Genres</a>
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
