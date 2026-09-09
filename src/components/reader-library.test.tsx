import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ReaderLibrary,
  type LibraryGoal,
  type ShelfStory,
} from './reader-library';

vi.mock('@/app/library/actions', () => ({
  createList: vi.fn(),
  deleteList: vi.fn(),
  toggleLibraryStory: vi.fn(),
  updateReadingGoal: vi.fn(),
}));

afterEach(cleanup);

const story = (overrides: Partial<ShelfStory>): ShelfStory => ({
  id: 'baobab',
  title: 'Beneath the Baobab Tree',
  author: 'Readems Editorial',
  coverUrl: '/readems/story-baobab-cover.png',
  percent: 65,
  chapter: 1,
  paragraph: 3,
  saved: false,
  ...overrides,
});

const goal: LibraryGoal = {
  target: 24,
  finished: 14,
  percent: 58,
  pace: { books: 6, state: 'ahead' },
};

function renderLibrary(
  overrides: Partial<Parameters<typeof ReaderLibrary>[0]> = {},
) {
  return render(
    <ReaderLibrary
      signedIn
      shelf={{
        current: [story({})],
        saved: [
          story({ id: 'drum', title: 'Shadows of the Drum', percent: 0 }),
        ],
        completed: [
          story({
            id: 'stars',
            title: 'When Stars Learn to Bloom',
            percent: 100,
          }),
        ],
      }}
      lists={[
        {
          id: 'list-1',
          title: 'African Voices',
          description: 'Stories that centre our voices.',
          isPublic: true,
          count: 8,
          covers: ['/readems/library-cover-baobab.png'],
        },
      ]}
      goal={goal}
      {...overrides}
    />,
  );
}

describe('ReaderLibrary', () => {
  it('shows the reader’s own shelf, lists and goal', () => {
    renderLibrary();

    expect(screen.getByRole('heading', { name: 'My Library' })).toBeVisible();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('of 24 books')).toBeInTheDocument();
    expect(screen.getByText('6 books ahead')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Beneath the Baobab Tree' }),
    ).toBeVisible();
    expect(screen.getByText('African Voices')).toBeVisible();
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'SMALL' &&
          /8 stories/.test(element.textContent ?? ''),
      ),
    ).toBeTruthy();
  });

  it('resumes a part-read story where the reader stopped', () => {
    renderLibrary();

    expect(
      screen.getByRole('link', { name: /Cover of Beneath the Baobab Tree/ }),
    ).toHaveAttribute('href', '/stories/baobab/chapters/1#paragraph-3');
  });

  it('separates saved and finished stories behind their tabs', () => {
    renderLibrary();

    expect(screen.queryByText('Shadows of the Drum')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Saved' }));
    expect(screen.getByText('Shadows of the Drum')).toBeVisible();
    expect(
      screen.queryByText('Beneath the Baobab Tree'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Completed' }));
    expect(screen.getByText('When Stars Learn to Bloom')).toBeVisible();
  });

  it('says plainly that offline reading is not available', () => {
    renderLibrary();

    fireEvent.click(screen.getByRole('button', { name: 'View Downloads' }));

    expect(screen.getByRole('tab', { name: 'Downloads' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText(/nothing is stored on this device/)).toBeVisible();
  });

  it('invites a signed-out visitor to sign in instead of showing controls', () => {
    renderLibrary({
      signedIn: false,
      shelf: { current: [], saved: [], completed: [] },
      lists: [],
    });

    expect(
      screen.getByText('Sign in to keep a shelf of your own.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /New List/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Change goal' }),
    ).not.toBeInTheDocument();
  });
});
