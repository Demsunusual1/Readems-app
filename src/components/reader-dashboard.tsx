import Image from 'next/image';
import Link from 'next/link';
import {
  ChatCircle,
  Eye,
  Fire,
  HandWaving,
  PenNib,
  Users,
} from '@phosphor-icons/react/dist/ssr';
import { DashboardShell } from './dashboard-shell';

export type DashboardStory = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  percent: number;
  href: string;
};

export type DashboardRecommendation = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  genre: string;
  readers: number;
};

export type DashboardTrending = {
  id: string;
  title: string;
  coverUrl: string;
  chapterCount: number;
  readers: number;
};

export type DashboardUpdate = {
  key: string;
  creatorName: string;
  creatorUsername: string;
  storyTitle: string;
  storyHref: string;
  chapterNumber: number;
  when: string;
};

export type ReaderDashboardProps = {
  user: {
    fullName: string;
    username: string;
    avatarUrl: string | null;
    interests: string[];
  };
  unread: number;
  streakDays: number;
  continueReading: DashboardStory[];
  recommendations: DashboardRecommendation[];
  trending: DashboardTrending[];
  updates: DashboardUpdate[];
  pulse: {
    activeReaders: number;
    storiesShared: number;
    commentsToday: number;
  };
};

const count = new Intl.NumberFormat('en-US');

export function ReaderDashboard({
  user,
  unread,
  streakDays,
  continueReading,
  recommendations,
  trending,
  updates,
  pulse,
}: ReaderDashboardProps) {
  const interestLine = user.interests.slice(0, 2).join(' & ');
  return (
    <DashboardShell
      kind="reader"
      name={user.fullName}
      username={user.username}
      avatarUrl={user.avatarUrl}
      unread={unread}
    >
      <section className="dash-welcome">
        <h1>
          Welcome back, {user.fullName.split(' ')[0]}.{' '}
          <HandWaving weight="fill" aria-hidden="true" />
        </h1>
        <p>Stories shape us. Today is your next chapter.</p>
        {streakDays > 0 ? (
          <p className="dash-streak">
            <Fire weight="fill" aria-hidden="true" />
            <strong>
              {streakDays} {streakDays === 1 ? 'day' : 'days'}
            </strong>{' '}
            reading streak
          </p>
        ) : (
          <p className="dash-streak is-empty">
            <Fire aria-hidden="true" /> No reading streak yet. Read today to
            start one.
          </p>
        )}
      </section>

      <Section title="Continue Reading" viewAll="/library">
        {continueReading.length === 0 ? (
          <Empty>
            Nothing on the go yet.{' '}
            <Link href="/discover">Find a story to start</Link>.
          </Empty>
        ) : (
          <div className="reader-story-grid">
            {continueReading.map((story) => (
              <article className="reading-card" key={story.id}>
                <Cover
                  src={story.coverUrl}
                  title={story.title}
                  badge={`${story.percent}%`}
                />
                <div>
                  <h3>
                    <Link href={story.href}>{story.title}</Link>
                  </h3>
                  <p>by {story.author}</p>
                  <small>{story.percent}% complete</small>
                  <progress value={story.percent} max={100}>
                    {story.percent}%
                  </progress>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      {user.interests.length > 0 && (
        <Section title="Your Interests" viewAll="/discover">
          <div className="chips">
            {user.interests.map((interest) => (
              <Link
                key={interest}
                href={`/search?q=${encodeURIComponent(interest)}`}
              >
                {interest}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section
        title={
          interestLine
            ? `Because you read ${interestLine}`
            : 'Recommended for you'
        }
        viewAll="/discover"
      >
        {recommendations.length === 0 ? (
          <Empty>
            {user.interests.length === 0
              ? 'Choose a few interests in settings and recommendations will appear here.'
              : 'Nothing new to recommend in your interests yet.'}{' '}
            <Link href="/discover">Browse everything</Link>.
          </Empty>
        ) : (
          <div className="reader-story-grid recommendations">
            {recommendations.map((story) => (
              <article className="reading-card" key={story.id}>
                <Cover src={story.coverUrl} title={story.title} />
                <div>
                  <h3>
                    <Link href={`/stories/${story.id}`}>{story.title}</Link>
                  </h3>
                  <p>by {story.author}</p>
                  <small>
                    {story.genre} · <Eye aria-hidden="true" />{' '}
                    {count.format(story.readers)}{' '}
                    {story.readers === 1 ? 'reader' : 'readers'}
                  </small>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section title="Trending Serials" viewAll="/discover">
        {trending.length === 0 ? (
          <Empty>
            No story has been picked up by enough readers in the last 30 days to
            call it trending.
          </Empty>
        ) : (
          <ul className="trending-list">
            {trending.map((story) => (
              <li key={story.id}>
                <Image
                  src={story.coverUrl}
                  alt=""
                  width={64}
                  height={86}
                  className="trending-cover"
                />
                <span>
                  <Link href={`/stories/${story.id}`}>{story.title}</Link>
                  <small>
                    {story.chapterCount}{' '}
                    {story.chapterCount === 1 ? 'chapter' : 'chapters'}
                  </small>
                  <small>
                    <Eye aria-hidden="true" /> {count.format(story.readers)} new{' '}
                    {story.readers === 1 ? 'reader' : 'readers'}
                  </small>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="From creators you follow" viewAll="/notifications">
        {updates.length === 0 ? (
          <Empty>
            You are not following anyone yet.{' '}
            <Link href="/discover">Find writers to follow</Link>.
          </Empty>
        ) : (
          <ul className="activity-list">
            {updates.map((update) => (
              <li key={update.key}>
                <span className="mini-avatar" aria-hidden="true">
                  {update.creatorName.charAt(0)}
                </span>
                <span>
                  <b>
                    <Link href={`/u/${update.creatorUsername}`}>
                      {update.creatorName}
                    </Link>
                  </b>{' '}
                  published chapter {update.chapterNumber} of{' '}
                  <Link href={update.storyHref}>{update.storyTitle}</Link>
                  <small>{update.when}</small>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <aside className="community-banner">
        <div>
          <h2>Your words matter.</h2>
          <p>
            Join conversations, share your voice, and connect with readers
            worldwide.
          </p>
          <Link className="community-banner-link" href="/community">
            Explore Community
          </Link>
        </div>
        <dl className="pulse-stats">
          <div>
            <Users weight="fill" aria-hidden="true" />
            <dt>{count.format(pulse.activeReaders)}</dt>
            <dd>Readers active this month</dd>
          </div>
          <div>
            <PenNib weight="fill" aria-hidden="true" />
            <dt>{count.format(pulse.storiesShared)}</dt>
            <dd>Stories published</dd>
          </div>
          <div>
            <ChatCircle weight="fill" aria-hidden="true" />
            <dt>{count.format(pulse.commentsToday)}</dt>
            <dd>Comments today</dd>
          </div>
        </dl>
      </aside>
    </DashboardShell>
  );
}

function Cover({
  src,
  title,
  badge,
}: {
  src: string;
  title: string;
  badge?: string;
}) {
  return (
    <div className="dash-cover has-art">
      <Image src={src} alt={`Cover for ${title}`} fill sizes="220px" />
      {badge && <b>{badge}</b>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="dash-empty">{children}</p>;
}

function Section({
  title,
  viewAll,
  children,
  id,
}: {
  title: string;
  viewAll: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section className="dash-section" id={id}>
      <header>
        <h2>{title}</h2>
        <Link href={viewAll}>View all</Link>
      </header>
      {children}
    </section>
  );
}
