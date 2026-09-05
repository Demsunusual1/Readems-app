import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ReaderDashboard } from './reader-dashboard';

afterEach(cleanup);

describe('ReaderDashboard', () => {
  it('renders every section from the official dashboard design', () => {
    render(
      <ReaderDashboard
        user={{ fullName: 'Kemi A.', avatarUrl: null, interests: [] }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Welcome back,Kemi.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Continue Reading' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Because you read Contemporary & Drama',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Trending Serials' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'From creators you follow' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Your words matter.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
