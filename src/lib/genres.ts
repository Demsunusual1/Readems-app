// The genres readers can browse. `All stories` is the unfiltered default and
// is never stored on a story row.
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

export type Category = (typeof categories)[number];
