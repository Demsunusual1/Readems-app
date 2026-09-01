import { describe, expect, it } from 'vitest';
import { selectStories } from './discover';
describe('Discover catalogue', () => {
  it('searches titles and authors without case sensitivity', () => {
    expect(selectStories(' BAOBAB ', 'All stories', 'trending')).toHaveLength(
      1,
    );
    expect(
      selectStories('readems editorial', 'All stories', 'trending'),
    ).toHaveLength(6);
  });
  it('combines category and query, and supports empty categories', () => {
    expect(selectStories('', 'African Folktales', 'trending')).toHaveLength(2);
    expect(selectStories('salt', 'Romance', 'trending')).toHaveLength(0);
    expect(selectStories('', 'Sci-Fi', 'trending')).toHaveLength(0);
  });
  it('matches stored onboarding interests', () => {
    const stories = selectStories('', 'All stories', 'for-you', [
      'African Literature',
    ]);
    expect(stories.map((story) => story.id)).toEqual([
      'baobab',
      'drum',
      'makoko',
    ]);
    expect(
      selectStories('', 'All stories', 'for-you', ['Poetry']),
    ).toHaveLength(0);
  });
  it('selects featured and recent editorial collections', () => {
    expect(selectStories('', 'All stories', 'featured')).toHaveLength(3);
    expect(selectStories('', 'All stories', 'recent')[0].id).toBe('archivist');
  });
});
