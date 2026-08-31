import { redirect } from 'next/navigation';
import { ReaderDashboard } from '@/components/reader-dashboard';
import { getCurrentUser } from '@/lib/auth';
export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'CREATOR') redirect('/creator/dashboard');
  return <ReaderDashboard user={user} />;
}
