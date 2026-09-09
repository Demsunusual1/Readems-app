import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Discover } from '@/components/discover';
import {
  discoverGenres,
  discoverRegions,
  discoverTrends,
} from '@/lib/discover-sections';
import {
  countStoriesByGenre,
  countStoriesByTag,
  listStories,
} from '@/lib/stories';

export const metadata: Metadata = {
  title: 'Discover stories | Readems',
  description:
    'Explore Readems story previews, African folktales, romance, fantasy and mystery.',
};
export default async function DiscoverPage() {
  const hasSession = (await cookies()).has('readems_session');
  const user = hasSession
    ? await import('@/lib/auth').then(({ getCurrentUser }) => getCurrentUser())
    : null;
  const [genreCounts, tagCounts, stories] = await Promise.all([
    countStoriesByGenre([...discoverGenres]),
    countStoriesByTag([
      ...discoverRegions.map((region) => region.tag),
      ...discoverTrends.map((trend) => trend.tag),
    ]),
    listStories({ limit: 12 }),
  ]);

  return (
    <Discover
      counts={Object.fromEntries([...genreCounts, ...tagCounts])}
      stories={stories.map((story) => ({
        id: story.id,
        title: story.title,
        authorName: story.authorName,
        coverUrl: story.coverUrl,
        genre: story.genre,
        chapterCount: story.chapterCount,
      }))}
      dashboardHref={
        user
          ? `/${user.role === 'CREATOR' ? 'creator' : 'reader'}/dashboard`
          : '/login'
      }
    />
  );
}
