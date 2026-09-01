import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  BookOpen,
  Books,
  CaretRight,
  Heart,
  House,
  MagnifyingGlass,
  MaskHappy,
  PenNib,
  Planet,
  SealCheck,
  Sparkle,
  UsersThree,
  UserCircle,
} from '@phosphor-icons/react/dist/ssr';
import { LandingHeader } from '@/components/landing-header';

const readingList = [
  [
    'Shadows of the Drum',
    'Chapter 12 · 24m left',
    '/readems/cover-shadows-of-the-drum.png',
  ],
  [
    'Letters to My Younger Self',
    'Chapter 8 · 10m left',
    '/readems/cover-letters-to-my-younger-self.png',
  ],
  [
    'The Last Train to Makoko',
    'Chapter 5 · 18m left',
    '/readems/cover-last-train-to-makoko.png',
  ],
] as const;

const featured = [
  [
    'Trending',
    'Beneath the Baobab Tree',
    'A family. A secret. A legacy that refuses to be buried.',
    'Historical Fiction',
    '23.4K readers',
    '/readems/featured-beneath-the-baobab-tree.png',
  ],
  [
    'New Episode',
    'The Archivist of Salt',
    'Some archives remember what people try to forget.',
    'Mystery',
    '15.7K readers',
    '/readems/featured-archivist-of-salt.png',
  ],
  [
    "Editor's Pick",
    'When Stars Learn to Bloom',
    'Love finds its way in the unlikeliest places.',
    'Romance',
    '19.2K readers',
    '/readems/featured-when-stars-learn-to-bloom.png',
  ],
] as const;

const genres = [
  [MaskHappy, 'African Stories'],
  [Heart, 'Romance'],
  [Sparkle, 'Fantasy'],
  [MagnifyingGlass, 'Mystery'],
  [Planet, 'Sci-Fi'],
  [BookOpen, 'Non-Fiction'],
] as const;

