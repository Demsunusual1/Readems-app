import { redirect } from 'next/navigation';
import { StoryEditor } from '@/components/story-editor';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'READER') redirect('/reader/dashboard');
  return <StoryEditor />;
}
