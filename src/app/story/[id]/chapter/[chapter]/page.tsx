import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { Logo } from '@/components/ui/logo';
import { ReadingToolbar } from '@/components/reading-toolbar';
import { getChapter, getReadingStory, readingStories } from '@/lib/reading';
import '@/components/story-reading.css';

export function generateStaticParams() {
  return readingStories.flatMap((story) =>
    story.chapters.map((chapter) => ({
      id: story.id,
      chapter: String(chapter.number),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; chapter: string }>;
}): Promise<Metadata> {
  const { id, chapter: chapterParam } = await params;
  const story = getReadingStory(id);
  const chapter = story
    ? getChapter(story, Number(chapterParam))
    : undefined;

  return chapter && story
    ? { title: `${chapter.title} — ${story.title} | Readems` }
    : { title: 'Chapter not found | Readems' };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapter: string }>;
}) {
  const { id, chapter: chapterParam } = await params;
  const story = getReadingStory(id);

  if (!story) notFound();

  const chapter = getChapter(story, Number(chapterParam));
  if (!chapter) notFound();

  const index = story.chapters.findIndex(
    (item) => item.number === chapter.number,
  );
  const previous = story.chapters[index - 1];
  const next = story.chapters[index + 1];

  return (
    <div className="chapter-page">
      <header className="chapter-topbar">
        <Logo tone="dark" />
        <nav aria-label="Reader navigation">
          <Link href={`/story/${story.id}`}>{story.title}</Link>
          <Link href="/discover">Discover</Link>
        </nav>
      </header>
      <main className="chapter-shell">
        <Link href={`/story/${story.id}`} className="chapter-breadcrumb">
          <ArrowLeft /> Story details
        </Link>
        <header className="chapter-heading">
          <p>
            CHAPTER {chapter.number} OF {story.chapters.length}
          </p>
          <h1>{chapter.title}</h1>
          <span>
            {story.title} · {chapter.readTime}
          </span>
        </header>
        <ReadingToolbar />
        <article
          className="chapter-body"
          aria-label={`${chapter.title} chapter text`}
        >
          {chapter.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
        <nav className="chapter-nav" aria-label="Chapter navigation">
          {previous && (
            <Link
              className="previous"
              href={`/story/${story.id}/chapter/${previous.number}`}
            >
              ← Previous chapter
            </Link>
          )}
          {next ? (
            <Link
              className="next"
              href={`/story/${story.id}/chapter/${next.number}`}
            >
              Next chapter →
            </Link>
          ) : (
            <Link className="next" href={`/story/${story.id}`}>
              Back to story
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
