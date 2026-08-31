import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('toggles its accessible mobile menu', () => {
    render(<LandingHeader />);
    const menu = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'Close navigation menu' }),
    ).toBeInTheDocument();
  });
});
