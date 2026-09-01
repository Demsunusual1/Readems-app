'use client';

import Link from 'next/link';
import { List, X } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './logo';

export function Header({ dashboardHref }: { dashboardHref?: string }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (open) firstLink.current?.focus();
  }, [open]);

  function closeMenu(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButton.current?.focus());
  }

  return (
    <header className="ui-header" id="top">
      <div className="ui-header-inner">
        <Logo tone="light" />
        <nav
          className={open ? 'ui-header-nav is-open' : 'ui-header-nav'}
          aria-label="Primary navigation"
        >
          <Link href="/discover" onClick={() => closeMenu()}>
            Discover
          </Link>
          <Link href="/discover#genre-heading" onClick={() => closeMenu()}>
            Categories
          </Link>
          <Link href="/#community-title" onClick={() => closeMenu()}>
            Community
          </Link>
          <Link
            ref={firstLink}
            href={dashboardHref ?? '/login'}
            onClick={() => closeMenu()}
          >
            {dashboardHref ? 'Dashboard' : 'Log In'}
          </Link>
          <Link
            className="ui-header-cta"
            href={dashboardHref ?? '/signup'}
            onClick={() => closeMenu()}
          >
            {dashboardHref ? 'My Readems' : 'Join Readems'}
          </Link>
        </nav>
        <button
          ref={menuButton}
          className="ui-menu-button"
          type="button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeMenu(true);
          }}
        >
          {open ? <X aria-hidden="true" /> : <List aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
