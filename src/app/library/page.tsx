import { redirect } from 'next/navigation';
import { LibraryPage } from '@/components/library-page';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <LibraryPage role={user.role} />;
}
