import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CaretRight,
} from '@phosphor-icons/react/dist/ssr';
import { LibraryButton } from '@/components/library-button';
import { Logo } from '@/components/ui/logo';
import { getCurrentUser } from '@/lib/auth';
import { getReadingStory, readingStories } from '@/lib/reading';
import { getStoryReadingState } from '@/lib/reading-state';
import '@/components/story-reading.css';

export function generateStaticParams() {
  return readingStories.map((story) => ({ id: story.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const story = getReadingStory(id);

  return story
    ? { title: `${story.title} | Readems`, description: story.description }
    : { title: 'Story not found | Readems' };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = getReadingStory(id);
  if (!story) notFound();

  const user = await getCurrentUser();
  const state = user
    ? await getStoryReadingState(user.id, story.id)
    : { progress: null, saved: false };
  const resumeChapter =
    story.chapters.find(
      (chapter) => chapter.number === state.progress?.chapterNumber,
    ) ?? story.chapters[0];

  return (
    <div className="story-page">
      <header className="story-topbar">
        <Logo tone="dark" />
        <nav aria-label="Story navigation">
          <Link href="/discover">Discover</Link>
          <Link href="/">Home</Link>
        </nav>
      </header>
      <main className="story-main">
        <Link href="/discover" className="chapter-breadcrumb">
          <ArrowLeft /> Back to Discover
        </Link>
        <section className="story-hero">
          <div className="story-cover">
            <Image
              src={story.cover}
              alt={`Cover artwork for ${story.title}`}
              fill
              sizes="250px"
              priority
            />
          </div>
          <div className="story-copy">
            <p className="story-eyebrow">
              {story.category.toUpperCase()} · {story.status.toUpperCase()}
            </p>
            <h1>{story.title}</h1>
            <p className="story-author">by {story.author}</p>
            <p className="story-subtitle">{story.subtitle}</p>
            <div className="story-tags">
              <span>{story.category}</span>
              {story.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="story-actions">
              <Link
                className="story-primary"
                href={`/story/${story.id}/chapter/${resumeChapter.number}`}
              >
                <BookOpen />
                {state.progress ? 'Continue reading' : 'Start reading'}
              </Link>
              <LibraryButton
                storyId={story.id}
                signedIn={Boolean(user)}
                initialSaved={state.saved}
              />
            </div>
            {state.progress && (
              <p className="story-resume-note">
                Saved at chapter {state.progress.chapterNumber} ·{' '}
                {state.progress.progressPercent}% through the page
              </p>
            )}
            <div className="story-facts">
              <span>
                <strong>{story.chapters.length}</strong>Preview chapters
              </span>
              <span>
                <strong>{story.language}</strong>Language
              </span>
              <span>
                <strong>{story.status}</strong>Story status
              </span>
            </div>
          </div>
        </section>
        <section className="chapter-list" aria-labelledby="chapters-title">
          <div className="chapter-list-header">
            <div>
              <p className="story-eyebrow">READ THE PREVIEW</p>
              <h2 id="chapters-title">Chapters</h2>
            </div>
            <p>Sample content while creator publishing is being connected.</p>
          </div>
          {story.chapters.map((chapter) => (
            <Link
              className="chapter-row"
              href={`/story/${story.id}/chapter/${chapter.number}`}
              key={chapter.number}
              aria-current={
                state.progress?.chapterNumber === chapter.number
                  ? 'location'
                  : undefined
              }
            >
              <span className="chapter-number">{chapter.number}</span>
              <div>
                <h3>{chapter.title}</h3>
                <p>
                  {chapter.publishedLabel} · {chapter.readTime}
                </p>
              </div>
              <CaretRight aria-hidden="true" />
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
