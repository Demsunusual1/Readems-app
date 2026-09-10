import { CreatorToolPage } from '@/components/creator-studio';
import { requireCreator } from '@/lib/require-creator';
export default async function Page() {
  await requireCreator();
  return (
    <CreatorToolPage
      title="Help & Support"
      copy="Find creator guides and contact Readems support."
    />
  );
}
