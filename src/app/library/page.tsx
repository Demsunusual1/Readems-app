import type { Metadata } from 'next';
import { ReaderLibrary } from '@/components/reader-library';

export const metadata: Metadata = {
  title: 'My Library | Readems',
  description: 'Continue reading and organise your saved Readems stories.',
};

export default async function LibraryPage() {
  return <ReaderLibrary />;
}
