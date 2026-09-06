import { CreatorAnalytics } from '@/components/creator-analytics';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  return <CreatorAnalytics avatarUrl={user?.avatarUrl} />;
}
