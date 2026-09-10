import { CreatorToolPage } from '@/components/creator-studio';
import { requireCreator } from '@/lib/require-creator';
export default async function Page() {
  await requireCreator();
  return (
    <CreatorToolPage
      title="Earnings"
      copy="Track revenue, transactions and payouts from your stories."
    />
  );
}
