import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from './ui/logo';
import './page-shell.css';

/** The shell the written pages share: help, about, features, terms, privacy. */
export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="written-page">
      <header className="written-hero">
        <Logo tone="light" />
        {eyebrow && <p className="written-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro && <p className="written-intro">{intro}</p>}
      </header>
      <main className="written-main">{children}</main>
      <footer className="written-footer">
        <nav aria-label="Readems pages">
          <Link href="/about">About</Link>
          <Link href="/features">Features</Link>
          <Link href="/help">Help</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <p>Readems — where stories find readers, and readers find belonging.</p>
      </footer>
    </div>
  );
}
