import Link from 'next/link';
import {
  BookOpen,
  ChatCircle,
  Database,
  Handshake,
  Heart,
  ShieldWarning,
  UserPlus,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getPlatformOverview } from '@/lib/admin';
import { AdminSparkline } from '@/components/admin-sparkline';

export const metadata = {
  title: 'Overview | Readems Admin',
  description: 'What Readems actually holds right now.',
};

const number = new Intl.NumberFormat('en-GB');

const targetLabels: Record<string, string> = {
  STORY: 'Stories',
  CHAPTER: 'Chapters',
  COMMENT: 'Comments',
  POST: 'Posts',
  POST_COMMENT: 'Post replies',
  REVIEW: 'Reviews',
  USER: 'People',
};

export default async function AdminOverviewPage() {
  const [user, overview] = await Promise.all([
    getCurrentUser(),
    getPlatformOverview(),
  ]);
  const firstName = user?.fullName.split(' ')[0] ?? 'there';

  return (
    <>
      <section className="admin-hero">
        <h1>Welcome back, {firstName}</h1>
        <p>Every figure below is counted from the database as you load it.</p>

        <div className="admin-health">
          <h2>System health</h2>
          <ul>
            <li>
              <Database />
              <b>Database</b>
              <span
                className={
                  overview.database.ok ? 'admin-ok' : 'admin-health-bad'
                }
              >
                {overview.database.ok
                  ? `Answered SELECT 1 in ${overview.database.ms} ms`
                  : 'Not answering'}
              </span>
            </li>
            {overview.notMeasured.map((item) => (
              <li key={item}>
                <WarningCircle />
                <b>{item}</b>
                <span className="admin-health-unknown">Not measured</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <main className="admin-main">
        <div className="admin-stats">
          <article className="admin-card admin-stat">
            <span className="admin-stat-icon">
              <UsersThree />
            </span>
            <h2>People</h2>
            <b>{number.format(overview.users)}</b>
            <small>
              {number.format(overview.newUsersTotal)} joined in 30 days
            </small>
            <AdminSparkline
              points={overview.newUsers}
              label="New people a day over the last thirty days"
              height={60}
            />
          </article>
          <article className="admin-card admin-stat">
            <span className="admin-stat-icon">
              <UserPlus />
            </span>
            <h2>Writers</h2>
            <b>{number.format(overview.creators)}</b>
            <small>People with at least one published story</small>
          </article>
          <article className="admin-card admin-stat">
            <span className="admin-stat-icon">
              <BookOpen />
            </span>
            <h2>Published stories</h2>
            <b>{number.format(overview.stories)}</b>
            <small>{number.format(overview.chapters)} published chapters</small>
          </article>
          <article className="admin-card admin-stat">
            <span className="admin-stat-icon">
              <Handshake />
            </span>
            <h2>Platform revenue</h2>
            <b className="admin-unknown">Not measured</b>
            <small>
              Nothing on Readems takes money yet, so there is no figure to show.
            </small>
          </article>
        </div>

        <div className="admin-columns">
          <article className="admin-card">
            <div className="admin-card-head">
              <h2>
                <ShieldWarning /> Moderation queue
              </h2>
              <span className="admin-pill">{overview.reports.open} open</span>
            </div>
            {overview.reports.byTarget.length ? (
              <ul className="admin-rows">
                {overview.reports.byTarget.map((row) => (
                  <li key={row.targetType}>
                    <span>
                      {targetLabels[row.targetType] ?? row.targetType}
                    </span>
                    <b>{row.count}</b>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-empty">Nothing is waiting for review.</p>
            )}
            <Link className="admin-more" href="/admin/moderation">
              Review the queue
            </Link>
          </article>

          <article className="admin-card">
            <div className="admin-card-head">
              <h2>Open reports by priority</h2>
            </div>
            <ul className="admin-rows">
              <li>
                <span className="admin-dot admin-dot-high">High</span>
                <b>{overview.reports.high}</b>
              </li>
              <li>
                <span className="admin-dot admin-dot-medium">Medium</span>
                <b>{overview.reports.medium}</b>
              </li>
              <li>
                <span className="admin-dot admin-dot-low">Low</span>
                <b>{overview.reports.low}</b>
              </li>
            </ul>
            <Link className="admin-more" href="/admin/moderation?priority=HIGH">
              Open the high priority ones
            </Link>
          </article>
        </div>

        <article className="admin-card">
          <div className="admin-card-head">
            <h2>New people</h2>
            <span className="admin-pill">
              {number.format(overview.newUsersTotal)} in 30 days
            </span>
          </div>
          <AdminSparkline
            points={overview.newUsers}
            label="New people a day over the last thirty days"
            showAxis
          />
        </article>

        <article className="admin-card">
          <div className="admin-card-head">
            <h2>Platform activity</h2>
          </div>
          <ul className="admin-rows">
            <li>
              <span>
                <BookOpen /> Published stories
              </span>
              <b>{number.format(overview.stories)}</b>
            </li>
            <li>
              <span>
                <ChatCircle /> Chapter comments
              </span>
              <b>{number.format(overview.comments)}</b>
            </li>
            <li>
              <span>
                <ChatCircle /> Community posts
              </span>
              <b>{number.format(overview.posts)}</b>
            </li>
            <li>
              <span>
                <Heart /> Story likes
              </span>
              <b>{number.format(overview.likes)}</b>
            </li>
          </ul>
        </article>

        <nav className="admin-quick" aria-label="Quick actions">
          <Link href="/admin/users">
            <UsersThree />
            <span>Manage people</span>
          </Link>
          <Link href="/admin/moderation">
            <ShieldWarning />
            <span>Moderation</span>
          </Link>
          <Link href="/admin/deals">
            <Handshake />
            <span>Brand deals</span>
          </Link>
        </nav>
      </main>
    </>
  );
}
