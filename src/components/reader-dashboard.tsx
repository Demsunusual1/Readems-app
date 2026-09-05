import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  BookOpen,
  CaretRight,
  ChatCircle,
  Eye,
  Fire,
  House,
  MagnifyingGlass,
  NotePencil,
  Plus,
  User,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { Logo } from './ui/logo';
import './reader-dashboard.css';

const recommendations = [
  {
    title: 'Letters to My Younger Self',
    author: 'Zanele M.',
    genre: 'Contemporary',
    image: '/readems/dashboard-cover-letters.png',
  },
  {
    title: 'The Last Train to Makoko',
    author: 'Tobi A.',
    genre: 'Historical Fiction',
    image: '/readems/dashboard-cover-makoko.png',
  },
  {
    title: 'The Girl Who Dreamed in Code',
    author: 'Ada N.',
    genre: 'Young Adult',
    image: '/readems/dashboard-cover-code.png',
  },
] as const;

const serials = [
  {
    title: 'Whispers of the Lagoon',
    chapter: 'Chapter 12',
    reads: '18.6K',
    image: '/readems/dashboard-cover-whispers.png',
  },
  {
    title: 'Shadows of the Drum',
    chapter: 'Chapter 8',
    reads: '12.3K',
    image: '/readems/dashboard-cover-shadows.png',
  },
  {
    title: 'City of a Thousand Lights',
    chapter: 'Chapter 5',
    reads: '9.1K',
    image: '/readems/dashboard-cover-city.png',
  },
] as const;

const creatorUpdates = [
  {
    name: 'Chineu Odafe',
    update: 'published a new chapter of',
    story: 'Beneath the Baobab Tree',
    time: '2h ago',
    unread: true,
    image: '/readems/dashboard-avatar-chineu.png',
  },
  {
    name: 'Tobi Adewale',
    update: 'updated',
    story: 'The Last Train to Makoko',
    time: '5h ago',
    unread: true,
    image: '/readems/dashboard-avatar-tobi.png',
  },
  {
    name: 'Zanele M.',
    update: 'shared a behind-the-scenes note',
    story: '',
    time: '1d ago',
    unread: false,
    image: '/readems/dashboard-avatar-zanele.png',
  },
] as const;

