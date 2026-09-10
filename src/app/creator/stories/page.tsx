import { CreatorStories } from '@/components/creator-stories';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  return <CreatorStories avatarUrl={user?.avatarUrl ?? null} />;
}
