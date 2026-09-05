import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ReaderLibrary } from '@/components/reader-library';

export const metadata: Metadata = {
  title: 'My Library | Readems',
  description: 'Continue reading and organise your saved Readems stories.',
};

export default async function LibraryPage() {
  const hasSession = (await cookies()).has('readems_session');
  const user = hasSession
    ? await import('@/lib/auth').then(({ getCurrentUser }) => getCurrentUser())
    : null;

  return (
    <ReaderLibrary
      profileHref={
        user
          ? `/${user.role === 'CREATOR' ? 'creator' : 'reader'}/dashboard`
          : '/login'
      }
    />
  );
}
