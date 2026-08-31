import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn('ui-logo', className)}
      aria-label="Readems home"
    >
      <span className="ui-logo-mark" aria-hidden="true">
        <Image src="/readems/logo.png" width={40} height={40} alt="" />
      </span>
      {!compact && <span className="ui-logo-word">Readems</span>}
    </Link>
  );
}
