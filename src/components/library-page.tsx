'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Bell,
  BookOpen,
  BookmarkSimple,
  CaretDown,
  CaretRight,
  ChatCircle,
  CheckCircle,
  Compass,
  DownloadSimple,
  Feather,
  GlobeHemisphereWest,
  House,
  MagnifyingGlass,
  Plus,
  SlidersHorizontal,
  StarFour,
  User,
} from '@phosphor-icons/react';
import './library-page.css';

type Shelf = 'Current' | 'Saved' | 'Completed' | 'Downloads';
const books = [
  [
    'Beneath the Baobab Tree',
    'Chineu Odafe',
    '65%',
    '/readems/story-baobab-cover.png',
    'baobab',
  ],
  [
    'The House on Freedom Street',
    'Lesil Johnson',
    '42%',
    '/readems/featured-when-stars-learn-to-bloom.png',
    'archivist',
  ],
  [
    'The Last Train to Makoko',
    'Tendayi M.',
    '20%',
    '/readems/cover-last-train-to-makoko.png',
    'makoko',
  ],
] as const;
const lists = [
  [
    'African Voices',
    '8 books',
    'Public',
    'Stories that center our voices and our worlds.',
    'globe',
  ],
  [
    'Writers I Admire',
    '12 books',
    'Private',
    'Craft, courage, and impact.',
    'feather',
  ],
  ['Future Reads', '15 books', 'Private', 'On deck and on my mind.', 'star'],
] as const;

export function LibraryPage({ role }: { role: string }) {
  const [shelf, setShelf] = useState<Shelf>('Current');
  const [newListVisible, setNewListVisible] = useState(false);
  const [oldestFirst, setOldestFirst] = useState(false);
  const [inProgressOnly, setInProgressOnly] = useState(false);
  const home = role === 'CREATOR' ? '/creator/dashboard' : '/reader/dashboard';
  const readerMode = role === 'READER';
  const visibleBooks = (oldestFirst ? [...books].reverse() : books).filter(
    (book) => {
      const progress = Number.parseInt(book[2]);
      return !inProgressOnly || (progress > 0 && progress < 100);
    },
  );

  return (
    <main className="library-page">
      <section className="library-hero">
        <div className="library-stars" />
        <header>
          <Link href={home}>
            <Image
              src="/readems/logo.png"
              alt="Readems"
              width={46}
              height={46}
            />
            <strong>Readems</strong>
          </Link>
          <div>
            <Link href="/discover" aria-label="Search">
              <MagnifyingGlass />
            </Link>
            <Link href="/notifications" aria-label="Notifications">
              <Bell />
              <i />
            </Link>
          </div>
        </header>
        <h1>My Library</h1>
        <p>
          Your stories. Your growth.
          <br />
          Your community.
        </p>
        <Image
          className="library-book-art"
          src="/readems/writer-cta-quill-book.png"
          alt=""
          width={460}
          height={300}
        />
      </section>

      <section className="library-content">
        <article className="reading-goal">
          <div>
            <h2>Reading Goal</h2>
            <strong>
              14 <small>of 24 books</small>
            </strong>
            <p>58% of your annual goal</p>
            <progress value="58" max="100" />
          </div>
          <span>✧</span>
          <div className="goal-momentum">
            <b>
              <BookOpen />
            </b>
            <strong>6 books ahead</strong>
            <small>Great momentum!</small>
          </div>
        </article>

        <nav className="library-tabs" aria-label="Library shelves">
          {(['Current', 'Saved', 'Completed', 'Downloads'] as Shelf[]).map(
            (name) => {
              const Icon =
                name === 'Current'
                  ? BookOpen
                  : name === 'Saved'
                    ? BookmarkSimple
                    : name === 'Completed'
                      ? CheckCircle
                      : DownloadSimple;
              return (
                <button
                  key={name}
                  className={shelf === name ? 'active' : ''}
                  aria-pressed={shelf === name}
                  onClick={() => setShelf(name)}
                >
                  <Icon />
                  {name}
                </button>
              );
            },
          )}
        </nav>

        <section className="library-shelf">
          <header>
            <h2>
              My Shelf <span>12</span>
            </h2>
            <div>
              <button
                type="button"
                onClick={() => setOldestFirst((value) => !value)}
                aria-pressed={oldestFirst}
              >
                {oldestFirst ? 'Oldest' : 'Recent'} <CaretDown />
              </button>
              <button
                type="button"
                aria-label="Show in-progress books only"
                aria-pressed={inProgressOnly}
                onClick={() => setInProgressOnly((value) => !value)}
              >
                <SlidersHorizontal />
              </button>
            </div>
          </header>
          <div className="library-book-grid">
            {visibleBooks.map(([title, author, progress, image, id]) => (
              <Link
                className="library-book-card"
                href={`/stories/${id}`}
                key={title}
              >
                <div className="library-cover">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 31vw, 300px"
                  />
                  <b>{progress}</b>
                </div>
                <h3>{title}</h3>
                <p>{author}</p>
                <footer>
                  <progress value={Number.parseInt(progress)} max="100" />
                  <strong>{progress}</strong>
                </footer>
              </Link>
            ))}
          </div>
        </section>

        <section className="reading-lists">
          <header>
            <h2>My Reading Lists</h2>
            <button type="button" onClick={() => setNewListVisible(true)}>
              New List <Plus />
            </button>
          </header>
          {newListVisible && (
            <div className="new-reading-list" role="status">
              New reading list ready to name.
              <button type="button" onClick={() => setNewListVisible(false)}>
                Close
              </button>
            </div>
          )}
          {lists.map(([title, count, privacy, copy, symbol]) => (
            <article key={title}>
              <span>
                {symbol === 'globe' ? (
                  <GlobeHemisphereWest />
                ) : symbol === 'feather' ? (
                  <Feather />
                ) : (
                  <StarFour />
                )}
              </span>
              <div>
                <h3>{title}</h3>
                <p>
                  {count} &nbsp;·&nbsp; {privacy}
                </p>
                <small>{copy}</small>
              </div>
              <div className="mini-books">
                {[...books, books[1], books[2]].map((book, index) => (
                  <Image
                    src={book[3]}
                    alt=""
                    width={35}
                    height={50}
                    key={`${book[0]}-${index}`}
                  />
                ))}
              </div>
              <CaretRight />
            </article>
          ))}
        </section>

        <aside className="offline-mode">
          <DownloadSimple />
          <div>
            <strong>Offline Mode</strong>
            <small>3 books available offline</small>
          </div>
          <button type="button" onClick={() => setShelf('Downloads')}>
            View Downloads
          </button>
        </aside>
      </section>

      <nav className="library-bottom" aria-label="Primary navigation">
        <Link href={home}>
          <House />
          <span>Home</span>
        </Link>
        <Link href="/discover">
          <Compass />
          <span>Discover</span>
        </Link>
        <Link className="active" href="/library" aria-current="page">
          <BookOpen weight="fill" />
          <span>Library</span>
        </Link>
        <Link href={readerMode ? '/messages' : '/creator/stories/new'}>
          {readerMode ? <ChatCircle /> : <span aria-hidden="true">✎</span>}
          <span>{readerMode ? 'Messages' : 'Write'}</span>
        </Link>
        <Link href="/profile-settings">
          <User />
          <span>Profile</span>
        </Link>
      </nav>
    </main>
  );
}
