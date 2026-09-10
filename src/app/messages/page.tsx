import { redirect } from 'next/navigation';
import { MessagesPage } from '@/components/messages-page';
import { getCurrentUser } from '@/lib/auth';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const { from } = await searchParams;
  return (
    <MessagesPage
      role={user.role}
      platform={user.role === 'CREATOR' && from === 'platform'}
    />
  );
}
