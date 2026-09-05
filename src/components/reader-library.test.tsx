import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ReaderLibrary } from './reader-library';

afterEach(cleanup);

describe('ReaderLibrary', () => {
  it('renders the official library sections and navigation', () => {
    render(<ReaderLibrary profileHref="/login" />);

    expect(
      screen.getByRole('heading', { name: 'My Library' }),
    ).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'My Shelf' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'My Reading Lists' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Offline Mode')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Library/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('switches to downloads from the official offline card', () => {
    render(<ReaderLibrary profileHref="/login" />);

    fireEvent.click(screen.getByRole('button', { name: 'View Downloads' }));

    expect(screen.getByRole('tab', { name: 'Downloads' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
