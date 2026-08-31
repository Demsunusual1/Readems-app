import { redirect } from 'next/navigation';
import { CreatorDashboard } from '@/components/creator-dashboard';
import { getCurrentUser } from '@/lib/auth';
export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'READER') redirect('/reader/dashboard');
  return <CreatorDashboard user={user} />;
}
