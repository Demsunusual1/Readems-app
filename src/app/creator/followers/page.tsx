import { CreatorToolPage } from '@/components/creator-studio';
import { requireCreator } from '@/lib/require-creator';
export default async function Page() {
  await requireCreator();
  return (
    <CreatorToolPage
      title="Followers"
      copy="Understand your audience and manage your reader community."
    />
  );
}
