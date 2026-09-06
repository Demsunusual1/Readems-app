import { redirect } from 'next/navigation';
import { NotificationsPage } from '@/components/notifications-page';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <NotificationsPage role={user.role} />;
}