export default async function HomePage() {
  const hasSession = (await cookies()).has('readems_session');
  const user = hasSession
    ? await import('@/lib/auth').then(({ getCurrentUser }) => getCurrentUser())
    : null;
  const dashboard = user
    ? `/${user.role === 'CREATOR' ? 'creator' : 'reader'}/dashboard`
    : undefined;
  const readingHref = dashboard ?? '/signup';
  const writingHref = dashboard ?? '/signup?role=creator';

  return (
    <div className="official-landing">
      <div className="landing-hero-shell">
        <LandingHeader dashboardHref={dashboard} />
        <section
          className="official-hero landing-container"
          aria-labelledby="hero-title"
        >
          <div className="official-hero-copy">
            <p className="official-eyebrow">Welcome to Readems</p>
            <h1 id="hero-title">
              Stories that
              <br />
              stay <em>with you</em>
            </h1>
            <span className="hero-rule" aria-hidden="true" />
            <p>
              Read unforgettable stories, share your voice, and connect with
              readers and writers around the world.
            </p>
            <div className="official-actions">
              <Link className="button button-primary" href={readingHref}>
                {user ? 'Go to dashboard' : 'Start Reading'}
              </Link>
              <Link className="button button-secondary" href={writingHref}>
                <PenNib aria-hidden="true" /> Start Writing
              </Link>
            </div>
          </div>
          <div className="hero-asset">
            <Image
              src="/readems/hero-storyteller.png"
              alt="A storyteller emerging from an illuminated open book"
              fill
              priority
              sizes="(max-width: 767px) 100vw, 55vw"
            />
          </div>
        </section>
        <svg
          className="hero-wave"
          viewBox="0 0 1440 92"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 55C252 10 459 48 708 57c278 10 522 8 732-23v58H0Z" />
        </svg>
      </div>

      <main className="landing-main">
        <section
          className="landing-container continue-section"
          aria-labelledby="continue-title"
        >
          <div className="continue-heading">
            <div>
              <h2 id="continue-title">
                Good morning{user ? `, ${user.fullName.split(' ')[0]}` : ''}{' '}
                <Sparkle aria-hidden="true" />
              </h2>
              <p>Pick up where you left off</p>
            </div>
            <div className="reading-goal">
              <span>Reading goal</span>
              <strong>4 / 6 chapters</strong>
              <b>67%</b>
            </div>
          </div>
          <div className="continue-row">
            {readingList.map(([title, progress, image], index) => (
              <article key={title} className="continue-card">
                <Image src={image} alt="" width={78} height={104} />
                <div>
                  <h3>{title}</h3>
                  <p>{progress}</p>
                  <span>
                    <i style={{ width: `${74 - index * 12}%` }} />
                  </span>
                </div>
              </article>
            ))}
            <Link href={readingHref} className="discover-card">
              <BookOpen aria-hidden="true" />
              <span>
                Discover more
                <br />
                stories
              </span>
              <CaretRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          className="landing-container featured-section"
          aria-labelledby="stories-title"
        >
          <div className="section-title">
            <h2 id="stories-title">Featured Serial</h2>
            <Link href={readingHref}>
              View all <CaretRight />
            </Link>
          </div>
          <div className="featured-row">
            {featured.map(([label, title, copy, genre, readers, image]) => (
              <article className="featured-card" key={title}>
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 80vw, 370px"
                />
                <div>
                  <span className="feature-label">{label}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <footer>
                    <small>{genre}</small>
                    <span>
                      <UsersThree /> {readers}
                    </span>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="landing-container community-live"
          aria-labelledby="community-title"
        >
          <div className="section-title">
            <h2 id="community-title">
              Live in the Community <small>● 1,248 online now</small>
            </h2>
            <Link href="/signup">
              See all activity <CaretRight />
            </Link>
          </div>
          <div className="activity-row">
            <article>
              <Image
                src="/readems/community-daniel.png"
                alt="Daniel E."
                width={58}
                height={58}
              />
              <p>
                <strong>Daniel E.</strong> published Chapter 9
                <small>2m ago</small>
              </p>
            </article>
            <article>
              <Image
                src="/readems/community-zara.png"
                alt="Zara K."
                width={58}
                height={58}
              />
              <p>
                <strong>Zara K.</strong> left a review on The Drum
                <small>5m ago</small>
              </p>
            </article>
            <article>
              <Image
                src="/readems/community-daniel.png"
                alt="Tunde A."
                width={58}
                height={58}
              />
              <p>
                <strong>Tunde A.</strong> started reading Makoko
                <small>8m ago</small>
              </p>
            </article>
          </div>
        </section>

        <section
          className="landing-container creator-spotlight"
          aria-labelledby="spotlight-title"
        >
          <div className="spotlight-copy">
            <p>Creator Spotlight</p>
            <h2 id="spotlight-title">
              Chinelo Okoye <SealCheck />
            </h2>
            <strong>Author of Whispers of the Lagoon</strong>
            <span>
              Crafting stories that celebrate culture, resilience, and the human
              spirit.
            </span>
          </div>
          <div className="spotlight-image">
            <Image
              src="/readems/community-zara.png"
              alt="Chinelo Okoye, creator spotlight"
              fill
              sizes="320px"
            />
          </div>
          <dl>
            <div>
              <dt>12.8K</dt>
              <dd>Followers</dd>
            </div>
            <div>
              <dt>3</dt>
              <dd>Published Works</dd>
            </div>
            <div>
              <dt>4.9</dt>
              <dd>Community Rating</dd>
            </div>
          </dl>
          <Link href="/signup" aria-label="See Chinelo Okoye's profile">
            <CaretRight />
          </Link>
        </section>

        <section
          className="landing-container genre-section"
          id="categories"
          aria-labelledby="categories-title"
        >
          <div className="section-title">
            <h2 id="categories-title">Explore by Genre</h2>
            <Link href="/signup">
              Browse all <CaretRight />
            </Link>
          </div>
          <div className="genre-grid">
            {genres.map(([Icon, title]) => (
              <Link href="/signup" key={title}>
                <Icon />
                <span>{title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="landing-container official-creator"
          aria-labelledby="creator-title"
        >
          <div>
            <p className="official-eyebrow">For writers</p>
            <h2 id="creator-title">
              Your story deserves
              <br />
              to be read.
            </h2>
            <p>
              Publish. Grow your audience.
              <br />
              Earn from your work.
            </p>
            <div>
              <Link className="button button-primary" href={writingHref}>
                {user ? 'Open your dashboard' : 'Become a Creator'}
              </Link>
              <span>It’s free to get started</span>
            </div>
          </div>
          <div className="creator-asset">
            <Image
              src="/readems/writer-cta-quill-book.png"
              alt="A purple quill and ink beside an open book"
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </div>
        </section>
      </main>
      <nav className="landing-bottom-nav" aria-label="Mobile navigation">
        <Link className="is-active" href="/" aria-current="page">
          <House aria-hidden="true" />
          <span>Home</span>
        </Link>
        <Link href={readingHref}>
          <Books aria-hidden="true" />
          <span>Library</span>
        </Link>
        <Link className="landing-create-link" href={writingHref}>
          <PenNib aria-hidden="true" />
          <span className="sr-only">Start writing</span>
        </Link>
        <Link href="/#community-title">
          <UsersThree aria-hidden="true" />
          <span>Community</span>
        </Link>
        <Link href={dashboard ?? '/login'}>
          <UserCircle aria-hidden="true" />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
