import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getMyChapter } from '@/lib/creator';
import { ChapterEditor } from '@/components/chapter-editor';
import '@/components/creator.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const user = await getCurrentUser();
  const chapter = user ? await getMyChapter(user.id, chapterId) : null;
  return {
    title: chapter ? `Editing ${chapter.title} | Readems` : 'Chapter | Readems',
  };
}

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ storyId: string; chapterId: string }>;
}) {
  const { storyId, chapterId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const chapter = await getMyChapter(user.id, chapterId);
  if (!chapter || chapter.story.id !== storyId) notFound();

  return (
    <div className="creator-page editor-page">
      <header className="editor-top">
        <Link href={`/creator/stories/${storyId}`} aria-label="Back to story">
          <ArrowLeft />
        </Link>
        <div>
          <strong>{chapter.story.title}</strong>
          <small>Chapter {chapter.number}</small>
        </div>
      </header>
      <ChapterEditor
        storyId={storyId}
        chapter={{
          id: chapter.id,
          number: chapter.number,
          title: chapter.title,
          body: chapter.body,
          authorNote: chapter.authorNote ?? '',
          status: chapter.status,
          scheduledFor: chapter.scheduledFor?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
