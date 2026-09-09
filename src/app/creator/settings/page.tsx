import { CreatorToolPage } from '@/components/creator-studio';
import { requireCreator } from '@/lib/require-creator';
export default async function Page() {
  await requireCreator();
  return (
    <CreatorToolPage
      title="Settings"
      copy="Manage your creator profile, account and publishing preferences."
    />
  );
}
