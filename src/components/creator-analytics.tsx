import Image from 'next/image';
import Link from 'next/link';
import {
  Bank,
  Bell,
  BookOpen,
  Books,
  CalendarBlank,
  CaretDown,
  ChartBar,
  CurrencyDollar,
  Export,
  GlobeHemisphereWest,
  Heart,
  List,
  Percent,
  Users,
} from '@phosphor-icons/react/dist/ssr';
import { ReademsLogo } from './readems-logo';
import './creator-analytics.css';

const metrics = [
  ['Reads', '245.8K', '↑ 12.4%', BookOpen],
  ['Followers', '18.6K', '↑ 8.7%', Users],
  ['Engagement', '32.1K', '↑ 15.2%', Heart],
  ['Revenue', '$4,236.50', '↑ 17.8%', CurrencyDollar],
] as const;
const stories = [
  [
    'The Last Train to Makoko',
    'Thriller · 12 Chapters',
    '96.4K',
    '/readems/cover-last-train-to-makoko.png',
  ],
  [
    'Whispers of the Lagoon',
    'Romance · 8 Chapters',
    '78.2K',
    '/readems/cover-shadows-of-the-drum.png',
  ],
  [
    'Echoes in the Market',
    'Drama · 6 Chapters',
    '45.1K',
    '/readems/featured-beneath-the-baobab-tree.png',
  ],
  [
    'Fragments of Us',
    'Contemporary · 10 Chapters',
    '32.7K',
    '/readems/cover-letters-to-my-younger-self.png',
  ],
] as const;

export function CreatorAnalytics({ avatarUrl }: { avatarUrl: string | null }) {
  const avatar = avatarUrl || '/readems/community-daniel.png';
  return (
    <main className="creator-analytics-page">
      <section className="analytics-hero">
        <header>
          <ReademsLogo tone="light" />
          <div>
            <Bell />
            <Image src={avatar} alt="" width={50} height={50} unoptimized />
          </div>
        </header>
        <div>
          <p>Creator Analytics</p>
          <h1>
            Your stories.
            <br />
            Their connection.
          </h1>
          <span>
            Track your impact, grow your audience,
            <br />
            and earn from your words.
          </span>
        </div>
      </section>
      <div className="analytics-page-body">
        <div className="analytics-toolbar">
          <button>
            <CalendarBlank /> May 7 – Jun 5, 2025 <CaretDown />
          </button>
          <button>
            <Export /> Export
          </button>
        </div>
        <section className="analytics-metrics">
          {metrics.map(([label, value, trend, Icon]) => (
            <article key={label}>
              <span>
                <Icon />
              </span>
              <p>{label}</p>
              <strong>{value}</strong>
              <small>{trend}</small>
              <em>vs Apr 7 – May 6</em>
            </article>
          ))}
        </section>
        <section className="analytics-card reads-chart">
          <header>
            <h2>Reads Over Time</h2>
            <button>
              Daily <CaretDown />
            </button>
          </header>
          <div className="chart-area">
            <span className="chart-tooltip">
              May 21, 2025
              <br />
              <b>22,540 reads</b>
            </span>
            <svg viewBox="0 0 720 190" role="img" aria-label="Reads over time">
              <path d="M10 165 L55 150 L95 139 L135 137 L175 106 L215 91 L255 112 L300 126 L345 119 L390 94 L435 70 L480 83 L525 72 L570 120 L610 126 L650 96 L690 54 L718 42" />
            </svg>
            <div>
              <span>May 7</span>
              <span>May 14</span>
              <span>May 21</span>
              <span>May 28</span>
              <span>Jun 5</span>
            </div>
          </div>
        </section>
        <div className="analytics-grid">
          <section className="analytics-card top-stories">
            <Heading title="Top Stories" />
            {stories.map(([title, meta, reads, image]) => (
              <article key={title}>
                <Image src={image} alt="" width={86} height={62} />
                <div>
                  <h3>{title}</h3>
                  <p>{meta}</p>
                </div>
                <strong>
                  {reads}
                  <small>reads</small>
                </strong>
              </article>
            ))}
          </section>
          <section className="analytics-card audience-card">
            <Heading title="Audience" />
            <GlobeHemisphereWest className="audience-globe" />
            <ul>
              <li>
                🇳🇬 <span>Nigeria</span>
                <b>35.8%</b>
              </li>
              <li>
                🇺🇸 <span>United States</span>
                <b>21.4%</b>
              </li>
              <li>
                🇬🇧 <span>United Kingdom</span>
                <b>9.7%</b>
              </li>
              <li>
                🇮🇳 <span>India</span>
                <b>8.3%</b>
              </li>
              <li>
                ● <span>Others</span>
                <b>24.8%</b>
              </li>
            </ul>
          </section>
          <section className="analytics-card source-card">
            <h2>Reads Source</h2>
            <div>
              <i />
              <ul>
                <li>
                  Home Feed <b>45%</b>
                </li>
                <li>
                  Direct <b>25%</b>
                </li>
                <li>
                  Search <b>20%</b>
                </li>
                <li>
                  Other <b>10%</b>
                </li>
              </ul>
            </div>
          </section>
          <section className="earnings-card">
            <header>
              <h2>Earnings Summary</h2>
              <button>
                This Month <CaretDown />
              </button>
            </header>
            <p>Total Earnings</p>
            <strong>$4,236.50</strong>
            <small>
              ↑ 17.8% <span>vs Apr 7 – May 6</span>
            </small>
            <hr />
            <div>
              <span>
                Next Payout
                <br />
                <b>Jun 15, 2025</b>
              </span>
              <b>Est. $2,450.00</b>
            </div>
          </section>
        </div>
        <section className="analytics-card transactions">
          <Heading title="Recent Transactions" />
          <Transaction
            icon={<CurrencyDollar />}
            title="Story Earnings"
            date="May 1 – May 31, 2025"
            amount="+$4,236.50"
          />
          <Transaction
            icon={<Percent />}
            title="Platform Fee"
            date="May 2025"
            amount="−$423.65"
          />
          <Transaction
            icon={<Bank />}
            title="Payout to First Bank ···· 1234"
            date="May 15, 2025"
            amount="+$2,812.85"
          />
        </section>
      </div>
      <nav className="creator-bottom-nav">
        <Link href="/creator/dashboard">
          <span>
            <ChartBar />
          </span>
          Dashboard
        </Link>
        <Link href="#stories">
          <span>
            <Books />
          </span>
          My Stories
        </Link>
        <Link className="active" href="/creator/analytics">
          <span>
            <ChartBar weight="fill" />
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
    <header className="analytics-heading">
      <h2>{title}</h2>
      <Link href="#view-all">View all</Link>
    </header>
  );
}
function Transaction({
  icon,
  title,
  date,
  amount,
}: {
  icon: React.ReactNode;
  title: string;
  date: string;
  amount: string;
}) {
  return (
    <article>
      <span>{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{date}</p>
      </div>
      <strong>
        {amount}
        <small>
          {date.includes('May 15') ? 'May 15, 2025' : 'May 31, 2025'}
        </small>
      </strong>
    </article>
  );
}
