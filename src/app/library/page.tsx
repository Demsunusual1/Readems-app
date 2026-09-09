import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { goalPace } from '@/lib/goal';
import { getReadingGoal, getReadingLists, getShelf } from '@/lib/library';
import { ReaderLibrary, type ShelfStory } from '@/components/reader-library';
import type { ShelfEntry } from '@/lib/library';

export const metadata: Metadata = {
  title: 'My Library | Readems',
  description: 'Continue reading and organise your saved Readems stories.',
};

const toShelfStory = (entry: ShelfEntry): ShelfStory => ({
  id: entry.story.id,
  title: entry.story.title,
  author: entry.story.authorName,
  coverUrl: entry.story.coverUrl,
  percent: entry.percent,
  chapter: entry.chapter,
  paragraph: entry.paragraph,
  saved: entry.saved,
});

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user)
    return (
      <ReaderLibrary
        signedIn={false}
        shelf={{ current: [], saved: [], completed: [] }}
        lists={[]}
        goal={{
          target: 12,
          finished: 0,
          percent: 0,
          pace: { books: 0, state: 'on track' },
        }}
      />
    );

  const [shelf, lists, goal] = await Promise.all([
    getShelf(user.id),
    getReadingLists(user.id),
    getReadingGoal(user.id),
  ]);

  return (
    <ReaderLibrary
      signedIn
      shelf={{
        current: shelf.current.map(toShelfStory),
        saved: shelf.saved.map(toShelfStory),
        completed: shelf.completed.map(toShelfStory),
      }}
      lists={lists}
      goal={{ ...goal, pace: goalPace(goal) }}
    />
  );
}
