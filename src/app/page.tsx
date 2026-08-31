import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  BookOpen,
  CaretRight,
  CastleTurret,
  Eye,
  Heart,
  MagnifyingGlass,
  MaskHappy,
  Mountains,
  PenNib,
  Planet,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { LandingHeader } from '@/components/landing-header';
import { Logo } from '@/components/ui/logo';

const stories = [
  ['The Boy Who Painted Silence', 'Contemporary', '125K'],
  ['Beneath the Baobab Tree', 'Drama', '98K'],
  ['The Last Train to Makoko', 'Thriller', '87K'],
  ['Letters to My Younger Self', 'Personal Growth', '112K'],
] as const;

const benefits = [
  [BookOpen, 'Discover Stories', 'Find books made for your interests.'],
  [PenNib, 'Share Your Voice', 'Publish chapter by chapter.'],
  [UsersThree, 'Grow Together', 'Connect with readers and creators.'],
] as const;

const genres = [
  [MaskHappy, 'African Folktales'],
  [Heart, 'Romance'],
  [CastleTurret, 'Fantasy'],
  [MagnifyingGlass, 'Mystery'],
  [Planet, 'Sci-Fi'],
  [Mountains, 'Motivational'],
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
      <LandingHeader dashboardHref={dashboard} />
      <main>
        <section
          className="official-hero landing-container"
          aria-labelledby="hero-title"
        >
          <div className="official-hero-copy">
            <p className="official-eyebrow">Welcome to Readems</p>
            <h1 id="hero-title">Where Every Story Finds Its People</h1>
            <p>
              Discover stories you’ll love, share the worlds inside you, and
              connect with readers and writers everywhere.
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
          <div
            className="asset-placeholder hero-asset-placeholder"
            role="img"
            aria-label="Official Readems hero illustration unavailable"
          >
            <BookOpen aria-hidden="true" />
            <span>Official hero illustration</span>
          </div>
        </section>

        <section className="official-stories" aria-labelledby="stories-title">
          <div className="landing-container">
            <div className="official-section-heading">
              <h2 id="stories-title">Stories Everyone Is Reading</h2>
              <a href="#categories">
                View all <CaretRight aria-hidden="true" />
              </a>
            </div>
            <div className="official-story-row" aria-label="Popular stories">
              {stories.map(([title, genre, readers]) => (
                <article className="official-story-card" key={title}>
                  <div
                    className="asset-placeholder story-cover-placeholder"
                    role="img"
                    aria-label={`Cover for ${title} unavailable`}
                  >
                    <BookOpen aria-hidden="true" />
                    <span>Cover unavailable</span>
                  </div>
                  <div className="official-story-info">
                    <h3>{title}</h3>
                    <p>
                      <span>{genre}</span>
                      <small>
                        <Eye aria-hidden="true" /> {readers}
                      </small>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="landing-container official-benefits"
          aria-labelledby="benefits-title"
        >
          <h2 id="benefits-title">Read. Write. Belong.</h2>
          <div className="official-benefit-grid">
            {benefits.map(([Icon, title, copy]) => (
              <article key={title}>
                <Icon aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="official-categories"
          id="categories"
          aria-labelledby="categories-title"
        >
          <div className="landing-container">
            <h2 id="categories-title">Find Your Next Obsession</h2>
            <div className="official-category-grid">
              {genres.map(([Icon, title]) => (
                <Link
                  href="/signup"
                  className="official-category-card"
                  key={title}
                >
                  <Icon aria-hidden="true" />
                  <span>{title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          className="landing-container official-community"
          aria-labelledby="community-title"
        >
          <div
            className="asset-placeholder community-asset-placeholder"
            role="img"
            aria-label="Readems creator community portrait unavailable"
          >
            <UsersThree aria-hidden="true" />
            <span>Creator portrait</span>
          </div>
          <blockquote>
            <p className="official-eyebrow">Creator community</p>
            <h2 id="community-title">
              “Readems helped me find readers who truly connect with my
              stories.”
            </h2>
            <footer>
              Join our growing community of readers and storytellers.
            </footer>
          </blockquote>
        </section>

        <section
          className="landing-container official-creator"
          aria-labelledby="creator-title"
        >
          <div>
            <p className="official-eyebrow">For writers</p>
            <h2 id="creator-title">Your Story Deserves to Be Read.</h2>
            <p>
              Publish chapter by chapter, grow your audience, and earn from your
              work.
            </p>
            <Link className="button button-primary" href={writingHref}>
              {user ? 'Open your dashboard' : 'Create Your First Story'}
            </Link>
          </div>
          <div
            className="asset-placeholder creator-asset-placeholder"
            role="img"
            aria-label="Readems creator call-to-action illustration unavailable"
          >
            <PenNib aria-hidden="true" />
            <span>Creator illustration</span>
          </div>
        </section>
      </main>

      <footer className="official-footer">
        <div className="landing-container official-footer-inner">
          <Logo className="official-footer-logo" />
          <nav aria-label="Footer navigation">
            <a href="#top">About</a>
            <a href="#community-title">Community</a>
            <a href="#creator-title">For Creators</a>
            <Link href="/login">Log In</Link>
          </nav>
          <small>© 2026 Readems. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
}
