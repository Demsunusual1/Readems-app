import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export async function requireCreator() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'READER') redirect('/reader/dashboard');
  return user;
}
