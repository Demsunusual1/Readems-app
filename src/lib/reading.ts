import { catalogue, type Story } from '@/lib/discover';

export type Chapter = {
  number: number;
  title: string;
  readTime: string;
  publishedLabel: string;
  paragraphs: string[];
};

export type ReadingStory = Story & {
  subtitle: string;
  status: 'Ongoing' | 'Complete';
  language: string;
  chapters: Chapter[];
};

const sampleChapters: Chapter[] = [
  {
    number: 1,
    title: 'The Story the Tree Kept',
    readTime: '6 min read',
    publishedLabel: 'Preview chapter',
    paragraphs: [
      'By sunset, everyone in Aderin knew not to linger beneath the old baobab. Children hurried past its roots, traders lowered their voices, and even the evening birds seemed to give its branches more room than they needed.',
      'Amara had heard every warning. She had also heard her grandmother say that fear was sometimes only a story told so often that people forgot to ask who first told it.',
      'That evening, with the last gold of daylight resting on the village roofs, Amara found a folded letter between two roots of the tree. Her family name was written across the front.',
      'She looked toward home. Smoke curled from the cooking fires. Somewhere beyond the square, a drum began its slow evening rhythm. Amara opened the letter.',
    ],
  },
  {
    number: 2,
    title: 'A Name in the Dust',
    readTime: '7 min read',
    publishedLabel: 'Preview chapter',
    paragraphs: [
      'The letter contained only three lines, but Amara read them until the words seemed to move beneath her fingers. It named a place her grandmother had forbidden anyone in the family to mention.',
      'At breakfast the next morning, she watched the older woman carefully. Grandmother moved as she always did: measured, certain, impossible to surprise. Yet when Amara spoke the name from the letter, the spoon in her hand stopped above the bowl.',
      'For the first time, Amara understood that silence could be an answer.',
    ],
  },
  {
    number: 3,
    title: 'When the Drums Changed',
    readTime: '8 min read',
    publishedLabel: 'Preview chapter',
    paragraphs: [
      'Rain arrived without warning that afternoon. It struck the roofs in silver sheets and turned the footpaths dark. Then the drums began again—not the familiar rhythm that marked evening, but something older.',
      'Grandmother stood at the doorway listening. “Some stories,” she said, “wait until they are certain you are ready.”',
      'Amara held the letter inside her pocket and followed her gaze toward the baobab.',
    ],
  },
];

const chapterTitles = [
  ['The Story the Tree Kept', 'A Name in the Dust', 'When the Drums Changed'],
  ['The Missing Ledger', 'Salt on the Windows', 'The Room Without a Record'],
  ['A Sky Holding Its Breath', 'The Flower Between Us', 'Orbit'],
  ['The Evening Drum', 'A Warning in Rhythm', 'The Listener'],
  ['Dear Me, Before Everything', 'The Things We Carried', 'Beginning Again'],
  ['The Final Departure', 'The Unexpected Passenger', 'Across the Lagoon'],
];

export const readingStories: ReadingStory[] = catalogue.map(
  (story, storyIndex) => ({
    ...story,
    subtitle:
      story.id === 'baobab'
        ? 'Some inherit land. Some inherit names. Amara inherited a secret.'
        : story.description,
    status: storyIndex % 3 === 2 ? 'Complete' : 'Ongoing',
    language: 'English',
    chapters: sampleChapters.map((chapter, chapterIndex) => ({
      ...chapter,
      title: chapterTitles[storyIndex]?.[chapterIndex] ?? chapter.title,
    })),
  }),
);

export function getReadingStory(id: string) {
  return readingStories.find((story) => story.id === id);
}

export function getChapter(story: ReadingStory, chapterNumber: number) {
  return story.chapters.find((chapter) => chapter.number === chapterNumber);
}
