import { CreatorToolPage } from '@/components/creator-studio';
import { requireCreator } from '@/lib/require-creator';
export default async function Page() {
  await requireCreator();
  return (
    <CreatorToolPage
      title="Notifications"
      copy="Review story activity, reader interactions and creator updates."
    />
  );
}
