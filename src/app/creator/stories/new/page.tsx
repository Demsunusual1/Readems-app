import { redirect } from 'next/navigation';
import { CreateStory } from '@/components/create-story';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'READER') redirect('/reader/dashboard');
  return <CreateStory />;
}
