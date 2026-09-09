// The editorial groupings the Discover screen is built from. The counts shown
// beside them are queried; only the grouping itself is chosen here.
export const discoverGenres = [
  'Drama',
  'Romance',
  'Fantasy',
  'Mystery',
  'Sci-Fi',
  'Poetry',
] as const;

export const discoverRegions = [
  {
    tag: 'African Folktales',
    copy: 'Timeless tales from across Africa',
    image: '/readems/featured-beneath-the-baobab-tree.png',
  },
  {
    tag: 'Nigerian Stories',
    copy: 'Legends, myths and stories from Nigeria',
    image: '/readems/cover-shadows-of-the-drum.png',
  },
  {
    tag: 'American Folktales',
    copy: 'Classic stories from Native traditions',
    image: '/readems/featured-when-stars-learn-to-bloom.png',
  },
  {
    tag: 'World Folktales',
    copy: 'Stories that transcend borders',
    image: '/readems/featured-archivist-of-salt.png',
  },
] as const;

export const discoverTrends = [
  {
    tag: 'Coming of Age',
    copy: 'Journeys of growth, identity, and self-discovery.',
    tone: 'purple',
  },
  {
    tag: 'Family & Relationships',
    copy: 'Love, bonds, and the people who shape us.',
    tone: 'plum',
  },
  {
    tag: 'Legends & Mythology',
    copy: 'Timeless myths and legends from around the world.',
    tone: 'gold',
  },
] as const;

export function storyCountLabel(counts: Record<string, number>, key: string) {
  const total = counts[key] ?? 0;
  if (total === 0) return 'No stories yet';
  return `${total} ${total === 1 ? 'story' : 'stories'}`;
}
