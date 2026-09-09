'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Handshake,
  House,
  ShieldCheck,
  UsersThree,
} from '@phosphor-icons/react';

const links = [
  { href: '/admin', label: 'Overview', Icon: House },
  { href: '/admin/users', label: 'Users', Icon: UsersThree },
  { href: '/admin/moderation', label: 'Moderation', Icon: ShieldCheck },
  { href: '/admin/deals', label: 'Deals', Icon: Handshake },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="Admin sections">
      {links.map(({ href, label, Icon }) => {
        const active =
          href === '/admin' ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={active ? 'is-active' : undefined}
            aria-current={active ? 'page' : undefined}
          >
            <Icon weight={active ? 'fill' : 'regular'} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