export function ReaderDashboard({
  user,
}: {
  user: { fullName: string; avatarUrl: string | null; interests: string[] };
}) {
  const rawFirstName = user.fullName.trim().split(/\s+/)[0] || 'Kemi';
  const firstName =
    rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase();

  return (
    <div className="reader-dashboard-page">
      <header className="reader-dashboard-hero">
        <div className="reader-dashboard-topbar">
          <Logo tone="dark" />
          <nav aria-label="Dashboard utilities">
            <Link href="/discover" aria-label="Search stories">
              <MagnifyingGlass />
            </Link>
            <button type="button" aria-label="Notifications">
              <Bell />
              <span aria-hidden="true" />
            </button>
            <Image
              src={user.avatarUrl || '/readems/dashboard-avatar-kemi.png'}
              alt={`${firstName}'s profile`}
              width={74}
              height={74}
            />
          </nav>
        </div>

        <div className="reader-dashboard-welcome">
          <p>Good morning</p>
          <h1>
            Welcome back,
            <br />
            {firstName}.
          </h1>
          <span>Stories shape us. Today is your next chapter.</span>
        </div>

        <section className="reader-streak" aria-label="Reading streak">
          <div>
            <p>Reading streak</p>
            <strong>
              14 <span>days</span>
            </strong>
            <b>You’re on fire!</b>
          </div>
          <div className="reader-streak-ring" aria-hidden="true">
            <Fire weight="fill" />
          </div>
        </section>
      </header>

      <main className="reader-dashboard-main">
        <section className="continue-reading" aria-labelledby="continue-title">
          <SectionHeading id="continue-title" title="Continue Reading" />
          <div className="continue-reading-content">
            <Link href="/stories/baobab" className="continue-cover">
              <Image
                src="/readems/story-baobab-cover.png"
                alt="Cover of Beneath the Baobab Tree"
                fill
                priority
                sizes="(max-width: 700px) 25vw, 280px"
              />
            </Link>
            <div className="continue-copy">
              <h2>Beneath the Baobab Tree</h2>
              <p>by Chineu Odafe</p>
              <span>
                In the shadow of the ancient tree, secrets of the past are
                unearthed and destinies begin to shift.
              </span>
              <div className="continue-progress-copy">
                <b>42%</b> complete
              </div>
              <div className="continue-progress" aria-label="42% complete">
                <span />
              </div>
            </div>
            <Link href="/stories/baobab" className="continue-button">
              Continue
            </Link>
          </div>
        </section>

        <section
          className="dashboard-section recommendations"
          aria-labelledby="recommendations-title"
        >
          <SectionHeading
            id="recommendations-title"
            title="Because you read Contemporary & Drama"
          />
          <div className="recommendation-grid">
            {recommendations.map((story) => (
              <article className="recommendation-card" key={story.title}>
                <Link href="/discover" className="recommendation-cover">
                  <Image
                    src={story.image}
                    alt={`Cover of ${story.title}`}
                    fill
                    sizes="(max-width: 700px) 30vw, 360px"
                  />
                </Link>
                <div>
                  <h3>{story.title}</h3>
                  <p>by {story.author}</p>
                  <div className="recommendation-meta">
                    <span>{story.genre}</span>
                    <button
                      type="button"
                      aria-label={`More options for ${story.title}`}
                    >
                      •••
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="dashboard-section trending-serials"
          aria-labelledby="trending-title"
        >
          <SectionHeading id="trending-title" title="Trending Serials" />
          <div className="serial-grid">
            {serials.map((serial) => (
              <article className="serial-card" key={serial.title}>
                <Image
                  src={serial.image}
                  alt={`Cover of ${serial.title}`}
                  width={112}
                  height={125}
                />
                <div>
                  <h3>{serial.title}</h3>
                  <p>{serial.chapter}</p>
                  <span>
                    <Eye /> {serial.reads}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="dashboard-section creator-updates"
          aria-labelledby="creators-title"
        >
          <SectionHeading
            id="creators-title"
            title="From creators you follow"
          />
          <ul>
            {creatorUpdates.map((update) => (
              <li key={update.name}>
                <Image src={update.image} alt="" width={58} height={58} />
                <p>
                  <strong>{update.name}</strong> {update.update}{' '}
                  {update.story && <b>{update.story}</b>}
                </p>
                <time>{update.time}</time>
                {update.unread && <span aria-label="Unread update" />}
              </li>
            ))}
          </ul>
        </section>

        <section
          className="community-pulse"
          id="community"
          aria-labelledby="community-title"
        >
          <div className="community-pulse-copy">
            <p>Community pulse</p>
            <h2 id="community-title">Your words matter.</h2>
            <span>
              Join conversations, share your voice,
              <br />
              and connect with readers worldwide.
            </span>
            <Link href="#community">
              Explore Community <CaretRight />
            </Link>
          </div>
          <div className="community-stats">
            <div>
              <i>
                <UsersThree />
              </i>
              <strong>12.4K</strong>
              <span>Active Readers</span>
            </div>
            <div>
              <i>
                <NotePencil />
              </i>
              <strong>3.8K</strong>
              <span>Stories Shared</span>
            </div>
            <div>
              <i>
                <ChatCircle />
              </i>
              <strong>7.2K</strong>
              <span>Comments Today</span>
            </div>
          </div>
        </section>
      </main>

      <nav className="reader-dashboard-nav" aria-label="Primary navigation">
        <Link href="/reader/dashboard" aria-current="page">
          <House weight="fill" />
          <span>Home</span>
        </Link>
        <Link href="/library">
          <BookOpen />
          <span>Library</span>
        </Link>
        <Link href="/signup?role=creator" className="create-link">
          <i>
            <Plus />
          </i>
          <span>Create</span>
        </Link>
        <Link href="#community">
          <UsersThree />
          <span>Community</span>
        </Link>
        <Link href="/reader/dashboard">
          <User />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}

function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <header className="dashboard-section-heading">
      <h2 id={id}>{title}</h2>
      <Link href="/discover">
        View all <CaretRight />
      </Link>
    </header>
  );
}
