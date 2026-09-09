// Editorial sample content. These stories are written for Readems itself so
// the catalogue is never empty; they are not creator submissions, and no
// engagement figures are seeded with them.
export const editorialAuthor = {
  id: 'readems-editorial',
  fullName: 'Readems Editorial',
  username: 'readems_editorial',
  email: 'editorial@readems.example',
  // Not a valid scrypt record, so this account can never be signed in to.
  passwordHash: 'disabled',
  role: 'CREATOR' as const,
  bio: 'Sample stories written by the Readems editorial team.',
  interests: [] as string[],
};

export type SeedChapter = {
  number: number;
  title: string;
  paragraphs: string[];
  authorNote?: string;
};

export type SeedStory = {
  id: string;
  title: string;
  synopsis: string;
  coverUrl: string;
  genre: string;
  audience: string;
  tags: string[];
  featured: boolean;
  /** Days before seeding that the story was published; lower is newer. */
  publishedDaysAgo: number;
  chapters: SeedChapter[];
};

export const seedStories: SeedStory[] = [
  {
    id: 'baobab',
    title: 'Beneath the Baobab Tree',
    synopsis:
      'In a village where stories are carried by the wind, a young girl uncovers a family secret that could change everything. Set against the backdrop of resilience, tradition, and hope, this is a coming-of-age tale about courage, belonging, and the roots that ground us.',
    coverUrl: '/readems/story-baobab-cover.png',
    genre: 'African Folktales',
    audience: 'Young Adult',
    tags: ['African Folktales', 'Drama', 'Family Secrets', 'Coming of Age'],
    featured: true,
    publishedDaysAgo: 4,
    chapters: [
      {
        number: 1,
        title: 'Roots of Our Past',
        paragraphs: [
          'The first thing Nene noticed was the silence. Every evening, the children gathered beneath the baobab to trade stories while their parents called them home. Tonight, the space beneath its branches was empty. Even the little wooden bench where her grandmother sat had been turned towards the trunk.',
          'She set down the basket she had brought from the market. In the last light, the tree looked less like something growing out of the earth than something holding it together. Its roots crossed the path in thick, patient lines. Nene had stepped over them all her life without once wondering where they ended.',
          'A folded piece of cloth lay on the bench. She recognised the blue stitching immediately. Her mother had made that pattern on every school uniform she repaired: three small waves, so Nene could always find her own shirt among the washing. Her mother had been gone for seven rainy seasons.',
          'Inside the cloth was a key. Not a grand brass key from one of the houses near the road, but a small iron one with a bent tooth. Beneath it, in handwriting she did not recognise, someone had written: Ask what was kept, not what was lost.',
          'Nene read the sentence twice. Behind her, footsteps stopped at the edge of the path. Her grandmother stood there with an empty water pot against her hip. She looked at the cloth first, and then at the tree. For a long moment, neither of them spoke.',
          '“I thought we had more time,” her grandmother said. Nene closed her fingers around the key. The metal was warm from the evening air. “Time for what?” she asked. Her grandmother lowered the pot carefully to the ground. “For you to decide whether you wanted the whole story.”',
        ],
        authorNote:
          'This chapter was written for Readems to demonstrate the reading experience.',
      },
      {
        number: 2,
        title: 'The House Beyond the Path',
        paragraphs: [
          'They took the narrow path behind the old school. Nene had expected her grandmother to hurry, but she walked at the pace she always did, stopping once to move a fallen branch away from the drainage channel. It was an ordinary kindness on a night when nothing felt ordinary.',
          'At the last house, her grandmother held out her hand for the key, then changed her mind. “You should open it.” The door resisted before giving way with a scrape. Inside, a table stood beneath a shuttered window. There was no treasure, no hidden room. Just a wooden box and a chair with one repaired leg.',
          'The box contained letters, tied in bundles with strips of faded fabric. Some were addressed to people Nene knew. Others carried names she had only heard in stories. Her mother had copied each letter into a notebook, keeping a record for neighbours who could not read the words sent home to them.',
          '“She wanted nobody to be forgotten,” her grandmother said. Nene opened the notebook. Between lists of names and dates were small observations: a child had started school; a brother had returned; somebody needed help repairing a roof before the rains. The pages held a village remembering itself.',
          'Near the back, Nene found a page with her own name at the top. Underneath it was a single sentence: When she is ready, let her add what she sees. She ran a finger beside the handwriting without touching the ink. For the first time in years, remembering her mother felt like an invitation rather than a closed door.',
          'In the morning, Nene carried the notebook to the baobab. She turned the bench towards the path again. When the first child arrived, she moved over to make room. “Tell me something that happened today,” she said. Then she opened to a clean page.',
        ],
      },
    ],
  },
  {
    id: 'archivist',
    title: 'The Archivist of Salt',
    synopsis:
      'Some archives remember what people try to forget. An archivist follows a missing record into a city built on secrets.',
    coverUrl: '/readems/featured-archivist-of-salt.png',
    genre: 'Mystery',
    audience: 'Adult',
    tags: ['Fantasy', 'Mystery'],
    featured: true,
    publishedDaysAgo: 1,
    chapters: [],
  },
  {
    id: 'stars',
    title: 'When Stars Learn to Bloom',
    synopsis:
      'Love finds its way in the unlikeliest places. Two lives meet beneath a sky that seems to be holding its breath.',
    coverUrl: '/readems/featured-when-stars-learn-to-bloom.png',
    genre: 'Romance',
    audience: 'Young Adult',
    tags: ['Fantasy', 'Young Adult', 'Romance'],
    featured: true,
    publishedDaysAgo: 3,
    chapters: [],
  },
  {
    id: 'drum',
    title: 'Shadows of the Drum',
    synopsis:
      'An evening drumbeat carries a warning through the village. One young listener must decide which stories to believe.',
    coverUrl: '/readems/cover-shadows-of-the-drum.png',
    genre: 'African Folktales',
    audience: 'Young Adult',
    tags: ['African Folktales', 'Fantasy'],
    featured: false,
    publishedDaysAgo: 2,
    chapters: [],
  },
  {
    id: 'letters',
    title: 'Letters to My Younger Self',
    synopsis:
      'Letters become a conversation between who we were and who we hope to be. A reflective story of memory, courage and beginning again.',
    coverUrl: '/readems/cover-letters-to-my-younger-self.png',
    genre: 'Drama',
    audience: 'Adult',
    tags: ['Personal Growth', 'Drama'],
    featured: false,
    publishedDaysAgo: 6,
    chapters: [],
  },
  {
    id: 'makoko',
    title: 'The Last Train to Makoko',
    synopsis:
      'A final departure. An unexpected passenger. A journey through Lagos that changes everything its travellers thought they knew.',
    coverUrl: '/readems/cover-last-train-to-makoko.png',
    genre: 'Mystery',
    audience: 'Adult',
    tags: ['Drama', 'African Folktales', 'Mystery'],
    featured: false,
    publishedDaysAgo: 5,
    chapters: [],
  },
];

/** Starter groups, created by Readems so the community has somewhere to begin. */
export const seedGroups = [
  {
    id: 'african-voices-collective',
    name: 'African Voices Collective',
    tagline: 'A global home for African storytellers and readers.',
    description:
      'Share your voice. Discover powerful stories. Celebrate our diverse narratives.',
    topic: 'Culture',
  },
  {
    id: 'the-writers-sanctuary',
    name: 'The Writer’s Sanctuary',
    tagline: 'Honest feedback. Better stories.',
    description:
      'Bring a draft, leave with notes. A group for writers who want to be read closely.',
    topic: 'Craft',
  },
  {
    id: 'poets-collective',
    name: 'Poets Collective',
    tagline: 'Lines that linger. Hearts that connect.',
    description: 'Poems, forms, translations and the talk around them.',
    topic: 'Genres',
  },
  {
    id: 'book-lovers-club',
    name: 'Book Lovers Club',
    tagline: 'Read more. Share more.',
    description:
      'What we are reading this month, and what it left us thinking about.',
    topic: 'Community',
  },
];

/** The prompt shown on the community page in the week it belongs to. */
export const seedPrompt = {
  title: 'Unwritten Paths',
  body: 'Write about a choice that changed everything.',
};
