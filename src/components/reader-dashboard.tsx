import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  BookOpen,
  ChatCircle,
  Eye,
  House,
  MagnifyingGlass,
  Plus,
  User,
  Users,
} from '@phosphor-icons/react/dist/ssr';
import { ReademsLogo } from './readems-logo';
import './reader-dashboard.css';

const recommendations = [
  [
    'Letters to My Younger Self',
    'Zanele M.',
    'Contemporary',
    '/readems/cover-letters-to-my-younger-self.png',
  ],
  [
    'The Last Train to Makoko',
    'Tobi A.',
    'Historical Fiction',
    '/readems/cover-last-train-to-makoko.png',
  ],
  [
    'The Girl Who Dreamed in Code',
    'Ada N.',
    'Young Adult',
    '/readems/featured-archivist-of-salt.png',
  ],
] as const;
const serials = [
  [
    'Whispers of the Lagoon',
    'Chapter 12',
    '18.6K',
    '/readems/cover-shadows-of-the-drum.png',
  ],
  [
    'Shadows of the Drum',
    'Chapter 8',
    '12.3K',
    '/readems/featured-beneath-the-baobab-tree.png',
  ],
  [
    'City of a Thousand Lights',
    'Chapter 5',
    '9.1K',
    '/readems/featured-when-stars-learn-to-bloom.png',
  ],
] as const;

export function ReaderDashboard({
  user,
}: {
  user: { fullName: string; avatarUrl: string | null; interests: string[] };
}) {
  const firstName = user.fullName.split(' ')[0] || 'Kemi';
  const avatar = user.avatarUrl || '/readems/community-zara.png';
  return (
    <main className="official-reader-dashboard">
      <header className="reader-header">
        <ReademsLogo />
        <div>
          <Link href="/discover" aria-label="Search">
            <MagnifyingGlass />
          </Link>
          <Link href="#notifications" aria-label="Notifications">
            <Bell />
            <i />
          </Link>
          <Image src={avatar} alt="" width={48} height={48} unoptimized />
        </div>
      </header>
      <section className="reader-welcome">
        <div>
          <p>GOOD MORNING</p>
          <h1 aria-label={`Good morning, ${firstName}!`}>
            Welcome back,
            <br />
            {firstName}.
          </h1>
          <span>Stories shape us. Today is your next chapter.</span>
        </div>
        <div className="reading-streak">
          <div>
            <p>READING STREAK</p>
            <strong>
              14 <small>days</small>
            </strong>
            <b>You’re on fire!</b>
          </div>
          <span>🔥</span>
        </div>
      </section>
      <div className="reader-body">
        <section className="continue-reader">
          <SectionHeading title="Continue Reading" />
          <div className="continue-reader-grid">
            <Image
              src="/readems/story-baobab-cover.png"
              alt=""
              width={205}
              height={230}
            />
            <div>
              <h2>Beneath the Baobab Tree</h2>
              <p>by Chineu Odafe</p>
              <span>
                In the shadow of the ancient tree, secrets of the past are
                unearthed and destinies begin to shift.
              </span>
              <div>
                <b>
                  42% <small>complete</small>
                </b>
                <progress value="42" max="100" />
              </div>
            </div>
            <Link href="/stories/baobab/chapters/1">Continue</Link>
          </div>
        </section>
        <section className="reader-section">
          <SectionHeading title="Because you read Contemporary & Drama" />
          <div className="recommendation-grid">
            {recommendations.map(([title, author, genre, image]) => (
              <article key={title}>
                <div>
                  <Image src={image} alt="" fill sizes="30vw" />
                  <b>♥</b>
                </div>
                <h3>{title}</h3>
                <p>by {author}</p>
                <footer>
                  <span>{genre}</span>
                  <button aria-label={`More options for ${title}`}>⋮</button>
                </footer>
              </article>
            ))}
          </div>
        </section>
        <section className="reader-section">
          <SectionHeading title="Trending Serials" />
          <div className="serial-grid">
            {serials.map(([title, chapter, reads, image]) => (
              <article key={title}>
                <Image src={image} alt="" width={92} height={105} />
                <div>
                  <h3>{title}</h3>
                  <p>{chapter}</p>
                  <span>
                    <Eye /> {reads}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="reader-section creators-follow" id="notifications">
          <SectionHeading title="From creators you follow" />
          <p>
            <Image
              src="/readems/community-zara.png"
              alt=""
              width={34}
              height={34}
            />
            <span>
              <b>Chineu Odafe</b> published a new chapter of{' '}
              <strong>Beneath the Baobab Tree</strong>
            </span>
            <small>2h ago</small>
          </p>
          <p>
            <Image
              src="/readems/community-daniel.png"
              alt=""
              width={34}
              height={34}
            />
            <span>
              <b>Tobi Adewale</b> updated{' '}
              <strong>The Last Train to Makoko</strong>
            </span>
            <small>5h ago</small>
          </p>
          <p>
            <Image
              src="/readems/community-zara.png"
              alt=""
              width={34}
              height={34}
            />
            <span>
              <b>Zanele M.</b> shared a behind-the-scenes note
            </span>
            <small>1d ago</small>
          </p>
        </section>
        <section className="community-pulse">
          <div>
            <p>COMMUNITY PULSE</p>
            <h2>Your words matter.</h2>
            <span>
              Join conversations, share your voice,
              <br />
              and connect with readers worldwide.
            </span>
            <Link href="#community">Explore Community ›</Link>
          </div>
          <div>
            <b>
              <Users />
              12.4K <small>Active Readers</small>
            </b>
            <b>
              ✎ 3.8K <small>Stories Shared</small>
            </b>
            <b>
              <ChatCircle />
              7.2K <small>Comments Today</small>
            </b>
          </div>
        </section>
      </div>
      <nav className="reader-bottom-nav">
        <Link className="active" href="/reader/dashboard">
          <House />
          Home
        </Link>
        <Link href="#library">
          <BookOpen />
          Library
        </Link>
        <Link className="create" href="#create">
          <span>
            <Plus />
          </span>
          Create
        </Link>
        <Link href="#community">
          <Users />
          Community
        </Link>
        <Link href="#profile">
          <User />
          Profile
        </Link>
      </nav>
    </main>
  );
}
function SectionHeading({ title }: { title: string }) {
  return (
    <header className="reader-section-heading">
      <h2>{title}</h2>
      <Link href="#view-all">View all ›</Link>
    </header>
  );
}
