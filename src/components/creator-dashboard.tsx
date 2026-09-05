import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  Books,
  CalendarBlank,
  CaretDown,
  CaretRight,
  ChartBar,
  ChatCircle,
  CurrencyDollar,
  Eye,
  FileText,
  Heart,
  List,
  Plus,
  ShareNetwork,
  Sparkle,
  Users,
} from '@phosphor-icons/react/dist/ssr';
import { ReademsLogo } from './readems-logo';
import './creator-dashboard.css';

const schedule = [
  ['Chapter 12: Crossroads', 'May 14, 2024 · 9:00 AM'],
  ['Chapter 13: The Confession', 'May 21, 2024 · 9:00 AM'],
  ['Chapter 14: No Turning Back', 'May 28, 2024 · 9:00 AM'],
] as const;

export function CreatorDashboard({
  user,
}: {
  user: { fullName: string; avatarUrl: string | null };
}) {
  const name = user.fullName || 'Tunde Adeyemi';
  const avatar = user.avatarUrl || '/readems/community-daniel.png';
  return (
    <main className="creator-official-shell">
      <section className="creator-official-hero">
        <header className="creator-official-header">
          <ReademsLogo />
          <div>
            <Link href="#notifications" aria-label="Notifications">
              <Bell />
              <i />
            </Link>
            <Image src={avatar} alt="" width={54} height={54} unoptimized />
          </div>
        </header>
        <div className="creator-official-welcome">
          <div className="creator-profile-photo">
            <Image src={avatar} alt="" fill sizes="112px" unoptimized />
            <b aria-label="Verified creator">✓</b>
          </div>
          <div className="creator-welcome-copy">
            <p>Welcome back,</p>
            <h1>{name}</h1>
            <span>✹ &nbsp;Verified Creator</span>
          </div>
          <Link className="creator-new-story" href="#draft-queue">
            <Plus /> New Story
          </Link>
        </div>
      </section>
      <div className="creator-official-content">
        <section className="momentum-card">
          <Sparkle />
          <div>
            <h2>Creative Momentum</h2>
            <p>Keep building. You’re in your flow.</p>
          </div>
          <div className="momentum-score">
            <strong>
              82<small>/100</small>
            </strong>
            <span>Strong</span>
          </div>
          <CaretRight />
        </section>
        <section className="creator-metrics" aria-label="Creator statistics">
          <Metric
            icon={<Eye />}
            label="Total Reads"
            value="245.8K"
            trend="↑ 3.9%"
          />
          <Metric
            icon={<Users />}
            label="Followers"
            value="18.6K"
            trend="↑ 8.3%"
          />
          <Metric
            icon={<CurrencyDollar />}
            label="Earnings"
            value="$4,236.50"
            trend="↑ 15.7%"
            gold
          />
          <Metric
            icon={<FileText />}
            label="Stories"
            value="14"
            trend="Published"
          />
        </section>
        <section className="creator-panel performance-panel">
          <Heading title="Current Story Performance" />
          <div className="performance-story">
            <Image
              src="/readems/cover-last-train-to-makoko.png"
              alt="The Last Train to Makoko"
              width={148}
              height={170}
            />
            <div className="performance-main">
              <h3>The Last Train to Makoko</h3>
              <p>Thriller &nbsp;·&nbsp; 12 Chapters</p>
              <span>PUBLISHED</span>
              <div className="performance-stats">
                <StoryStat icon={<Eye />} value="96.4K" label="Reads" />
                <StoryStat icon={<Heart />} value="2.8K" label="Likes" />
                <StoryStat icon={<ChatCircle />} value="512" label="Comments" />
                <StoryStat
                  icon={<ShareNetwork />}
                  value="1.2K"
                  label="Shares"
                />
              </div>
            </div>
            <CaretRight className="performance-caret" />
          </div>
        </section>
        <div className="creator-two-column">
          <section className="creator-panel queue-panel" id="draft-queue">
            <Heading title="Draft Queue" />
            <Queue title="Echoes in the Market" chapters="6 Chapters" />
            <Queue title="Fragments of Us" chapters="10 Chapters" />
            <Link className="creator-panel-action" href="#new-draft">
              <Plus /> New Draft
            </Link>
          </section>
          <section className="creator-panel schedule-panel">
            <Heading title="Chapter Schedule" />
            {schedule.map(([title, date]) => (
              <div className="schedule-row" key={title}>
                <span>
                  <CalendarBlank />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{date}</p>
                </div>
              </div>
            ))}
            <Link className="creator-panel-action" href="#schedule">
              <Plus /> Schedule Chapter
            </Link>
          </section>
        </div>
        <section className="audience-strip">
          <header>
            <h2>Audience Activity</h2>
            <span>
              Last 7 days <CaretDown />
            </span>
          </header>
          <div>
            <StoryStat icon={<Eye />} value="24.7K" label="Reads" />
            <StoryStat icon={<Heart />} value="1.4K" label="Likes" />
            <StoryStat icon={<ChatCircle />} value="320" label="Comments" />
            <StoryStat icon={<Users />} value="612" label="New Followers" />
          </div>
        </section>
        <section className="creator-panel analytics-snapshot">
          <header>
            <h2>Analytics Snapshot</h2>
            <span>
              Last 30 days <CaretDown />
            </span>
          </header>
          <div className="analytics-content">
            <div className="creator-line-chart">
              <h3>Reads Over Time</h3>
              <svg
                viewBox="0 0 360 145"
                role="img"
                aria-label="Reads rising over the last 30 days"
              >
                <path d="M10 122 L55 91 L94 103 L132 61 L170 80 L207 36 L246 79 L282 33 L330 55" />
              </svg>
              <div>
                <span>Apr 16</span>
                <span>Apr 23</span>
                <span>Apr 30</span>
                <span>May 7</span>
                <span>May 14</span>
              </div>
            </div>
            <div className="creator-source-chart">
              <h3>Reads by Source</h3>
              <div>
                <i aria-label="Home Feed 45%, Direct 25%, Search 20%, Other 10%" />
                <ul>
                  <li>
                    <span>Home Feed</span>
                    <b>45%</b>
                  </li>
                  <li>
                    <span>Direct</span>
                    <b>25%</b>
                  </li>
                  <li>
                    <span>Search</span>
                    <b>20%</b>
                  </li>
                  <li>
                    <span>Other</span>
                    <b>10%</b>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
      <nav className="creator-bottom-nav" aria-label="Creator navigation">
        <Link className="active" href="/creator/dashboard">
          <span>
            <ChartBar weight="fill" />
          </span>
          Dashboard
        </Link>
        <Link href="#stories">
          <span>
            <Books />
          </span>
          Stories
        </Link>
        <Link href="#analytics">
          <span>
            <ChartBar />
          </span>
          Analytics
        </Link>
        <Link href="#earnings">
          <span>
            <CurrencyDollar />
          </span>
          Earnings
        </Link>
        <Link href="#more">
          <span>
            <List />
          </span>
          More
        </Link>
      </nav>
    </main>
  );
}
function Heading({ title }: { title: string }) {
  return (
    <header className="creator-panel-heading">
      <h2>{title}</h2>
      <Link href="#view-all">View all</Link>
    </header>
  );
}
function Metric({
  icon,
  label,
  value,
  trend,
  gold = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  gold?: boolean;
}) {
  return (
    <article className={`creator-metric ${gold ? 'gold' : ''}`}>
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{trend}</small>
    </article>
  );
}
function StoryStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="creator-story-stat">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}
function Queue({ title, chapters }: { title: string; chapters: string }) {
  return (
    <div className="queue-row">
      <span>
        <FileText />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{chapters}</p>
        <small>DRAFT</small>
      </div>
      <CaretRight />
    </div>
  );
}
