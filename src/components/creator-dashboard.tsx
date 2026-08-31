import Link from 'next/link';
import { DashboardShell } from './dashboard-shell';

const creatorStories = [
  [
    'The Last Train to Makoko',
    'Thriller · 12 Chapters',
    '96.4K reads',
    'PUBLISHED',
  ],
  [
    'Whispers of the Lagoon',
    'Romance · 8 Chapters',
    '78.2K reads',
    'PUBLISHED',
  ],
  ['Echoes in the Market', 'Drama · 6 Chapters', '45.1K reads', 'DRAFT'],
  ['Fragments of Us', 'Contemporary · 10 Chapters', '32.7K reads', 'DRAFT'],
] as const;
export function CreatorDashboard({
  user,
}: {
  user: { fullName: string; avatarUrl: string | null };
}) {
  return (
    <DashboardShell
      kind="creator"
      name={user.fullName}
      avatarUrl={user.avatarUrl}
    >
      <section className="creator-welcome">
        <span className="avatar large">{user.fullName.charAt(0)}</span>
        <div>
          <h1>
            Welcome back, {user.fullName}{' '}
            <span title="Verified creator" aria-label="Verified creator">
              ●
            </span>
          </h1>
          <p>✹ Verified Creator</p>
        </div>
        <Link className="create-story" href="#my-stories">
          ⊕ Create New Story
        </Link>
      </section>
      <section className="stat-grid" aria-label="Creator statistics">
        <Stat label="Total Reads" value="245,780" trend="↑ 3.9%" />
        <Stat label="Followers" value="18,642" trend="↑ 8.3%" />
        <Stat
          label="Earnings"
          value="Not available"
          trend="Payments are not configured"
          placeholder
        />
        <Stat label="Stories" value="14" trend="Published" />
      </section>
      <section className="creator-card" id="my-stories">
        <header>
          <h2>My Stories</h2>
          <a href="#">View all</a>
        </header>
        {creatorStories.map(([title, meta, reads, status], index) => (
          <article className="story-row" key={title}>
            <div
              className={`story-thumb cover-${['teal', 'blue', 'gold', 'amber'][index]}`}
              role="img"
              aria-label={`Cover for ${title}`}
            />
            <div>
              <h3>{title}</h3>
              <p>{meta}</p>
              <small>{reads}</small>
            </div>
            <b className={`status ${status.toLowerCase()}`}>{status}</b>
            <span>›</span>
          </article>
        ))}
      </section>
      <section className="creator-card">
        <header>
          <div>
            <h2>Chapter Management</h2>
            <p>The Last Train to Makoko</p>
          </div>
          <a href="#">View Story</a>
        </header>
        {[
          'Chapter 12: Crossroads',
          'Chapter 11: The Confession',
          'Chapter 10: No Turning Back',
        ].map((chapter, index) => (
          <div className="chapter-row" key={chapter}>
            <span>⠿</span>
            <b>
              {chapter}
              <small>Published　·　May {12 - index * 7}, 2024</small>
            </b>
            <span>›</span>
          </div>
        ))}
        <button className="add-chapter">＋ Add New Chapter</button>
      </section>
      <div className="analytics-grid">
        <section className="creator-card">
          <h2>Analytics Overview</h2>
          <div
            className="line-chart"
            role="img"
            aria-label="Placeholder graph of reads over the last 30 days"
          >
            <span>30K</span>
            <svg viewBox="0 0 400 110" aria-hidden="true">
              <polyline points="0,95 55,55 100,78 150,15 210,70 260,5 320,55 365,14 400,35" />
            </svg>
            <small>Apr 15　　　　 Apr 29　　　　 May 13</small>
          </div>
        </section>
        <section className="creator-card">
          <h2>Reads by Source</h2>
          <div className="source-chart">
            <div
              role="img"
              aria-label="Home Feed 45%, Direct 25%, Search 20%, Other 10%"
            />
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
      </div>
    </DashboardShell>
  );
}
function Stat({
  label,
  value,
  trend,
  placeholder = false,
}: {
  label: string;
  value: string;
  trend: string;
  placeholder?: boolean;
}) {
  return (
    <article className={`stat ${placeholder ? 'placeholder' : ''}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{trend}</small>
    </article>
  );
}
