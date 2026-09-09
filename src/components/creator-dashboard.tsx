import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarBlank,
  ChatCircle,
  Eye,
  FileText,
  Heart,
  PlusCircle,
  Users,
} from '@phosphor-icons/react/dist/ssr';
import { DashboardShell } from './dashboard-shell';

export type CreatorStorySummary = {
  id: string;
  title: string;
  genre: string;
  coverUrl: string;
  chapters: number;
  reads: number;
  likes: number;
  comments: number;
};

export type CreatorDraft = {
  id: string;
  title: string;
  chapters: number;
};

export type CreatorScheduleEntry = {
  id: string;
  storyId: string;
  storyTitle: string;
  label: string;
  when: string;
};

export type CreatorDashboardProps = {
  user: { fullName: string; username: string; avatarUrl: string | null };
  unread: number;
  totals: {
    reads: number;
    readsChange: number;
    followers: number;
    followersGained: number;
    published: number;
    windowDays: number;
  };
  current: CreatorStorySummary | null;
  drafts: CreatorDraft[];
  schedule: CreatorScheduleEntry[];
  audience: {
    days: number;
    reads: number;
    likes: number;
    comments: number;
    newFollowers: number;
  };
  readsOverTime: { day: string; count: number }[];
};

const count = new Intl.NumberFormat('en-US');
const signed = (value: number) =>
  `${value > 0 ? '+' : ''}${count.format(value)}`;

