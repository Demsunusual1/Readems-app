import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  BookOpen,
  BookOpenText,
  CaretRight,
  Heart,
  House,
  MagnifyingGlass,
  MaskHappy,
  Feather,
  Planet,
  SealCheck,
  Sparkle,
  UsersThree,
  User,
  Users,
  BookBookmark,
  Star,
} from '@phosphor-icons/react/dist/ssr';
import { LandingHeader } from '@/components/landing-header';
import { LandingHero } from '@/components/landing-hero';
import { getCurrentUser } from '@/lib/auth';
import { getFeed } from '@/lib/community';
import { countReadersByStory, getSpotlightCreator } from '@/lib/dashboards';
import { getReadingGoal, getShelf } from '@/lib/library';
import { countUnread } from '@/lib/notifications';
import { listStories } from '@/lib/stories';
import { relativeTime } from '@/lib/time';

const genres = [
  [MaskHappy, 'African Folktales'],
  [Heart, 'Romance'],
  [Sparkle, 'Fantasy'],
  [MagnifyingGlass, 'Mystery'],
  [Planet, 'Sci-Fi'],
  [BookOpen, 'Non-Fiction'],
] as const;

const count = new Intl.NumberFormat('en-US');

const postSummary = (kind: string) => {
  if (kind === 'SHORT_STORY') return 'shared a short story';
  if (kind === 'POEM') return 'shared a poem';
  if (kind === 'QUESTION') return 'asked the community a question';
  return 'posted a thought';
};

