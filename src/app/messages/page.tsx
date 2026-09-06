import { redirect } from 'next/navigation';
import { MessagesPage } from '@/components/messages-page';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <MessagesPage role={user.role} />;
}
