import Link from 'next/link';
import { cookies } from 'next/headers';
import { LandingHeader } from '@/components/landing-header';

const stories = [
  {
    title: 'The Boy Who Painted Silence',
    genre: 'Contemporary',
    readers: '125K',
    cover: 'cover-blue',
  },
  {
    title: 'Beneath the Baobab Tree',
    genre: 'Drama',
    readers: '98K',
    cover: 'cover-gold',
  },
  {
    title: 'The Last Train to Makoko',
    genre: 'Thriller',
    readers: '87K',
    cover: 'cover-teal',
  },
  {
    title: 'Letters to My Younger Self',
    genre: 'Personal Growth',
    readers: '112K',
    cover: 'cover-amber',
  },
] as const;

const benefits = [
  {
    icon: 'book',
    title: 'Discover Stories',
    copy: 'Find books made for your interests.',
  },
  {
    icon: 'pen',
    title: 'Share Your Voice',
    copy: 'Publish chapter by chapter.',
  },
  {
    icon: 'people',
    title: 'Grow Together',
    copy: 'Connect with readers and creators.',
  },
] as const;

const genres = [
  ['mask', 'African Folktales'],
  ['heart', 'Romance'],
  ['castle', 'Fantasy'],
  ['search', 'Mystery'],
  ['planet', 'Sci-Fi'],
  ['mountain', 'Motivational'],
] as const;

export default async function HomePage() {
  const hasSession = (await cookies()).has('readems_session');
  const user = hasSession
    ? await import('@/lib/auth').then(({ getCurrentUser }) => getCurrentUser())
    : null;
  const dashboard = user
    ? `/${user.role === 'CREATOR' ? 'creator' : 'reader'}/dashboard`
    : undefined;
  return (
    <>
      <LandingHeader dashboardHref={dashboard} />
      <main>
        <section className="hero section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Welcome to Readems</p>
            <h1 id="hero-title">Where Every Story Finds Its People</h1>
            <p className="hero-lede">
              Discover stories you’ll love, share the worlds inside you, and
              connect with readers and writers everywhere.
            </p>
            <div className="hero-actions">
              <Link
                className="button button-primary"
                href={dashboard ?? '/signup'}
              >
                {user ? 'Go to dashboard' : 'Start Reading'}
              </Link>
              <Link
                className="button button-secondary"
                href={dashboard ?? '/signup'}
              >
                Start Writing
              </Link>
            </div>
          </div>
          <div
            className="hero-visual"
            role="img"
            aria-label="A joyful community discovering and sharing stories together"
          >
            <span className="spark spark-one">✦</span>
            <span className="spark spark-two">✧</span>
            <div className="people-art">
              <span>●</span>
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
            <div className="hero-book book-left">
              <b>
                WHISPERS OF
                <br />
                THE LAGOON
              </b>
              <i>☾</i>
            </div>
            <div className="hero-book book-right">
              <b>
                SHADOWS OF
                <br />
                THE DRUM
              </b>
              <i>♪</i>
            </div>
          </div>
        </section>

        <section className="stories-band" aria-labelledby="stories-title">
          <div className="section">
            <div className="section-heading">
              <h2 id="stories-title">Stories Everyone Is Reading</h2>
              <a href="#genres">
                View all <span aria-hidden="true">›</span>
              </a>
            </div>
            <div className="story-grid">
              {stories.map((story) => (
                <article className="story-card" key={story.title}>
                  <div className={`story-cover ${story.cover}`}>
                    <span>{story.title}</span>
                    <i aria-hidden="true">✦</i>
                  </div>
                  <div className="story-info">
                    <h3>{story.title}</h3>
                    <div>
                      <span className="tag">{story.genre}</span>
                      <span aria-label={`${story.readers} readers`}>
                        ◉ {story.readers}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section benefits" aria-labelledby="benefits-title">
          <h2 id="benefits-title">Read. Write. Belong.</h2>
          <div className="benefit-grid">
            {benefits.map((item) => (
              <article key={item.title}>
                <span className={`line-icon ${item.icon}`} aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="section genres"
          id="genres"
          aria-labelledby="genres-title"
        >
          <h2 id="genres-title">Find Your Next Obsession</h2>
          <div className="genre-grid">
            {genres.map(([icon, title]) => (
              <a href="/signup" className="genre-card" key={title}>
                <span className={`genre-icon ${icon}`} aria-hidden="true" />
                <b>{title}</b>
              </a>
            ))}
          </div>
        </section>

        <section
          className="section community"
          aria-labelledby="community-title"
        >
          <div className="avatar-cluster" aria-hidden="true">
            <span>W</span>
            <span>R</span>
            <span>C</span>
          </div>
          <blockquote>
            <p className="pill">Creator community</p>
            <h2 id="community-title">
              “ Readems helped me find readers who truly connect with my
              stories.
            </h2>
            <footer>
              Join our growing community of readers and storytellers.
            </footer>
          </blockquote>
        </section>

        <section
          className="section creator-cta"
          aria-labelledby="creator-title"
        >
          <div className="creator-art" aria-hidden="true">
            ✦<span>✎</span>
          </div>
          <div>
            <h2 id="creator-title">Your Story Deserves to Be Read.</h2>
            <p>
              Publish chapter by chapter, grow your audience, and earn from your
              work.
            </p>
            <Link
              className="button button-primary"
              href={dashboard ?? '/signup'}
            >
              {user ? 'Open your dashboard' : 'Create Your First Story'}
            </Link>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="section footer-inner">
          <a className="logo footer-logo" href="#top">
            <span aria-hidden="true">▱</span>Readems
          </a>
          <nav aria-label="Footer navigation">
            {[
              'About',
              'Community',
              'For Brands',
              'Safety',
              'Contact',
              'Terms',
            ].map((x) => (
              <a href="#" key={x}>
                {x}
              </a>
            ))}
          </nav>
          <small>© 2026 Readems. All rights reserved.</small>
        </div>
      </footer>
    </>
  );
}
