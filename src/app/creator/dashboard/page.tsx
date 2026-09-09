import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CreatorDashboard } from '@/components/creator-dashboard';
import { getCreatorAnalytics, percentChange } from '@/lib/analytics';
import { getCurrentUser } from '@/lib/auth';
import { getMyStories } from '@/lib/creator';
import { getAudienceActivity, getScheduledChapters } from '@/lib/dashboards';
import { countUnread } from '@/lib/notifications';

export const metadata: Metadata = {
  title: 'Creator dashboard | Readems',
  description: 'What your stories have done and what is still in the queue.',
};

const WINDOW_DAYS = 30;

const date = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'READER') redirect('/reader/dashboard');

  const [analytics, mine, schedule, audience, unread] = await Promise.all([
    getCreatorAnalytics(user.id, WINDOW_DAYS),
    getMyStories(user.id),
    getScheduledChapters(user.id, 3),
    getAudienceActivity(user.id, 7),
    countUnread(user.id),
  ]);

  // The story a writer is working on now is their most recently touched
  // published one, which getMyStories already sorts towards the front.
  const current = mine.published[0] ?? null;

  return (
    <CreatorDashboard
      user={{
        fullName: user.fullName,
        username: user.username,
        avatarUrl: user.avatarUrl,
      }}
      unread={unread}
      totals={{
        reads: analytics.reads,
        readsChange: percentChange(analytics.reads, analytics.readsBefore),
        followers: analytics.followers,
        followersGained: analytics.followersGained,
        published: mine.published.length,
        windowDays: WINDOW_DAYS,
      }}
      current={
        current && {
          id: current.id,
          title: current.title,
          genre: current.genre,
          coverUrl: current.coverUrl,
          chapters: current.chapters,
          reads: current.reads,
          likes: current.likes,
          comments: current.comments,
        }
      }
      drafts={mine.drafts.slice(0, 3).map((story) => ({
        id: story.id,
        title: story.title,
        chapters: story.chapters,
      }))}
      schedule={schedule.map((chapter) => ({
        id: chapter.id,
        storyId: chapter.storyId,
        storyTitle: chapter.storyTitle,
        label: `Chapter ${chapter.number}: ${chapter.title}`,
        when: date.format(chapter.scheduledFor),
      }))}
      audience={audience}
      readsOverTime={analytics.readsOverTime}
    />
  );
}
