import Link from 'next/link';
import {
  Books,
  Compass,
  House,
  User,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import './reader-navigation.css';

type ReaderDestination =
  | 'home'
  | 'discover'
  | 'messages'
  | 'library'
  | 'community'
  | 'profile';

const items = [
  { id: 'home', label: 'Home', href: '/reader/dashboard', Icon: House },
  { id: 'discover', label: 'Discover', href: '/discover', Icon: Compass },
  {
    id: 'library',
    label: 'Library',
    href: '/library',
    Icon: Books,
  },
  {
    id: 'community',
    label: 'Community',
    href: '/community',
    Icon: UsersThree,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: null,
    Icon: User,
  },
] as const;

export function ReaderNavigation({ active }: { active: ReaderDestination }) {
  return (
    <nav className="reader-navigation" aria-label="Reader navigation">
      {items.map(({ id, label, href, Icon }) => {
        const isActive = active === id;
        const content = (
          <>
            <span
              className={
                id === 'library' ? 'reader-navigation__primary' : undefined
              }
            >
              <Icon weight={isActive ? 'fill' : 'regular'} />
            </span>
            <small>{label}</small>
          </>
        );

        if (!href) {
          return (
            <span
              key={id}
              className="reader-navigation__disabled"
              aria-disabled="true"
              title="Reader profile is not available yet"
            >
              {content}
            </span>
          );
        }

        return (
          <Link
            key={id}
            href={href}
            aria-current={isActive ? 'page' : undefined}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
