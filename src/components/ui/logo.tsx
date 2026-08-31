import Link from 'next/link';
import { BookOpenText } from '@phosphor-icons/react/dist/ssr';
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
        <span>R</span>
        <BookOpenText weight="fill" />
      </span>
      {!compact && <span className="ui-logo-word">Readems</span>}
    </Link>
  );
}
