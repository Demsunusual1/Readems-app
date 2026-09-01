import Link from 'next/link';
import Image from 'next/image';
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
        <Image src="/readems/logo.png" width={40} height={40} alt="" />
      </span>
      {!compact && <span className="ui-logo-word">Readems</span>}
    </Link>
  );
}
