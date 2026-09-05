import { redirect } from 'next/navigation';
import { CreatorAnalytics } from '@/components/creator-analytics';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'READER') redirect('/reader/dashboard');
  return <CreatorAnalytics avatarUrl={user.avatarUrl} />;
}
