import { CreatorStudio } from '@/components/creator-studio';
import { requireCreator } from '@/lib/require-creator';
export default async function Page() {
  const user = await requireCreator();
  return <CreatorStudio name={user.fullName || 'Creator'} />;
}
