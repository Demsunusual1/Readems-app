import { DashboardShell } from './dashboard-shell';

const stories = [
  ['The Boy Who Painted Silence', 'Ana Ndlovu', 75, 'cover-blue'],
  ['Beneath the Baobab Tree', 'Chineu Odafe', 42, 'cover-gold'],
  ['Letters to My Younger Self', 'Zanele M.', 60, 'cover-amber'],
] as const;
const recommendations = [
  ['The House on Freedom Street', 'Lesli Johnson', 'Drama'],
  ['When the Drum Speaks', 'Bessie K.', 'Historical Fiction'],
  ['Seeds of Tomorrow', 'Handé M.', 'Young Adult'],
] as const;

export function ReaderDashboard({
  user,
}: {
  user: { fullName: string; avatarUrl: string | null; interests: string[] };
}) {
  return (
    <DashboardShell
      kind="reader"
      name={user.fullName}
      avatarUrl={user.avatarUrl}
    >
      <section className="dash-welcome">
        <h1>
          Good morning, {user.fullName.split(' ')[0]}!{' '}
          <span aria-hidden="true">👋</span>
        </h1>
        <p>What story will you fall in love with today?</p>
      </section>
      <Section title="Continue Reading">
        <div className="reader-story-grid">
          {stories.map(([title, author, progress, cover]) => (
            <article className="reading-card" key={title}>
              <div
                className={`dash-cover ${cover}`}
                role="img"
                aria-label={`Cover for ${title}`}
              >
                <b>{progress}%</b>
              </div>
              <div>
                <h3>{title}</h3>
                <p>by {author}</p>
                <small>{progress}% complete</small>
                <progress value={progress} max="100">
                  {progress}%
                </progress>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Your Interests">
        <div className="chips">
          {(user.interests.length
            ? user.interests
            : [
                'Drama',
                'Personal Growth',
                'Contemporary',
                'Poetry',
                'African Literature',
              ]
          ).map((interest) => (
            <span key={interest}>{interest}</span>
          ))}
        </div>
      </Section>
      <Section title="Recommended For You">
        <div className="reader-story-grid recommendations">
          {recommendations.map(([title, author, genre], index) => (
            <article className="reading-card" key={title}>
              <div
                className={`dash-cover cover-${['teal', 'gold', 'amber'][index]}`}
                role="img"
                aria-label={`Cover for ${title}`}
              />
              <div>
                <h3>{title}</h3>
                <p>by {author}</p>
                <small>
                  {genre} · ◎ {(9.1 - index * 1.4).toFixed(1)}K reads
                </small>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <div className="reader-columns">
        <Section title="Followed Creators">
          <ul className="activity-list">
            <li>
              <span className="mini-avatar">A</span>
              <b>
                Ana Ndlovu<small>12.4K followers</small>
              </b>
              <button>Follow</button>
            </li>
            <li>
              <span className="mini-avatar">C</span>
              <b>
                Chineu Odafe<small>9.8K followers</small>
              </b>
              <button>Follow</button>
            </li>
          </ul>
        </Section>
        <Section title="Notifications" id="notifications">
          <ul className="activity-list">
            <li>
              <span className="mini-avatar">A</span>
              <span>
                <b>Ana Ndlovu</b> posted a new chapter<small>2m ago</small>
              </span>
            </li>
            <li>
              <span className="mini-avatar">Z</span>
              <span>
                <b>Zanele M.</b> liked your comment<small>1h ago</small>
              </span>
            </li>
          </ul>
        </Section>
      </div>
      <aside className="community-banner">
        <div>
          <h2>Join the conversation</h2>
          <p>Engage in discussions and connect with readers.</p>
        </div>
        <strong>+1.2K readers</strong>
      </aside>
    </DashboardShell>
  );
}
function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section className="dash-section" id={id}>
      <header>
        <h2>{title}</h2>
        <a href="#">View all</a>
      </header>
      {children}
    </section>
  );
}
