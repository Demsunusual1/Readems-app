import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type NavigationItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

export function Sidebar({
  items,
  activeHref,
  label = 'Dashboard navigation',
}: {
  items: NavigationItem[];
  activeHref: string;
  label?: string;
}) {
  return (
    <aside className="ui-sidebar">
      <nav aria-label={label}>
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'ui-sidebar-link',
              item.href === activeHref && 'is-active',
            )}
            aria-current={item.href === activeHref ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
