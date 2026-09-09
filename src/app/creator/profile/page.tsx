import { CreatorProfile } from '@/components/creator-profile';
import { requireCreator } from '@/lib/require-creator';
export default async function Page() {
  const user = await requireCreator();
  return <CreatorProfile user={user} />;
}
