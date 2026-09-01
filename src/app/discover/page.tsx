import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Discover } from '@/components/discover';

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
  return (
    <Discover
      interests={user?.interests ?? []}
      signedIn={Boolean(user)}
      dashboardHref={
        user
          ? `/${user.role === 'CREATOR' ? 'creator' : 'reader'}/dashboard`
          : '/login'
      }
    />
  );
}
