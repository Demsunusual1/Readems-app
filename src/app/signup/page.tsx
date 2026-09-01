import { SignupWizard } from '@/components/signup-wizard';
import { getCurrentUser, dashboardForRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(dashboardForRole(user.role));
  const { role } = await searchParams;
  return (
    <SignupWizard initialRole={role === 'creator' ? 'CREATOR' : 'READER'} />
  );
}
