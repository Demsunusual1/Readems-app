import { redirect } from 'next/navigation';
import { ProfileSettingsPage } from '@/components/profile-settings-page';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <ProfileSettingsPage
      user={{
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }}
    />
  );
}
