import Link from 'next/link';
import { cn } from '@/lib/utils';
import './logo.css';

export function Logo({
  compact = false,
  className,
  tone = 'dark',
}: {
  compact?: boolean;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <Link
      href="/"
      className={cn('ui-logo', className)}
      aria-label="Readems home"
      data-tone={tone}
    >
      <span className="ui-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 332 332" width="40" height="40" aria-hidden="true">
          <defs>
            <filter
              id={`readems-mark-${tone}`}
              colorInterpolationFilters="sRGB"
            >
              <feColorMatrix
                type="matrix"
                values={
                  tone === 'light'
                    ? '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 0'
                    : '0 0 0 0 0.059  0 0 0 0 0.122  0 0 0 0 0.239  1 0 0 0 0'
                }
              />
            </filter>
          </defs>
          <image
            href="/readems/logo.png"
            width="332"
            height="332"
            filter={`url(#readems-mark-${tone})`}
          />
        </svg>
      </span>
      {!compact && <span className="ui-logo-word">Readems</span>}
    </Link>
  );
}
