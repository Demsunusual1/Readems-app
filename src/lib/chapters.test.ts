import { describe, expect, it } from 'vitest';
import {
  getChapter,
  getChapters,
  progressSchema,
  readingMinutes,
} from './chapters';
describe('sample reading content and positions', () => {
  it('resolves only available story chapters', () => {
    expect(getChapters('baobab')).toHaveLength(2);
    expect(getChapter('baobab', 3)).toBeUndefined();
    expect(getChapters('unknown')).toHaveLength(0);
  });
  it('estimates a nonzero reading time', () => {
    expect(readingMinutes(getChapter('baobab', 1)!)).toBeGreaterThan(0);
  });
  it('accepts bounded positions and completion only at the end', () => {
    expect(
      progressSchema.safeParse({
        storyId: 'baobab',
        chapter: 1,
        paragraph: 0,
        completed: false,
      }).success,
    ).toBe(true);
    expect(
      progressSchema.safeParse({
        storyId: 'baobab',
        chapter: 1,
        paragraph: 0,
        completed: true,
      }).success,
    ).toBe(false);
    expect(
      progressSchema.safeParse({
        storyId: 'baobab',
        chapter: 1,
        paragraph: 999,
        completed: false,
      }).success,
    ).toBe(false);
    expect(
      progressSchema.safeParse({
        storyId: 'baobab',
        chapter: 1,
        paragraph: 5,
        completed: true,
      }).success,
    ).toBe(true);
  });
  it('rejects arbitrary stories and client-supplied ownership', () => {
    expect(
      progressSchema.safeParse({
        storyId: 'missing',
        chapter: 1,
        paragraph: 0,
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
});
