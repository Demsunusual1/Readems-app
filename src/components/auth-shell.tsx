import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from './ui/logo';
import './auth-design.css';

export function AuthShell({
  mode,
  children,
}: {
  mode: 'login' | 'signup';
  children: ReactNode;
}) {
  const signup = mode === 'signup';
  return (
    <main className={`readems-auth readems-auth-${mode}`}>
      <header className="auth-banner">
        <div className="auth-banner-inner">
          <Logo />
          <div className="auth-banner-copy">
            <h1>
              {signup ? (
                <>
                  Your story
                  <br />
                  begins <em>here</em>
                </>
              ) : (
                <>
                  Welcome
                  <br />
                  <em>back</em>
                </>
              )}
            </h1>
            <p>
              {signup
                ? 'Join a global community of readers, writers and storytellers.'
                : 'Your stories. Your voice. Your community.'}
            </p>
          </div>
          <div className="auth-book">
            <Image
              src="/readems/writer-cta-quill-book.png"
              alt=""
              fill
              priority
              sizes="(max-width: 700px) 50vw, 440px"
            />
          </div>
        </div>
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="auth-wave-accent"
            d="M0 40C220 0 360 35 650 67S1220 125 1440 34V100H0Z"
          />
          <path d="M0 52C220 12 360 47 650 79S1220 137 1440 46V100H0Z" />
        </svg>
      </header>
      <div className="auth-surface">{children}</div>
      <footer className="auth-legal">
        Readems’ <Link href="/terms">Terms of Service</Link> and{' '}
        <Link href="/privacy">Privacy Policy</Link>.
        <Link href="/help">Help & support</Link>
      </footer>
    </main>
  );
}
