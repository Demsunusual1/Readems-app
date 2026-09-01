import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CaretRight,
} from '@phosphor-icons/react/dist/ssr';
import { catalogue } from '@/lib/discover';
import { getChapters, readingMinutes } from '@/lib/chapters';
import { Logo } from '@/components/ui/logo';
import { StoryProgress } from '@/components/story-progress';
import '@/components/reading.css';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const story = catalogue.find((item) => item.id === storyId);
  return {
    title: story ? `${story.title} | Readems` : 'Story not found | Readems',
  };
}
export default async function StoryPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const story = catalogue.find((item) => item.id === storyId);
  if (!story) notFound();
  const chapters = getChapters(storyId);
  return (
    <div className="story-page">
      <header className="story-top">
        <Link href="/discover" aria-label="Back to Discover">
          <ArrowLeft size={24} />
        </Link>
        <Logo tone="light" />
        <Link href="/login">My account</Link>
      </header>
      <main>
        <section className="story-hero">
          <div className="story-hero-inner">
            <Image
              className="story-detail-cover"
              src={story.cover}
              alt={`Cover artwork for ${story.title}`}
              width={280}
              height={350}
              priority
            />
            <div>
              <p className="story-kicker">SAMPLE STORY · {story.category}</p>
              <h1>{story.title}</h1>
              <p>by {story.author}</p>
              <p>
                {chapters.length
                  ? `${chapters.length} sample chapters · English`
                  : 'Story concept · Chapters coming soon'}
              </p>
              {chapters.length > 0 && (
                <Link
                  className="story-primary"
                  href={`/stories/${storyId}/chapters/1`}
                >
                  <BookOpen />
                  Start reading
                </Link>
              )}
            </div>
          </div>
        </section>
        <div className="story-content">
          <section>
            <h2>About this story</h2>
            <p>{story.description}</p>
            <div className="story-tags">
              {story.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="story-disclaimer">
              Demonstration content for exploring Readems. This is not a
              published creator submission.
            </p>
          </section>
          {chapters.length > 0 && <StoryProgress storyId={storyId} />}
          <section aria-labelledby="chapter-list">
            <h2 id="chapter-list">Chapters</h2>
            {chapters.length ? (
              <ol className="story-chapters">
                {chapters.map((chapter) => (
                  <li key={chapter.number}>
                    <Link
                      href={`/stories/${storyId}/chapters/${chapter.number}`}
                    >
                      <div>
                        <strong>
                          {chapter.number}. {chapter.title}
                        </strong>
                        <span>
                          {readingMinutes(chapter)} min read · sample chapter
                        </span>
                      </div>
                      <CaretRight aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p>
                No chapters have been added to this story yet.{' '}
                <Link href="/stories/baobab">
                  Try the Baobab sample reader.
                </Link>
              </p>
            )}
          </section>
          <Link href="/discover">Explore more stories</Link>
        </div>
      </main>
    </div>
  );
}
