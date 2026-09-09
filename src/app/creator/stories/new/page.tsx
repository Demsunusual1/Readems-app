import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { coverChoices, storyGenres } from '@/lib/creator';
import { NewStoryForm } from '@/components/new-story-form';
import '@/components/creator.css';

export const metadata: Metadata = { title: 'New story | Readems' };

export default async function NewStoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return (
    <div className="creator-page">
      <header className="creator-hero">
        <h1>Start a new story</h1>
        <p>A story stays a draft until you publish it.</p>
      </header>
      <main className="creator-main">
        <NewStoryForm genres={[...storyGenres]} covers={[...coverChoices]} />
      </main>
    </div>
  );
}
