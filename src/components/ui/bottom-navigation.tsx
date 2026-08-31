import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NavigationItem } from './sidebar';

export function BottomNavigation({
  items,
  activeHref,
  label = 'Primary dashboard navigation',
}: {
  items: NavigationItem[];
  activeHref: string;
  label?: string;
}) {
  return (
    <nav className="ui-bottom-nav" aria-label={label}>
      {items.slice(0, 5).map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            'ui-bottom-nav-link',
            item.href === activeHref && 'is-active',
          )}
          aria-current={item.href === activeHref ? 'page' : undefined}
        >
          <span aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
