import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, CaretRight, BookmarkSimple } from '@phosphor-icons/react/dist/ssr';
import { Logo } from '@/components/ui/logo';
import { getReadingStory, readingStories } from '@/lib/reading';
import '@/components/story-reading.css';

export function generateStaticParams() {
  return readingStories.map((story) => ({ id: story.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const story = getReadingStory(id);
  return story
    ? { title: `${story.title} | Readems`, description: story.description }
    : { title: 'Story not found | Readems' };
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = getReadingStory(id);
  if (!story) notFound();
  const firstChapter = story.chapters[0];

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
        <Link href="/discover" className="chapter-breadcrumb"><ArrowLeft /> Back to Discover</Link>
        <section className="story-hero" style={{ marginTop: 30 }}>
          <div className="story-cover">
            <Image src={story.cover} alt={`Cover artwork for ${story.title}`} fill sizes="250px" priority />
          </div>
          <div className="story-copy">
            <p className="story-eyebrow">{story.category.toUpperCase()} · {story.status.toUpperCase()}</p>
            <h1>{story.title}</h1>
            <p className="story-author">by {story.author}</p>
            <p className="story-subtitle">{story.subtitle}</p>
            <div className="story-tags">
              <span>{story.category}</span>
              {story.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <div className="story-actions">
              <Link className="story-primary" href={`/story/${story.id}/chapter/${firstChapter.number}`}>
                <BookOpen /> Start reading
              </Link>
              <Link className="story-secondary" href="/signup">
                <BookmarkSimple /> Save to library
              </Link>
            </div>
            <div className="story-facts">
              <span><strong>{story.chapters.length}</strong>Preview chapters</span>
              <span><strong>{story.language}</strong>Language</span>
              <span><strong>{story.status}</strong>Story status</span>
            </div>
          </div>
        </section>
        <section className="chapter-list" aria-labelledby="chapters-title">
          <div className="chapter-list-header">
            <div><p className="story-eyebrow">READ THE PREVIEW</p><h2 id="chapters-title">Chapters</h2></div>
            <p>Sample content while creator publishing is being connected.</p>
          </div>
          {story.chapters.map((chapter) => (
            <Link className="chapter-row" href={`/story/${story.id}/chapter/${chapter.number}`} key={chapter.number}>
              <span className="chapter-number">{chapter.number}</span>
              <div><h3>{chapter.title}</h3><p>{chapter.publishedLabel} · {chapter.readTime}</p></div>
              <CaretRight aria-hidden="true" />
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
