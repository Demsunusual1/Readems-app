import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LandingHeader } from './landing-header';

afterEach(cleanup);

describe('LandingHeader', () => {
  it('exposes the authentication navigation', () => {
    render(<LandingHeader />);
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByRole('link', { name: 'Join Readems' })).toHaveAttribute(
      'href',
      '/signup',
    );
  });

  it('exposes the official mobile shortcuts', () => {
    render(<LandingHeader />);
    expect(
      screen.getByRole('link', { name: 'Search stories' }),
    ).toHaveAttribute('href', '/discover');
    expect(screen.getByRole('link', { name: 'Notifications' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByLabelText('3 notifications')).toBeInTheDocument();
  });
});
