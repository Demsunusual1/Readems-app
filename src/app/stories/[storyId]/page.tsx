import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  BookmarkSimple,
  CaretRight,
  Feather,
  Heart,
  House,
  ShareNetwork,
  Star,
  Translate,
  UsersThree,
  UserCircle,
  Eye,
  DotsThree,
} from '@phosphor-icons/react/dist/ssr';
import { catalogue } from '@/lib/discover';
import { getChapters, readingMinutes } from '@/lib/chapters';
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
  const story = catalogue.find((item) => item.id === storyId);
  return {
    title: story ? `${story.title} | Readems` : 'Story not found | Readems',
  };
}

const similar = [
  [
    'The Boy Who Painted Silence',
    'Ana Ndlovu',
    '4.7',
    '/readems/featured-when-stars-learn-to-bloom.png',
  ],
  [
    'Shadows of the Drum',
    'Zanele M.',
    '4.6',
    '/readems/cover-shadows-of-the-drum.png',
  ],
  [
    'Letters to My Younger Self',
    'Lesli Johnson',
    '4.8',
    '/readems/cover-letters-to-my-younger-self.png',
  ],
  [
    'The Last Train to Makoko',
    'Tariro Chinedu',
    '4.5',
    '/readems/cover-last-train-to-makoko.png',
  ],
] as const;

export default async function StoryPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const story = catalogue.find((item) => item.id === storyId);
  if (!story) notFound();
  const chapters = getChapters(storyId);
  const isBaobab = storyId === 'baobab';
  const title = isBaobab ? 'Beneath the Baobab Tree' : story.title;
  const author = isBaobab ? 'Chineu Odafe' : story.author;
  const description = isBaobab
    ? 'In a village where stories are carried by the wind, a young girl uncovers a family secret that could change everything. Set against the backdrop of resilience, tradition, and hope, this is a coming-of-age tale about courage, belonging, and the roots that ground us.'
    : story.description;
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
            src={isBaobab ? '/readems/story-baobab-cover.png' : story.cover}
            alt={`Cover artwork for ${title}`}
            width={265}
            height={325}
            priority
          />
          <div className="details-summary">
            <span>FEATURED STORY</span>
            <h1>{title}</h1>
            <p>
              by <strong>{author}</strong>
            </p>
            <div className="details-stats">
              <span>
                <Star weight="fill" />
                <b>4.8</b>
                <small>(1.2K)</small>
              </span>
              <span>
                <Eye />
                <b>98K</b>
                <small>Reads</small>
              </span>
              <span>
                <BookOpen />
                <b>42%</b>
                <small>Complete</small>
              </span>
            </div>
          </div>
        </div>
        <StoryActions storyId={storyId} canRead={chapters.length > 0} />
      </section>

      <main className="details-content">
        <p className="details-description">{description}</p>
        <div className="details-meta">
          <span>
            <BookOpen />
            <b>African Literature</b>
            <small>Genre</small>
          </span>
          <span>
            <UsersThree />
            <b>Young Adult</b>
            <small>Audience</small>
          </span>
          <span>
            <Translate />
            <b>English</b>
            <small>Language</small>
          </span>
        </div>
        <section className="details-tags">
          <h2>Content Tags</h2>
          <div>
            {[
              'Family Secrets',
              'Coming of Age',
              'Culture & Heritage',
              'Resilience',
              '+2',
            ].map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>
        {chapters.length > 0 && <StoryProgress storyId={storyId} />}
        <section className="details-chapters" aria-labelledby="chapter-list">
          <div className="details-heading">
            <h2 id="chapter-list">
              Chapters <small>{chapters.length} chapters · 42% complete</small>
            </h2>
            <Link href={`/stories/${storyId}/chapters/1`}>View all</Link>
          </div>
          {chapters.length ? (
            <ol>
              {chapters.slice(0, 3).map((chapter, index) => (
                <li key={chapter.number}>
                  <Link href={`/stories/${storyId}/chapters/${chapter.number}`}>
                    <span>
                      <b>
                        {chapter.number}. {chapter.title}
                      </b>
                      <small>{readingMinutes(chapter)} min read</small>
                    </span>
                    <span>
                      {index === 0 ? '100%' : index === 1 ? '75%' : '0%'}
                    </span>
                    <CaretRight />
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p>Chapters coming soon.</p>
          )}
        </section>
        <section className="details-reviews">
          <div className="details-heading">
            <h2>Reader Reviews</h2>
            <Link href="#reviews">View all</Link>
          </div>
          <article id="reviews">
            <Image
              src="/readems/community-zara.png"
              alt="Amara N."
              width={52}
              height={52}
            />
            <div>
              <p>
                <b>Amara N.</b> <span>Verified Reader</span>
              </p>
              <p className="details-stars">
                ★★★★★ <small>· 2 days ago</small>
              </p>
              <p>
                A beautifully written story that stayed with me long after the
                last page. The characters feel so real.
              </p>
              <footer>
                <Heart /> 24 <button>Reply</button>
              </footer>
            </div>
            <BookmarkSimple />
          </article>
        </section>
        <section className="details-similar">
          <div className="details-heading">
            <h2>Similar Stories</h2>
            <Link href="/discover">View all</Link>
          </div>
          <div>
            {similar.map(([name, by, rating, image]) => (
              <Link href="/discover" key={name}>
                <span>
                  <Image src={image} alt="" fill sizes="160px" />
                  <b>{name}</b>
                </span>
                <small>{by}</small>
                <small>
                  <Star weight="fill" /> {rating}
                </small>
              </Link>
            ))}
          </div>
        </section>
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
