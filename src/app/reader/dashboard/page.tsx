import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ReaderDashboard } from '@/components/reader-dashboard';
import { getCurrentUser } from '@/lib/auth';
import {
  countReadersByStory,
  getCommunityPulse,
  getReadingStreak,
  getRecommendations,
  getTrendingSerials,
} from '@/lib/dashboards';
import { getShelf } from '@/lib/library';
import { countUnread } from '@/lib/notifications';
import { getCreatorUpdates } from '@/lib/people';
import { relativeTime } from '@/lib/time';

export const metadata: Metadata = {
  title: 'Your dashboard | Readems',
  description: 'Pick up your reading and see what the writers you follow made.',
};

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'CREATOR') redirect('/creator/dashboard');

  const [shelf, streak, recommended, trending, updates, pulse, unread] =
    await Promise.all([
      getShelf(user.id),
      getReadingStreak(user.id),
      getRecommendations(user.id, user.interests, 3),
      getTrendingSerials({ days: 30, limit: 3 }),
      getCreatorUpdates(user.id, 4),
      getCommunityPulse(),
      countUnread(user.id),
    ]);

  // How many people are reading each suggestion is a separate count; the story
  // row does not carry one.
  const readers = await countReadersByStory(
    recommended.map((story) => story.id),
  );

  return (
    <ReaderDashboard
      user={{
        fullName: user.fullName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        interests: user.interests,
      }}
      unread={unread}
      streakDays={streak.days}
      continueReading={shelf.current.slice(0, 3).map((entry) => ({
        id: entry.story.id,
        title: entry.story.title,
        author: entry.story.authorName,
        coverUrl: entry.story.coverUrl,
        percent: entry.percent,
        href: `/stories/${entry.story.id}/chapters/${entry.chapter}`,
      }))}
      recommendations={recommended.map((story) => ({
        id: story.id,
        title: story.title,
        author: story.authorName,
        coverUrl: story.coverUrl,
        genre: story.genre,
        readers: readers.get(story.id) ?? 0,
      }))}
      trending={trending}
      updates={updates.map((update) => ({
        key: `${update.storyId}-${update.chapterNumber}`,
        creatorName: update.creatorName,
        creatorUsername: update.creatorUsername,
        storyTitle: update.storyTitle,
        storyHref: `/stories/${update.storyId}/chapters/${update.chapterNumber}`,
        chapterNumber: update.chapterNumber,
        when: relativeTime(update.publishedAt),
      }))}
      pulse={pulse}
    />
  );
}
