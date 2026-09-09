import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { coverChoices, getMyStory, storyGenres } from '@/lib/creator';
import { StoryManager } from '@/components/story-manager';
import '@/components/creator.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const user = await getCurrentUser();
  const story = user ? await getMyStory(user.id, storyId) : null;
  return { title: story ? `${story.title} | Readems` : 'Story | Readems' };
}

export default async function ManageStoryPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const story = await getMyStory(user.id, storyId);
  if (!story) notFound();

  return (
    <div className="creator-page">
      <header className="creator-hero">
        <Link href="/creator/stories" aria-label="Back to my stories">
          <ArrowLeft />
        </Link>
        <div className="creator-hero-copy">
          <div>
            <h1>{story.title}</h1>
            <p>
              {story.status === 'PUBLISHED'
                ? 'Published'
                : story.status === 'SCHEDULED'
                  ? 'Scheduled'
                  : 'Draft'}{' '}
              · {story.chapters.length}{' '}
              {story.chapters.length === 1 ? 'chapter' : 'chapters'}
            </p>
          </div>
          {story.status === 'PUBLISHED' && (
            <Link className="creator-primary" href={`/stories/${story.id}`}>
              View as a reader
            </Link>
          )}
        </div>
      </header>

      <main className="creator-main">
        <StoryManager
          story={{
            id: story.id,
            title: story.title,
            synopsis: story.synopsis,
            genre: story.genre,
            audience: story.audience,
            tags: story.tags,
            coverUrl: story.coverUrl,
            status: story.status,
            reads: story.reads,
            likes: story.likes,
            comments: story.comments,
          }}
          chapters={story.chapters.map((chapter) => ({
            id: chapter.id,
            number: chapter.number,
            title: chapter.title,
            status: chapter.status,
            words: chapter.words,
            scheduledFor: chapter.scheduledFor?.toISOString() ?? null,
            updatedAt: chapter.updatedAt.toISOString(),
          }))}
          genres={[...storyGenres]}
          covers={[...coverChoices]}
        />
      </main>
    </div>
  );
}
