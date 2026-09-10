import Link from 'next/link';
import {
  Books,
  ChatCircleDots,
  House,
  Plus,
  SquaresFour,
} from '@phosphor-icons/react/dist/ssr';
import './creator-navigation.css';

type CreatorDestination = 'home' | 'stories' | 'create' | 'messages' | 'studio';

const items = [
  { id: 'home', label: 'Home', href: '/', Icon: House },
  { id: 'stories', label: 'My Stories', href: '/creator/stories', Icon: Books },
  { id: 'create', label: 'Create', href: '/creator/stories/new', Icon: Plus },
  {
    id: 'messages',
    label: 'Messages',
    href: '/messages',
    Icon: ChatCircleDots,
  },
  {
    id: 'studio',
    label: 'Studio',
    href: '/creator/studio',
    Icon: SquaresFour,
  },
] as const;

export function CreatorNavigation({ active }: { active: CreatorDestination }) {
  return (
    <nav className="creator-navigation" aria-label="Creator navigation">
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
                id === 'create' ? 'creator-navigation__primary' : undefined
              }
            >
              <Icon weight={isActive && id !== 'create' ? 'fill' : 'regular'} />
            </span>
            <small>{label}</small>
          </Link>
        );
      })}
    </nav>
  );
}
