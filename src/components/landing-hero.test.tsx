import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LandingHero } from './landing-hero';

afterEach(cleanup);

describe('Landing hero', () => {
  it('selects all four highlights while preserving action destinations', () => {
    render(
      <LandingHero
        readingHref="/signup"
        writingHref="/signup?role=creator"
        signedIn={false}
      />,
    );
    const dots = screen.getAllByRole('button', { name: /Show slide/ });
    expect(dots).toHaveLength(4);
    fireEvent.click(dots[1]);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Beneath the Baobab Tree',
    );
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
    expect(dots[0]).not.toHaveAttribute('aria-current');
    fireEvent.click(dots[3]);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'When Stars Learn to Bloom',
    );
    expect(screen.getByRole('link', { name: 'Start Writing' })).toHaveAttribute(
      'href',
      '/signup?role=creator',
    );
    fireEvent.click(dots[0]);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Stories that stay with you',
    );
  });

  it('responds to horizontal swipes but ignores vertical scrolling', () => {
    render(
      <LandingHero
        readingHref="/reader/dashboard"
        writingHref="/reader/dashboard"
        signedIn
      />,
    );
    const carousel = screen.getByRole('region', { name: 'Readems highlights' });
    fireEvent.touchStart(carousel, {
      touches: [{ clientX: 200, clientY: 100 }],
    });
    fireEvent.touchEnd(carousel, {
      changedTouches: [{ clientX: 100, clientY: 105 }],
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Beneath the Baobab Tree',
    );
    fireEvent.touchStart(carousel, {
      touches: [{ clientX: 200, clientY: 100 }],
    });
    fireEvent.touchEnd(carousel, {
      changedTouches: [{ clientX: 190, clientY: 250 }],
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Beneath the Baobab Tree',
    );
    expect(
      screen.getByRole('link', { name: 'Go to dashboard' }),
    ).toHaveAttribute('href', '/reader/dashboard');
    expect(
      screen.getByRole('link', { name: 'Go to dashboard' }).parentElement,
    ).toHaveClass('is-signed-in');
  });
});
