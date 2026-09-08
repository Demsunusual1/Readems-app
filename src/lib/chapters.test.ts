import { describe, expect, it } from 'vitest';
import {
  isReadingPositionValid,
  isStoryFinished,
  progressSchema,
  readingMinutes,
  storyPercent,
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

describe('progress through a whole story', () => {
  const chapters = [1, 2, 3, 4];

  it('counts finished chapters and the way through the current one', () => {
    expect(
      storyPercent(chapters, { chapter: 1, paragraph: 0, completed: false }, 4),
    ).toBe(6);
    expect(
      storyPercent(chapters, { chapter: 2, paragraph: 1, completed: false }, 4),
    ).toBe(38);
    expect(
      storyPercent(chapters, { chapter: 4, paragraph: 3, completed: true }, 4),
    ).toBe(100);
  });

  it('ignores a chapter that is not published', () => {
    expect(
      storyPercent(chapters, { chapter: 9, paragraph: 0, completed: false }, 4),
    ).toBe(0);
    expect(
      storyPercent([], { chapter: 1, paragraph: 0, completed: false }, 4),
    ).toBe(0);
  });

  it('treats a story as finished only at the end of its last chapter', () => {
    expect(isStoryFinished(chapters, { chapter: 4, completed: true })).toBe(
      true,
    );
    expect(isStoryFinished(chapters, { chapter: 4, completed: false })).toBe(
      false,
    );
    expect(isStoryFinished(chapters, { chapter: 3, completed: true })).toBe(
      false,
    );
    expect(isStoryFinished([], { chapter: 1, completed: true })).toBe(false);
  });
});
