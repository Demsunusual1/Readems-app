import Link from 'next/link';
import {
  ChatCircleDots,
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
  | 'community'
  | 'profile';

const items = [
  { id: 'home', label: 'Home', href: '/reader/dashboard', Icon: House },
  { id: 'discover', label: 'Discover', href: '/discover', Icon: Compass },
  {
    id: 'messages',
    label: 'Messages',
    href: '/messages',
    Icon: ChatCircleDots,
  },
  {
    id: 'community',
    label: 'Community',
    href: '/reader/dashboard#community',
    Icon: UsersThree,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/reader/dashboard#profile',
    Icon: User,
  },
] as const;

export function ReaderNavigation({ active }: { active: ReaderDestination }) {
  return (
    <nav className="reader-navigation" aria-label="Reader navigation">
      {items.map(({ id, label, href, Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            href={href}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className={
                id === 'messages' ? 'reader-navigation__primary' : undefined
              }
            >
              <Icon weight={isActive ? 'fill' : 'regular'} />
            </span>
            <small>{label}</small>
          </Link>
        );
      })}
    </nav>
  );
}