export function CreatorDashboard({
  user,
  unread,
  totals,
  current,
  drafts,
  schedule,
  audience,
  readsOverTime,
}: CreatorDashboardProps) {
  return (
    <DashboardShell
      kind="creator"
      name={user.fullName}
      username={user.username}
      avatarUrl={user.avatarUrl}
      unread={unread}
    >
      <section className="creator-welcome">
        <span
          className="avatar large"
          style={
            user.avatarUrl
              ? { backgroundImage: `url(${user.avatarUrl})` }
              : undefined
          }
        >
          {!user.avatarUrl && user.fullName.charAt(0)}
        </span>
        <div>
          <h1>Welcome back, {user.fullName}</h1>
          <p>
            {totals.published}{' '}
            {totals.published === 1 ? 'story published' : 'stories published'}
          </p>
        </div>
        <Link className="create-story" href="/creator/stories/new">
          <PlusCircle aria-hidden="true" /> New Story
        </Link>
      </section>

      <section className="stat-grid" aria-label="Creator statistics">
        <Stat
          label={`Reads (last ${totals.windowDays} days)`}
          value={count.format(totals.reads)}
          note={`${signed(totals.readsChange)}% against the ${totals.windowDays} days before`}
        />
        <Stat
          label="Followers"
          value={count.format(totals.followers)}
          note={`${signed(totals.followersGained)} in ${totals.windowDays} days`}
        />
        <Stat
          label="Earnings"
          value="Not available"
          note="No payment provider is configured"
          placeholder
          id="earnings"
        />
        <Stat
          label="Stories"
          value={count.format(totals.published)}
          note="Published"
        />
      </section>

      <section className="creator-card" id="my-stories">
        <header>
          <h2>Current Story Performance</h2>
          <Link href="/creator/stories">View all</Link>
        </header>
        {current ? (
          <article className="story-row">
            <Image
              className="story-thumb"
              src={current.coverUrl}
              alt={`Cover for ${current.title}`}
              width={145}
              height={76}
            />
            <div>
              <h3>
                <Link href={`/creator/stories/${current.id}`}>
                  {current.title}
                </Link>
              </h3>
              <p>
                {current.genre} · {current.chapters}{' '}
                {current.chapters === 1 ? 'chapter' : 'chapters'}
              </p>
              <small className="story-metrics">
                <span>
                  <Eye aria-hidden="true" /> {count.format(current.reads)} reads
                </span>
                <span>
                  <Heart aria-hidden="true" /> {count.format(current.likes)}{' '}
                  likes
                </span>
                <span>
                  <ChatCircle aria-hidden="true" />{' '}
                  {count.format(current.comments)} comments
                </span>
              </small>
            </div>
            <b className="status published">PUBLISHED</b>
            <span aria-hidden="true">›</span>
          </article>
        ) : (
          <p className="dash-empty">
            You have not published a story yet.{' '}
            <Link href="/creator/stories/new">Start one</Link>.
          </p>
        )}
      </section>

      <div className="analytics-grid">
        <section className="creator-card">
          <header>
            <h2>Draft Queue</h2>
            <Link href="/creator/stories">View all</Link>
          </header>
          {drafts.length === 0 ? (
            <p className="dash-empty">Nothing in draft.</p>
          ) : (
            drafts.map((draft) => (
              <div className="chapter-row" key={draft.id}>
                <FileText aria-hidden="true" />
                <b>
                  <Link href={`/creator/stories/${draft.id}`}>
                    {draft.title}
                  </Link>
                  <small>
                    {draft.chapters}{' '}
                    {draft.chapters === 1 ? 'chapter' : 'chapters'} · Draft
                  </small>
                </b>
                <span aria-hidden="true">›</span>
              </div>
            ))
          )}
          <Link className="add-chapter" href="/creator/stories/new">
            <PlusCircle aria-hidden="true" /> New Draft
          </Link>
        </section>

        <section className="creator-card">
          <header>
            <h2>Chapter Schedule</h2>
            <Link href="/creator/stories">View all</Link>
          </header>
          {schedule.length === 0 ? (
            <p className="dash-empty">No chapter is scheduled.</p>
          ) : (
            schedule.map((entry) => (
              <div className="chapter-row" key={entry.id}>
                <CalendarBlank aria-hidden="true" />
                <b>
                  <Link href={`/creator/stories/${entry.storyId}`}>
                    {entry.label}
                  </Link>
                  <small>
                    {entry.storyTitle} · {entry.when}
                  </small>
                </b>
                <span aria-hidden="true">›</span>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="audience-activity" aria-label="Audience activity">
        <h2>Audience Activity</h2>
        <p className="audience-window">Last {audience.days} days</p>
        <dl>
          <div>
            <Eye aria-hidden="true" />
            <dt>{count.format(audience.reads)}</dt>
            <dd>Reads</dd>
          </div>
          <div>
            <Heart aria-hidden="true" />
            <dt>{count.format(audience.likes)}</dt>
            <dd>Likes</dd>
          </div>
          <div>
            <ChatCircle aria-hidden="true" />
            <dt>{count.format(audience.comments)}</dt>
            <dd>Comments</dd>
          </div>
          <div>
            <Users aria-hidden="true" />
            <dt>{count.format(audience.newFollowers)}</dt>
            <dd>New followers</dd>
          </div>
        </dl>
      </section>

      <div className="analytics-grid">
        <section className="creator-card">
          <header>
            <h2>Reads Over Time</h2>
            <Link href="/creator/analytics">View all</Link>
          </header>
          <ReadsChart points={readsOverTime} days={totals.windowDays} />
        </section>
        <section className="creator-card">
          <h2>Reads by Source</h2>
          <p className="dash-empty">
            Readems does not record where a read came from, so there is no
            source breakdown to show.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}

/**
 * The daily read counts, drawn as a polyline. With no reads at all there is no
 * shape to draw, so the panel says so instead of showing a flat invented line.
 */
function ReadsChart({
  points,
  days,
}: {
  points: { day: string; count: number }[];
  days: number;
}) {
  const total = points.reduce((sum, point) => sum + point.count, 0);
  if (total === 0)
    return (
      <p className="dash-empty">No reads recorded in the last {days} days.</p>
    );

  const peak = Math.max(...points.map((point) => point.count));
  const step = points.length > 1 ? 400 / (points.length - 1) : 0;
  const line = points
    .map((point, index) => `${index * step},${100 - (point.count / peak) * 90}`)
    .join(' ');

  return (
    <div
      className="line-chart"
      role="img"
      aria-label={`Reads per day over the last ${days} days, peaking at ${peak} in one day, ${total} in total.`}
    >
      <span>{peak}</span>
      <svg viewBox="0 0 400 110" aria-hidden="true" preserveAspectRatio="none">
        <polyline points={line} />
      </svg>
      <small>
        {points[0]?.day} — {points[points.length - 1]?.day}
      </small>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  placeholder = false,
  id,
}: {
  label: string;
  value: string;
  note: string;
  placeholder?: boolean;
  id?: string;
}) {
  return (
    <article className={`stat ${placeholder ? 'placeholder' : ''}`} id={id}>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