export default async function HomePage() {
  const hasSession = (await cookies()).has('readems_session');
  const user = hasSession ? await getCurrentUser() : null;
  const dashboard = user
    ? `/${user.role === 'CREATOR' ? 'creator' : 'reader'}/dashboard`
    : undefined;

  const [unread, shelf, goal, featured, activity, spotlight] =
    await Promise.all([
      user ? countUnread(user.id) : 0,
      user ? getShelf(user.id) : null,
      user ? getReadingGoal(user.id) : null,
      listStories({ featured: true, limit: 6 }),
      getFeed({ viewerId: user?.id ?? null, take: 3 }),
      getSpotlightCreator(),
    ]);
  const readers = await countReadersByStory(featured.map((story) => story.id));

  const readingHref = dashboard ?? '/signup';
  const writingHref = dashboard ?? '/signup?role=creator';
  const current = shelf?.current.slice(0, 3) ?? [];

  return (
    <div className="official-landing">
      <div className="landing-hero-shell">
        <LandingHeader dashboardHref={dashboard} unread={unread} />
        <LandingHero
          readingHref={readingHref}
          writingHref={writingHref}
          signedIn={Boolean(user)}
        />
        <svg
          className="hero-wave"
          viewBox="0 0 1440 92"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 82C105 15 260 48 540 65C930 98 1250 78 1440 0V92H0Z" />
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
                {user
                  ? `Welcome back, ${user.fullName.split(' ')[0]}`
                  : 'Start reading'}{' '}
                <Sparkle aria-hidden="true" />
              </h2>
              <p>
                {user
                  ? 'Pick up where you left off'
                  : 'Sign in and your place in every story is kept for you'}
              </p>
            </div>
            {goal && (
              <Link className="reading-goal" href="/library">
                <span>Reading goal</span>
                <strong>
                  {goal.finished} / {goal.target} books
                </strong>
                <b>{goal.percent}%</b>
              </Link>
            )}
          </div>
          <div
            className="continue-row"
            tabIndex={0}
            role="region"
            aria-label="Continue reading"
          >
            {current.map((entry) => (
              <article key={entry.story.id} className="continue-card">
                <Image
                  src={entry.story.coverUrl}
                  alt=""
                  width={78}
                  height={104}
                />
                <div>
                  <h3>
                    <Link
                      href={`/stories/${entry.story.id}/chapters/${entry.chapter}`}
                    >
                      {entry.story.title}
                    </Link>
                  </h3>
                  <p>
                    Chapter {entry.chapter} · {entry.percent}% read
                  </p>
                  <span>
                    <i style={{ width: `${entry.percent}%` }} />
                  </span>
                </div>
              </article>
            ))}
            {user && current.length === 0 && (
              <p className="continue-empty">
                You have not started a story yet. The next one you open shows up
                here.
              </p>
            )}
            <Link
              href={user ? '/discover' : '/signup'}
              className="discover-card"
            >
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

        {featured.length > 0 && (
          <section
            className="landing-container featured-section"
            aria-labelledby="stories-title"
          >
            <div className="section-title">
              <h2 id="stories-title">Featured Stories</h2>
              <Link href="/discover">
                View all <CaretRight />
              </Link>
            </div>
            <div
              className="featured-row"
              tabIndex={0}
              role="region"
              aria-label="Featured stories"
            >
              {featured.map((story) => {
                const people = readers.get(story.id) ?? 0;
                return (
                  <article className="featured-card" key={story.id}>
                    <Image
                      src={story.coverUrl}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 80vw, 370px"
                    />
                    <div>
                      <h3>
                        <Link href={`/stories/${story.id}`}>{story.title}</Link>
                      </h3>
                      <p>{story.synopsis}</p>
                      <footer>
                        <small>{story.genre}</small>
                        <span>
                          <UsersThree /> {count.format(people)}{' '}
                          {people === 1 ? 'reader' : 'readers'}
                        </span>
                      </footer>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section
          className="landing-container community-live"
          aria-labelledby="community-title"
        >
          <div className="section-title">
            <h2 id="community-title">Live in the Community</h2>
            <Link href="/community">
              See all activity <CaretRight />
            </Link>
          </div>
          {activity.length === 0 ? (
            <p className="dash-empty">
              Nothing has been posted yet.{' '}
              <Link href="/community">Start the conversation</Link>.
            </p>
          ) : (
            <div
              className="activity-row"
              tabIndex={0}
              role="region"
              aria-label="Community activity"
            >
              {activity.map((post) => (
                <article key={post.id}>
                  {post.author.avatarUrl ? (
                    <Image
                      src={post.author.avatarUrl}
                      alt=""
                      width={58}
                      height={58}
                    />
                  ) : (
                    <span className="activity-initial" aria-hidden="true">
                      {post.author.name.charAt(0)}
                    </span>
                  )}
                  <p>
                    <strong>
                      <Link href={`/u/${post.author.username}`}>
                        {post.author.name}
                      </Link>
                    </strong>{' '}
                    {postSummary(post.kind)}
                    <small>{relativeTime(post.createdAt)}</small>
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {spotlight && (
          <section
            className="landing-container creator-spotlight"
            aria-labelledby="spotlight-title"
          >
            <div className="spotlight-copy">
              <p>Creator Spotlight</p>
              <h2 id="spotlight-title">
                {spotlight.name} <SealCheck />
              </h2>
              {spotlight.bestKnownFor && (
                <strong>Author of {spotlight.bestKnownFor}</strong>
              )}
              {spotlight.bio && <span>{spotlight.bio}</span>}
            </div>
            {spotlight.avatarUrl ? (
              <div className="spotlight-image">
                <Image
                  src={spotlight.avatarUrl}
                  alt={`${spotlight.name}, creator spotlight`}
                  fill
                  sizes="320px"
                />
              </div>
            ) : (
              <div className="spotlight-image spotlight-initial">
                <span aria-hidden="true">{spotlight.name.charAt(0)}</span>
              </div>
            )}
            <dl>
              <div>
                <Users aria-hidden="true" />
                <dt>{count.format(spotlight.followers)}</dt>
                <dd>Followers</dd>
              </div>
              <div>
                <BookBookmark aria-hidden="true" />
                <dt>{count.format(spotlight.publishedWorks)}</dt>
                <dd>Published works</dd>
              </div>
              <div>
                <Star aria-hidden="true" />
                <dt>{spotlight.rating === null ? '—' : spotlight.rating}</dt>
                <dd>
                  {spotlight.rating === null
                    ? 'No ratings yet'
                    : 'Reader rating'}
                </dd>
              </div>
            </dl>
            <Link
              href={`/u/${spotlight.username}`}
              aria-label={`See ${spotlight.name}'s profile`}
            >
              <CaretRight />
            </Link>
          </section>
        )}

        <section
          className="landing-container genre-section"
          id="categories"
          aria-labelledby="categories-title"
        >
          <div className="section-title">
            <h2 id="categories-title">Explore by Genre</h2>
            <Link href="/discover">
              Browse all <CaretRight />
            </Link>
          </div>
          <div className="genre-grid">
            {genres.map(([Icon, title]) => (
              <Link href={`/search?q=${encodeURIComponent(title)}`} key={title}>
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
            <p className="writer-description">
              <span>Publish. Grow your audience.</span>
              <span>Keep every reader you earn.</span>
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
        <Link href="/library">
          <BookOpenText aria-hidden="true" />
          <span>Library</span>
        </Link>
        <Link className="landing-create-link" href={writingHref}>
          <Feather aria-hidden="true" />
          <span className="sr-only">Start writing</span>
        </Link>
        <Link href="/community">
          <UsersThree aria-hidden="true" />
          <span>Community</span>
        </Link>
        <Link href={dashboard ?? '/login'}>
          <User aria-hidden="true" />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
