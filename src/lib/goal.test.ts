import { describe, expect, it } from 'vitest';
import { goalPace } from './goal';

const july = new Date('2026-07-02T00:00:00Z'); // just past half the year

describe('reading goal pace', () => {
  it('reports how many books ahead of the year a reader is', () => {
    expect(goalPace({ target: 24, finished: 18 }, july)).toEqual({
      books: 6,
      state: 'ahead',
    });
  });

  it('reports how many books behind they are', () => {
    expect(goalPace({ target: 24, finished: 8 }, july)).toEqual({
      books: 4,
      state: 'behind',
    });
  });

  it('calls it on track when the difference rounds to nothing', () => {
    expect(goalPace({ target: 24, finished: 12 }, july)).toEqual({
      books: 0,
      state: 'on track',
    });
  });

  it('never divides by a goal of zero', () => {
    expect(goalPace({ target: 0, finished: 3 }, july).state).toBe('ahead');
  });
});
