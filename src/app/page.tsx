import Link from 'next/link';
import { cookies } from 'next/headers';
import { LandingHeader } from '@/components/landing-header';
import { ReademsLogo } from '@/components/readems-logo';
import { RemoteLandingImage } from '@/components/remote-landing-image';

const stories = [
  [
    'The Boy Who Painted Silence',
    'Contemporary',
    '125K',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=85',
  ],
  [
    'Beneath the Baobab Tree',
    'Drama',
    '98K',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=85',
  ],
  [
    'The Last Train to Makoko',
    'Thriller',
    '87K',
    'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=600&q=85',
  ],
  [
    'Letters to My Younger Self',
    'Personal Growth',
    '112K',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=85',
  ],
] as const;
const benefits = [
  ['book', 'Discover Stories', 'Find books made for your interests.'],
  ['quill', 'Share Your Voice', 'Publish chapter by chapter.'],
  ['people', 'Grow Together', 'Connect with readers and creators.'],
] as const;
const genres = [
  ['mask', 'African Folktales'],
  ['heart', 'Romance'],
  ['castle', 'Fantasy'],
  ['search', 'Mystery'],
  ['planet', 'Sci-Fi'],
  ['mountain', 'Motivational'],
] as const;

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    book: (
      <>
        <path d="M4 7c6-2 10 0 12 3v20c-3-3-7-4-12-2V7Zm24 0c-6-2-10 0-12 3v20c3-3 7-4 12-2V7Z" />
        <path d="M1 11v21c6-2 11-1 15 2 4-3 9-4 15-2V11" />
      </>
    ),
    quill: (
      <>
        <path d="M27 3C15 4 7 12 6 25c7-1 15-5 21-22Z" />
        <path d="m7 25-4 6m8-12 8-6M9 28h17" />
      </>
    ),
    people: (
      <>
        <circle cx="16" cy="9" r="4" />
        <circle cx="6" cy="11" r="3" />
        <circle cx="26" cy="11" r="3" />
        <path d="M9 28v-6c0-4 3-7 7-7s7 3 7 7v6H9ZM1 27v-5c0-3 2-5 5-5m25 10v-5c0-3-2-5-5-5" />
      </>
    ),
    mask: (
      <>
        <path d="M8 3c8 2 13 8 12 16-1 7-5 11-8 11S5 26 4 19C3 11 5 6 8 3Z" />
        <path d="m7 9 3 3-3 3m10-5-3 3 3 3M8 21c3 2 5 2 8 0" />
      </>
    ),
    heart: <path d="M16 29 4 17C-3 9 8 1 16 10 24 1 35 9 28 17L16 29Z" />,
    castle: (
      <path d="M4 30V14h5V5l4 4 3-6 3 6 4-4v9h5v16M1 30h30M12 30v-7h8v7M4 14h24" />
    ),
    search: (
      <>
        <circle cx="14" cy="14" r="10" />
        <path d="m22 22 8 8" />
      </>
    ),
    planet: (
      <>
        <circle cx="16" cy="16" r="9" />
        <path d="M3 22c-2-3 4-9 13-13s16-4 17-1-4 9-13 13S4 25 3 22Z" />
      </>
    ),
    mountain: (
      <>
        <path d="M2 29 14 8l5 9 4-6 7 18H2Z" />
        <path d="M22 11V3h8l-2 3 2 3h-8" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 32 36" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default async function HomePage() {
  const hasSession = (await cookies()).has('readems_session');
  const user = hasSession
    ? await import('@/lib/auth').then(({ getCurrentUser }) => getCurrentUser())
    : null;
  const dashboard = user
    ? `/${user.role === 'CREATOR' ? 'creator' : 'reader'}/dashboard`
    : undefined;
  return (
    <div className="landing-page">
      <LandingHeader dashboardHref={dashboard} />
      <main>
        <section className="landing-shell hero" aria-labelledby="hero-title">
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
          <RemoteLandingImage
            className="hero-image"
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85"
            width={506}
            height={500}
            priority
            alt="Four friends smiling as they read stories together"
          />
        </section>

        <section className="stories-band" aria-labelledby="stories-title">
          <div className="landing-shell">
            <div className="section-heading">
              <h2 id="stories-title">Stories Everyone Is Reading</h2>
              <a href="#genres">
                View all <span>›</span>
              </a>
            </div>
            <div className="story-grid">
              {stories.map(([title, genre, readers, cover]) => (
                <article className="story-card" key={title}>
                  <RemoteLandingImage
                    src={cover}
                    width={180}
                    height={225}
                    alt={`Cover of ${title}`}
                  />
                  <div className="story-info">
                    <h3>{title}</h3>
                    <div>
                      <span className="tag">{genre}</span>
                      <span aria-label={`${readers} reads`} className="reads">
                        ◉ {readers}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="landing-shell benefits"
          aria-labelledby="benefits-title"
        >
          <h2 id="benefits-title">Read. Write. Belong.</h2>
          <div className="benefit-grid">
            {benefits.map(([icon, title, copy]) => (
              <article key={title}>
                <Icon name={icon} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="landing-shell genres"
          id="genres"
          aria-labelledby="genres-title"
        >
          <h2 id="genres-title">Find Your Next Obsession</h2>
          <div className="genre-grid">
            {genres.map(([icon, title]) => (
              <Link href="/signup" className="genre-card" key={title}>
                <Icon name={icon} />
                <b>{title}</b>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="landing-shell community"
          aria-labelledby="community-title"
        >
          <RemoteLandingImage
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=85"
            width={330}
            height={190}
            alt="A community of Readems creators"
          />
          <blockquote>
            <p className="pill">Creator community</p>
            <div>
              <span className="quote">“</span>
              <h2 id="community-title">
                Readems helped me find readers who truly connect with my
                stories.
              </h2>
            </div>
            <footer>
              Join our growing community of readers and storytellers.
            </footer>
          </blockquote>
        </section>

        <section
          className="landing-shell creator-cta"
          aria-labelledby="creator-title"
        >
          <RemoteLandingImage
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=85"
            width={360}
            height={190}
            alt="A creator writing her story on a laptop"
          />
          <div>
            <h2 id="creator-title">Your Story Deserves to Be Read</h2>
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
          <span className="cta-quill">✦</span>
        </section>
      </main>
      <footer className="site-footer">
        <div className="landing-shell footer-inner">
          <ReademsLogo />
          <nav aria-label="Footer navigation">
            {[
              'About',
              'Community',
              'For Brands',
              'Safety',
              'Contact',
              'Terms',
            ].map((item) => (
              <a href="#" key={item}>
                {item}
              </a>
            ))}
          </nav>
          <small>© 2026 Readems.</small>
        </div>
      </footer>
    </div>
  );
}
