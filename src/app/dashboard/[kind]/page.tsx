import { redirect } from 'next/navigation';

export default async function Dashboard({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  redirect(kind === 'creator' ? '/creator/dashboard' : '/reader/dashboard');
}
