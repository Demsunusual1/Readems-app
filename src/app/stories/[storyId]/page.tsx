import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CaretRight,
  Clock,
  DotsThree,
  Eye,
  Feather,
  House,
  ShareNetwork,
  Translate,
  UserCircle,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { readingMinutes } from '@/lib/chapters';
import { getPublishedChapters, getStory, listStories } from '@/lib/stories';
import { Logo } from '@/components/ui/logo';
import { StoryProgress } from '@/components/story-progress';
import { StoryActions } from '@/components/story-actions';
import '@/components/reading.css';
import '@/components/story-details.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const story = await getStory(storyId);
  return {
    title: story ? `${story.title} | Readems` : 'Story not found | Readems',
    description: story?.synopsis,
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const story = await getStory(storyId);
  if (!story) notFound();
  const chapters = await getPublishedChapters(story.id);
  const minutes = chapters.reduce(
    (total, chapter) => total + readingMinutes(chapter),
    0,
  );
  const similar = (await listStories({ genre: story.genre, limit: 5 })).filter(
    (item) => item.id !== story.id,
  );

  return (
    <div className="story-page">
      <section className="details-hero">
        <header className="details-top">
          <Link href="/discover" aria-label="Back to Discover">
            <ArrowLeft />
          </Link>
          <Logo tone="light" />
          <div>
            <button aria-label="Share story">
              <ShareNetwork />
            </button>
            <button aria-label="More options">
              <DotsThree />
            </button>
          </div>
        </header>
        <div className="details-hero-inner">
          <Image
            className="details-cover"
            src={story.coverUrl}
            alt={`Cover artwork for ${story.title}`}
            width={265}
            height={325}
            priority
          />
          <div className="details-summary">
            <span>{story.featured ? 'FEATURED STORY' : 'STORY'}</span>
            <h1>{story.title}</h1>
            <p>
              by <strong>{story.authorName}</strong>
            </p>
            <div className="details-stats">
              <span>
                <BookOpen />
                <b>{chapters.length}</b>
                <small>{chapters.length === 1 ? 'Chapter' : 'Chapters'}</small>
              </span>
              <span>
                <Clock />
                <b>{minutes || '—'}</b>
                <small>Minutes</small>
              </span>
              <span>
                <UsersThree />
                <b>{story.audience}</b>
                <small>Audience</small>
              </span>
            </div>
          </div>
        </div>
        <StoryActions storyId={story.id} canRead={chapters.length > 0} />
      </section>

      <main className="details-content">
        <p className="details-description">{story.synopsis}</p>
        <div className="details-meta">
          <span>
            <BookOpen />
            <b>{story.genre}</b>
            <small>Genre</small>
          </span>
          <span>
            <UsersThree />
            <b>{story.audience}</b>
            <small>Audience</small>
          </span>
          <span>
            <Translate />
            <b>{story.language}</b>
            <small>Language</small>
          </span>
        </div>
        {story.tags.length > 0 && (
          <section className="details-tags">
            <h2>Content Tags</h2>
            <div>
              {story.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </section>
        )}
        {chapters.length > 0 && <StoryProgress storyId={story.id} />}
        <section className="details-chapters" aria-labelledby="chapter-list">
          <div className="details-heading">
            <h2 id="chapter-list">
              Chapters{' '}
              <small>
                {chapters.length}{' '}
                {chapters.length === 1 ? 'chapter' : 'chapters'}
              </small>
            </h2>
            {chapters.length > 0 && (
              <Link href={`/stories/${story.id}/chapters/1`}>Start</Link>
            )}
          </div>
          {chapters.length ? (
            <ol>
              {chapters.map((chapter) => (
                <li key={chapter.number}>
                  <Link
                    href={`/stories/${story.id}/chapters/${chapter.number}`}
                  >
                    <span>
                      <b>
                        {chapter.number}. {chapter.title}
                      </b>
                      <small>{readingMinutes(chapter)} min read</small>
                    </span>
                    <CaretRight />
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p>This story has no published chapters yet.</p>
          )}
        </section>
        {similar.length > 0 && (
          <section className="details-similar">
            <div className="details-heading">
              <h2>Similar Stories</h2>
              <Link href={`/discover?genre=${encodeURIComponent(story.genre)}`}>
                View all
              </Link>
            </div>
            <div>
              {similar.map((item) => (
                <Link href={`/stories/${item.id}`} key={item.id}>
                  <span>
                    <Image src={item.coverUrl} alt="" fill sizes="160px" />
                    <b>{item.title}</b>
                  </span>
                  <small>{item.authorName}</small>
                  <small>{item.genre}</small>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <nav className="details-bottom" aria-label="Primary navigation">
        <Link href="/">
          <House weight="fill" />
          <span>Home</span>
        </Link>
        <Link href="/discover">
          <Eye />
          <span>Explore</span>
        </Link>
        <Link href="/library">
          <BookOpen />
          <span>Library</span>
        </Link>
        <Link href="/signup?role=creator">
          <Feather />
          <span>Write</span>
        </Link>
        <Link href="/login">
          <UserCircle />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
