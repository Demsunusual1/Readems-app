import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  BookOpen,
  BookOpenText,
  Buildings,
  CaretRight,
  CastleTurret,
  Eye,
  Feather,
  Heart,
  MagnifyingGlass,
  MaskHappy,
  MoonStars,
  Mountains,
  PenNib,
  Planet,
  Sparkle,
  Train,
  Tree,
  UserCircle,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { LandingHeader } from '@/components/landing-header';
import { Logo } from '@/components/ui/logo';

const stories = [
  ['Beneath the Baobab Tree', 'Historical fiction', '98K', Tree, 'baobab'],
  ['The Archivist of Salt', 'Mystery', '87K', MoonStars, 'archivist'],
  ['Shadows of the Drum', 'Drama', '125K', Train, 'drum'],
  ['Letters to My Younger Self', 'Personal growth', '112K', Feather, 'letters'],
] as const;

const benefits = [
  [BookOpen, 'Discover Stories', 'Find unforgettable reads made for you.'],
  [PenNib, 'Share Your Voice', 'Publish your story, one chapter at a time.'],
  [UsersThree, 'Grow Together', 'Meet readers and creators who get it.'],
] as const;

const categories = [
  [MaskHappy, 'African Stories'],
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
    <div className="landing-page">
      <LandingHeader dashboardHref={dashboard} />
      <main>
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="landing-shell landing-hero-inner">
            <div className="landing-hero-copy">
              <p className="landing-kicker">Welcome to Readems</p>
              <h1 id="hero-title">
                Stories that stay <span>with you</span>
              </h1>
              <div className="gold-rule" aria-hidden="true" />
              <p>
                Read unforgettable stories, share your voice, and connect with
                readers and writers around the world.
              </p>
              <div className="landing-actions">
                <Link className="button button-primary" href={readingHref}>
                  {user ? 'Go to dashboard' : 'Start Reading'}
                </Link>
                <Link className="button landing-outline" href={writingHref}>
                  <PenNib aria-hidden="true" /> Start Writing
                </Link>
              </div>
            </div>
            <div
              className="landing-hero-art"
              role="img"
              aria-label="An open book revealing a sunset city and a thoughtful reader"
            >
              <Sparkle className="hero-star hero-star-one" weight="fill" />
              <Sparkle className="hero-star hero-star-two" weight="fill" />
              <div className="hero-sun" />
              <Buildings className="hero-city" weight="fill" />
              <UserCircle className="hero-reader" weight="fill" />
              <BookOpenText className="hero-open-book" weight="fill" />
            </div>
          </div>
        </section>

        <section className="landing-stories" aria-labelledby="stories-title">
          <div className="landing-shell">
            <div className="landing-heading-row">
              <h2 id="stories-title">Stories Everyone Is Reading</h2>
              <a href="#categories">
                View all <CaretRight aria-hidden="true" />
              </a>
            </div>
            <div className="landing-story-row" aria-label="Popular stories">
              {stories.map(([title, genre, readers, CoverIcon, cover]) => (
                <article className="landing-story-card" key={title}>
                  <div
                    className={`landing-story-cover cover-${cover}`}
                    role="img"
                    aria-label={`Cover artwork for ${title}`}
                  >
                    <span>{title}</span>
                    <CoverIcon weight="duotone" aria-hidden="true" />
                  </div>
                  <div className="landing-story-info">
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
          className="landing-shell landing-benefits"
          aria-labelledby="benefits-title"
        >
          <p className="landing-kicker">A place for every story</p>
          <h2 id="benefits-title">Read. Write. Belong.</h2>
          <div className="landing-benefit-grid">
            {benefits.map(([Icon, title, copy]) => (
              <article key={title}>
                <span>
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="landing-categories"
          id="categories"
          aria-labelledby="categories-title"
        >
          <div className="landing-shell">
            <p className="landing-kicker">Explore your way</p>
            <h2 id="categories-title">Find Your Next Obsession</h2>
            <div className="landing-category-grid">
              {categories.map(([Icon, title]) => (
                <Link
                  href="/signup"
                  className="landing-category-card"
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
          className="landing-shell landing-community"
          aria-labelledby="community-title"
        >
          <div
            className="landing-creator-portrait"
            role="img"
            aria-label="Chinelo Okoye, a creator in the Readems community"
          >
            <UserCircle weight="fill" aria-hidden="true" />
          </div>
          <blockquote>
            <p className="landing-kicker">Creator community</p>
            <h2 id="community-title">
              “Readems helped me find readers who truly connect with my
              stories.”
            </h2>
            <footer>
              <strong>Chinelo Okoye</strong>
              <span>Author of Whispers of the Lagoon</span>
            </footer>
          </blockquote>
        </section>

        <section
          className="landing-shell landing-creator"
          aria-labelledby="creator-title"
        >
          <div>
            <p className="landing-kicker">For writers</p>
            <h2 id="creator-title">Your story deserves to be read.</h2>
            <p>Publish. Grow your audience. Earn from your work.</p>
            <Link className="button button-primary" href={writingHref}>
              {user ? 'Open your dashboard' : 'Become a Creator'}
            </Link>
          </div>
          <div
            className="landing-creator-art"
            role="img"
            aria-label="A blue quill, ink pot, and handwritten story on an open book"
          >
            <BookOpenText
              className="creator-book"
              weight="fill"
              aria-hidden="true"
            />
            <Feather
              className="creator-feather"
              weight="fill"
              aria-hidden="true"
            />
            <Sparkle
              className="creator-spark"
              weight="fill"
              aria-hidden="true"
            />
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-shell">
          <Logo className="landing-footer-logo" />
          <nav aria-label="Footer navigation">
            <a href="#stories-title">Stories</a>
            <a href="#categories">Categories</a>
            <a href="#community-title">Community</a>
            <Link href="/login">Log in</Link>
          </nav>
          <small>© 2026 Readems. Stories live here.</small>
        </div>
      </footer>
    </div>
  );
}
