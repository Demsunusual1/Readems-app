import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ChartLineUp,
  Eye,
  Heart,
  House,
  PlusCircle,
  UserCircle,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getCreatorAnalytics, percentChange } from '@/lib/analytics';
import { Logo } from '@/components/ui/logo';
import '@/components/creator.css';

export const metadata: Metadata = {
  title: 'Creator analytics | Readems',
  description: 'Track your impact and grow your audience.',
};

const shortDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const { days } = await searchParams;
  const range = [7, 30, 90].includes(Number(days)) ? Number(days) : 30;
  const data = await getCreatorAnalytics(user.id, range);

  const peak = Math.max(1, ...data.readsOverTime.map((day) => day.count));
  const points = data.readsOverTime
    .map((day, index) => {
      const x = (index / Math.max(1, data.readsOverTime.length - 1)) * 400;
      const y = 110 - (day.count / peak) * 100;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const change = percentChange(data.reads, data.readsBefore);

  return (
    <div className="creator-page">
      <header className="creator-hero">
        <Logo tone="light" />
        <div className="creator-hero-copy">
          <div>
            <p className="creator-eyebrow">Creator analytics</p>
            <h1>Your stories. Their connection.</h1>
            <p>
              {shortDate.format(data.from)} – {shortDate.format(data.to)}
            </p>
          </div>
          <nav className="creator-ranges" aria-label="Date range">
            {[7, 30, 90].map((option) => (
              <Link
                key={option}
                href={`/creator/analytics?days=${option}`}
                className={range === option ? 'is-active' : undefined}
                aria-current={range === option ? 'page' : undefined}
              >
                {option} days
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="creator-main">
        <section className="analytics-cards">
          <article>
            <Eye aria-hidden="true" />
            <p>Reads</p>
            <strong>{data.reads}</strong>
            <small>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs the previous{' '}
              {range} days
            </small>
          </article>
          <article>
            <UsersThree aria-hidden="true" />
            <p>Followers</p>
            <strong>{data.followers}</strong>
            <small>
              {data.followersGained} new in {range} days
            </small>
          </article>
          <article>
            <Heart aria-hidden="true" />
            <p>Engagement</p>
            <strong>{data.engagement}</strong>
            <small>likes, comments and reviews</small>
          </article>
          <article>
            <ChartLineUp aria-hidden="true" />
            <p>Finished</p>
            <strong>{data.finished}</strong>
            <small>readers who reached the end</small>
          </article>
        </section>

        <section className="analytics-chart">
          <h2>Reads over time</h2>
          <svg
            viewBox="0 0 400 120"
            role="img"
            aria-label={`Reads per day over the last ${range} days, peaking at ${peak}`}
          >
            <polyline points={points} />
          </svg>
          <div className="analytics-axis">
            <span>{shortDate.format(data.from)}</span>
            <span>{shortDate.format(data.to)}</span>
          </div>
        </section>

        <section className="analytics-top">
          <h2>Top stories</h2>
          {data.topStories.length === 0 ? (
            <p className="creator-empty">
              Nothing published yet, so there is nothing to measure.
            </p>
          ) : (
            <ul>
              {data.topStories.map((story) => (
                <li key={story.id}>
                  <Link href={`/creator/stories/${story.id}`}>
                    <Image src={story.coverUrl} alt="" width={56} height={78} />
                    <span>
                      <strong>{story.title}</strong>
                      <small>
                        {story.genre} <i>•</i> {story.chapters}{' '}
                        {story.chapters === 1 ? 'chapter' : 'chapters'}
                      </small>
                    </span>
                    <b>{story.reads}</b>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="analytics-earnings">
          <h2>Earnings</h2>
          <p>
            Readems has no payment provider configured, so there is nothing to
            pay out and no balance to show. When payouts are switched on, this
            is where they will be reported.
          </p>
        </section>

        <section className="analytics-note">
          <h2>What is not measured</h2>
          <p>
            Readems does not track where a reader came from or where they are,
            so there is no traffic-source breakdown and no map here. The numbers
            above are counted from what readers did: opening a story, liking it,
            reviewing it, and reaching the end.
          </p>
        </section>
      </main>

      <nav className="creator-bottom-nav" aria-label="Creator navigation">
        <Link href="/creator/dashboard">
          <House />
          <span>Dashboard</span>
        </Link>
        <Link href="/creator/stories">
          <PlusCircle />
          <span>My Stories</span>
        </Link>
        <Link href="/creator/analytics" aria-current="page">
          <ChartLineUp weight="fill" />
          <span>Analytics</span>
        </Link>
        <Link href="/creator/dashboard">
          <UserCircle />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
