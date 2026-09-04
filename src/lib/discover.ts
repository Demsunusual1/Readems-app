export const categories = [
  'All stories',
  'African Folktales',
  'Drama',
  'Romance',
  'Fantasy',
  'Mystery',
  'Sci-Fi',
  'Poetry',
  'Non-Fiction',
] as const;
export type Story = {
  id: string;
  title: string;
  author: string;
  category: string;
  tags: string[];
  description: string;
  cover: string;
  featured: boolean;
  trending: number;
  updated: number;
};
// Editorial preview content, not published chapters or live engagement metrics.
export const catalogue: Story[] = [
  {
    id: 'baobab',
    title: 'Beneath the Baobab Tree',
    author: 'Readems Editorial',
    category: 'African Folktales',
    tags: ['African Folktales', 'Drama'],
    description:
      'A family. A secret. A legacy that refuses to be buried. Beneath an ancient baobab, the past has a story of its own.',
    cover: '/readems/featured-beneath-the-baobab-tree.png',
    featured: true,
    trending: 1,
    updated: 4,
  },
  {
    id: 'archivist',
    title: 'The Archivist of Salt',
    author: 'Readems Editorial',
    category: 'Mystery',
    tags: ['Fantasy'],
    description:
      'Some archives remember what people try to forget. An archivist follows a missing record into a city built on secrets.',
    cover: '/readems/featured-archivist-of-salt.png',
    featured: true,
    trending: 2,
    updated: 1,
  },
  {
    id: 'stars',
    title: 'When Stars Learn to Bloom',
    author: 'Readems Editorial',
    category: 'Romance',
    tags: ['Fantasy', 'Young Adult'],
    description:
      'Love finds its way in the unlikeliest places. Two lives meet beneath a sky that seems to be holding its breath.',
    cover: '/readems/featured-when-stars-learn-to-bloom.png',
    featured: true,
    trending: 3,
    updated: 3,
  },
  {
    id: 'drum',
    title: 'Shadows of the Drum',
    author: 'Readems Editorial',
    category: 'African Folktales',
    tags: ['African Folktales', 'Fantasy'],
    description:
      'An evening drumbeat carries a warning through the village. One young listener must decide which stories to believe.',
    cover: '/readems/cover-shadows-of-the-drum.png',
    featured: false,
    trending: 4,
    updated: 2,
  },
  {
    id: 'letters',
    title: 'Letters to My Younger Self',
    author: 'Readems Editorial',
    category: 'Drama',
    tags: ['Personal Growth'],
    description:
      'Letters become a conversation between who we were and who we hope to be. A reflective story of memory, courage and beginning again.',
    cover: '/readems/cover-letters-to-my-younger-self.png',
    featured: false,
    trending: 5,
    updated: 6,
  },
  {
    id: 'makoko',
    title: 'The Last Train to Makoko',
    author: 'Readems Editorial',
    category: 'Mystery',
    tags: ['Drama', 'African Folktales'],
    description:
      'A final departure. An unexpected passenger. A journey through Lagos that changes everything its travellers thought they knew.',
    cover: '/readems/cover-last-train-to-makoko.png',
    featured: false,
    trending: 6,
    updated: 5,
  },
];
export function selectStories(
  query: string,
  category: string,
  collection: string,
  interests: string[] = [],
) {
  const term = query.trim().toLocaleLowerCase();
  const matchesInterest = (story: Story) =>
    interests.some((interest) =>
      [story.category, ...story.tags].includes(interest),
    );
  return catalogue
    .filter(
      (story) =>
        (category === 'All stories' || story.category === category) &&
        (!term ||
          `${story.title} ${story.author} ${story.category} ${story.tags.join(' ')}`
            .toLocaleLowerCase()
            .includes(term)) &&
        (collection !== 'featured' || story.featured) &&
        (collection !== 'for-you' ||
          interests.length === 0 ||
          matchesInterest(story)),
    )
    .sort((a, b) =>
      collection === 'recent' ? a.updated - b.updated : a.trending - b.trending,
    );
}
