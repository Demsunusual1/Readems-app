import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  BookOpen,
  Books,
  ChatCircle,
  Clock,
  Eye,
  Funnel,
  House,
  MagnifyingGlass,
  Note,
  Plus,
  SortAscending,
  User,
} from '@phosphor-icons/react/dist/ssr';
import { ReademsLogo } from './readems-logo';
import './creator-stories.css';

const stories = [
  {
    title: 'The Last Train to Makoko',
    genre: 'Thriller',
    chapters: 12,
    copy: 'A journalist returns home to uncover the truth behind a corrupt coastal city.',
    reads: '96.4K',
    likes: '4.1K',
    comments: '892',
    status: 'PUBLISHED',
    date: 'May 12, 2024',
    image: '/readems/cover-last-train-to-makoko.png',
  },
  {
    title: 'Whispers of the Lagoon',
    genre: 'Romance',
    chapters: 8,
    copy: 'Love blooms in a quiet lagoon town where secrets run deep.',
    reads: '78.2K',
    likes: '3.3K',
    comments: '612',
    status: 'PUBLISHED',
    date: 'Apr 28, 2024',
    image: '/readems/cover-shadows-of-the-drum.png',
  },
  {
    title: 'Echoes in the Market',
    genre: 'Drama',
    chapters: 6,
    copy: 'In a city of dreams, a boy’s choice changes everything.',
    reads: '45.1K',
    likes: '2.2K',
    comments: '431',
    status: 'DRAFT',
    date: 'Updated 2d ago',
    image: '/readems/featured-beneath-the-baobab-tree.png',
  },
  {
    title: 'Fragments of Us',
    genre: 'Contemporary',
    chapters: 10,
    copy: 'Pieces of the past. Chances for the future. Some bonds never break.',
    reads: '32.7K',
    likes: '1.8K',
    comments: '309',
    status: 'DRAFT',
    date: 'Updated 5d ago',
    image: '/readems/cover-letters-to-my-younger-self.png',
  },
] as const;

export function CreatorStories({ avatarUrl }: { avatarUrl: string | null }) {
  const avatar = avatarUrl || '/readems/community-daniel.png';
  return (
    <main className="stories-manager">
      <section className="stories-hero">
        <header>
          <ReademsLogo tone="light" />
          <div>
            <Link href="/notifications" aria-label="Notifications">
              <Bell />
            </Link>
            <Image src={avatar} alt="" width={52} height={52} unoptimized />
          </div>
        </header>
        <div className="stories-title">
          <div>
            <h1>My Stories</h1>
            <p>Create worlds. Share stories. Inspire readers.</p>
          </div>
          <Link href="/creator/stories/new">
            <Plus /> Create New Story
          </Link>
        </div>
        <div className="story-tabs">
          <button className="active">
            <BookOpen /> Published <b>8</b>
          </button>
          <button>
            <Note /> Drafts <b>5</b>
          </button>
          <button>
            <Clock /> Scheduled <b>2</b>
          </button>
        </div>
      </section>
      <section className="stories-content">
        <div className="story-tools">
          <label>
            <MagnifyingGlass />
            <input
              aria-label="Search stories"
              placeholder="Search stories..."
            />
          </label>
          <button>
            <Funnel /> Filter
          </button>
          <button aria-label="Sort stories">
            <SortAscending />
          </button>
        </div>
        <div className="story-list">
          {stories.map((story) => (
            <article className="manager-story" key={story.title}>
              <Image src={story.image} alt="" width={194} height={255} />
              <div className="manager-story-main">
                <h2>{story.title}</h2>
                <p className="story-meta">
                  <span>{story.genre}</span> · {story.chapters} Chapters
                </p>
                <p className="story-copy">{story.copy}</p>
                <div className="story-numbers">
                  <span>
                    <Eye />
                    <b>{story.reads}</b>
                    <small>Reads</small>
                  </span>
                  <span>
                    ♡ <b>{story.likes}</b>
                    <small>Likes</small>
                  </span>
                  <span>
                    <ChatCircle />
                    <b>{story.comments}</b>
                    <small>Comments</small>
                  </span>
                </div>
              </div>
              <div className="story-state">
                <b className={story.status.toLowerCase()}>{story.status}</b>
                <span>{story.date}</span>
              </div>
              <button
                className="story-menu"
                aria-label={`More options for ${story.title}`}
              >
                ⋮
              </button>
            </article>
          ))}
        </div>
      </section>
      <nav className="stories-bottom-nav" aria-label="Creator navigation">
        <Link href="/">
          <House />
          Home
        </Link>
        <Link className="active" href="/creator/stories">
          <Books />
          My Stories
        </Link>
        <Link className="create" href="/creator/stories/new">
          <span>
            <Plus />
          </span>
          Create
        </Link>
        <Link href="/messages">
          <ChatCircle />
          Messages
        </Link>
        <Link href="/profile-settings">
          <User />
          Profile
        </Link>
      </nav>
    </main>
  );
}
