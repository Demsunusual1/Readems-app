import { cleanup, render, screen } from '@testing-library/react';
import { House, User } from '@phosphor-icons/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge } from './badge';
import { BottomNavigation } from './bottom-navigation';
import { Card } from './card';
import { Input } from './input';
import { Logo } from './logo';
import { Sidebar, type NavigationItem } from './sidebar';

const items: NavigationItem[] = [
  { label: 'Home', href: '/reader/dashboard', icon: <House /> },
  { label: 'Profile', href: '/profile', icon: <User /> },
];

afterEach(cleanup);

describe('Readems UI foundation', () => {
  it('renders accessible reusable primitives', () => {
    render(
      <>
        <Logo />
        <Input aria-label="Search stories" />
        <Card as="article">Story</Card>
        <Badge tone="purple">Featured</Badge>
      </>,
    );

    expect(screen.getByRole('link', { name: 'Readems home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(
      screen.getByRole('textbox', { name: 'Search stories' }),
    ).toBeVisible();
    expect(screen.getByRole('article')).toHaveTextContent('Story');
    expect(screen.getByText('Featured')).toHaveClass('ui-badge-purple');
  });

  it('marks the active destination in responsive navigation', () => {
    render(
      <>
        <Sidebar items={items} activeHref="/reader/dashboard" />
        <BottomNavigation items={items} activeHref="/reader/dashboard" />
      </>,
    );

    const activeLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(activeLinks).toHaveLength(2);
    activeLinks.forEach((link) =>
      expect(link).toHaveAttribute('aria-current', 'page'),
    );
  });
});
