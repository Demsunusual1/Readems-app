import Link from 'next/link';
import {
  ChatCircleDots,
  Compass,
  House,
  User,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import './creator-platform-navigation.css';

type Destination = 'home' | 'discover' | 'community' | 'messages' | 'profile';
const items = [
  ['home', 'Home', '/', House],
  ['discover', 'Discover', '/discover', Compass],
  ['community', 'Community', '/community', UsersThree],
  ['messages', 'Messages', '/messages?from=platform', ChatCircleDots],
  ['profile', 'Profile', '/creator/profile', User],
] as const;

export function CreatorPlatformNavigation({ active }: { active: Destination }) {
  return (
    <nav
      className="creator-platform-nav"
      aria-label="Creator platform navigation"
    >
      {items.map(([id, label, href, Icon]) => (
        <Link
          key={id}
          href={href}
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon weight={active === id ? 'fill' : 'regular'} />
          <small>{label}</small>
        </Link>
      ))}
    </nav>
  );
}
