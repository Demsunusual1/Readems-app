import { describe, expect, it } from 'vitest';
import {
  isReadingPositionValid,
  progressSchema,
  readingMinutes,
} from './chapters';

const chapter = {
  paragraphs: ['A short opening.', 'A second paragraph.', 'A third.'],
};

describe('reading positions', () => {
  it('estimates a nonzero reading time', () => {
    expect(readingMinutes(chapter)).toBeGreaterThan(0);
  });

  it('accepts a well-formed position', () => {
    expect(
      progressSchema.safeParse({
        storyId: 'baobab',
        chapter: 1,
        paragraph: 0,
        completed: false,
      }).success,
    ).toBe(true);
  });

  it('rejects impossible positions and client-supplied ownership', () => {
    expect(
      progressSchema.safeParse({
        storyId: 'baobab',
        chapter: 0,
        paragraph: 0,
        completed: false,
      }).success,
    ).toBe(false);
    expect(
      progressSchema.safeParse({
        storyId: 'baobab',
        chapter: 1,
        paragraph: -1,
        completed: false,
      }).success,
    ).toBe(false);
    expect(
      progressSchema.safeParse({
        storyId: 'baobab',
        chapter: 1,
        paragraph: 0,
        completed: false,
        userId: 'another-user',
      }).success,
    ).toBe(false);
  });

  it('keeps a position inside the chapter it belongs to', () => {
    expect(isReadingPositionValid(3, { paragraph: 2, completed: false })).toBe(
      true,
    );
    expect(isReadingPositionValid(3, { paragraph: 3, completed: false })).toBe(
      false,
    );
    expect(isReadingPositionValid(0, { paragraph: 0, completed: false })).toBe(
      false,
    );
  });

  it('allows completion only from the last paragraph', () => {
    expect(isReadingPositionValid(3, { paragraph: 2, completed: true })).toBe(
      true,
    );
    expect(isReadingPositionValid(3, { paragraph: 1, completed: true })).toBe(
      false,
    );
  });
});
