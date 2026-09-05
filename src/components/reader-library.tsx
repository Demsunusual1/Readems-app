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
  CheckCircle,
  Compass,
  DownloadSimple,
  Feather,
  Globe,
  House,
  LockSimple,
  MagnifyingGlass,
  Plus,
  SlidersHorizontal,
  Sparkle,
  UserCircle,
} from '@phosphor-icons/react';
import { Logo } from './ui/logo';
import './reader-library.css';

const tabs = [
  ['Current', BookOpen],
  ['Saved', BookmarkSimple],
  ['Completed', CheckCircle],
  ['Downloads', DownloadSimple],
] as const;

const shelf = [
  {
    title: 'Beneath the Baobab Tree',
    author: 'Chineu Odafe',
    progress: 65,
    image: '/readems/library-cover-baobab.png',
    href: '/stories/baobab',
  },
  {
    title: 'The House on Freedom Street',
    author: 'Lesli Johnson',
    progress: 42,
    image: '/readems/library-cover-freedom-street.png',
    href: '/discover',
  },
  {
    title: 'The Last Train to Makoko',
    author: 'Tendayi M.',
    progress: 20,
    image: '/readems/library-cover-makoko.png',
    href: '/discover',
  },
] as const;

const lists = [
  {
    title: 'African Voices',
    count: 8,
    privacy: 'Public',
    copy: 'Stories that center our voices and our worlds.',
    image: '/readems/library-list-african-voices.png',
    Icon: Globe,
    tone: 'navy',
  },
  {
    title: 'Writers I Admire',
    count: 12,
    privacy: 'Private',
    copy: 'Craft, courage, and impact.',
    image: '/readems/library-list-writers.png',
    Icon: Feather,
    tone: 'plum',
  },
  {
    title: 'Future Reads',
    count: 15,
    privacy: 'Private',
    copy: 'On deck and on my mind.',
    image: '/readems/library-list-future.png',
    Icon: Sparkle,
    tone: 'purple',
  },
] as const;

export function ReaderLibrary({ profileHref }: { profileHref: string }) {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number][0]>('Current');

  return (
    <div className="library-page">
      <header className="library-hero">
        <div className="library-header">
          <Logo tone="light" />
          <nav aria-label="Library utilities">
            <Link href="/discover" aria-label="Search stories">
              <MagnifyingGlass />
            </Link>
            <button type="button" aria-label="Notifications">
              <Bell />
              <span aria-hidden="true" />
            </button>
          </nav>
        </div>
        <div className="library-hero-copy">
          <h1>My Library</h1>
          <p>
            Your stories. Your growth.
            <br />
            Your community.
          </p>
        </div>
        <Image
          className="library-hero-book"
          src="/readems/library-hero-book.png"
          alt=""
          width={360}
          height={240}
          priority
        />
      </header>

      <main className="library-main">
        <section className="reading-goal" aria-labelledby="reading-goal-title">
          <div className="reading-goal-copy">
            <h2 id="reading-goal-title">Reading Goal</h2>
            <strong>
              14 <span>of 24 books</span>
            </strong>
            <p>58% of your annual goal</p>
            <div
              className="goal-progress"
              aria-label="58 percent of annual reading goal"
            >
              <span />
            </div>
          </div>
          <div className="goal-sparkles" aria-hidden="true">
            <Sparkle />
          </div>
          <div className="goal-status">
            <div className="goal-ring">
              <BookOpen />
            </div>
            <strong>6 books ahead</strong>
            <span>Great momentum!</span>
          </div>
        </section>

        <div
          className="library-tabs"
          role="tablist"
          aria-label="Library sections"
        >
          {tabs.map(([label, Icon]) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === label}
              className={activeTab === label ? 'is-active' : undefined}
              key={label}
              onClick={() => setActiveTab(label)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <section className="library-shelf" aria-labelledby="shelf-heading">
          <header>
            <div>
              <h2 id="shelf-heading">My Shelf</h2>
              <span>12</span>
            </div>
            <div className="shelf-controls">
              <button type="button">
                Recent <CaretDown />
              </button>
              <button type="button" aria-label="Filter library">
                <SlidersHorizontal />
              </button>
            </div>
          </header>
          <div className="shelf-grid">
            {shelf.map((story) => (
              <article className="shelf-card" key={story.title}>
                <Link href={story.href} className="shelf-cover">
                  <Image
                    src={story.image}
                    alt={`Cover of ${story.title}`}
                    fill
                    sizes="(max-width: 600px) 31vw, 240px"
                  />
                  <span>{story.progress}%</span>
                </Link>
                <div className="shelf-card-copy">
                  <button
                    type="button"
                    aria-label={`More options for ${story.title}`}
                  >
                    •••
                  </button>
                  <h3>
                    <Link href={story.href}>{story.title}</Link>
                  </h3>
                  <p>{story.author}</p>
                  <div className="shelf-progress">
                    <span>
                      <i style={{ width: `${story.progress}%` }} />
                    </span>
                    <b>{story.progress}%</b>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="reading-lists" aria-labelledby="lists-heading">
          <header>
            <h2 id="lists-heading">My Reading Lists</h2>
            <button type="button">
              New List <Plus />
            </button>
          </header>
          <div className="reading-list-rows">
            {lists.map(({ title, count, privacy, copy, image, Icon, tone }) => (
              <Link href="/library" className="reading-list-row" key={title}>
                <span className={`reading-list-icon ${tone}`}>
                  <Icon />
                </span>
                <span className="reading-list-copy">
                  <strong>{title}</strong>
                  <small>
                    {count} books <i>•</i>{' '}
                    {privacy === 'Private' && <LockSimple />} {privacy}
                  </small>
                  <span>{copy}</span>
                </span>
                <Image src={image} alt="" width={205} height={92} />
                <CaretRight />
              </Link>
            ))}
          </div>
        </section>

        <aside className="offline-card">
          <DownloadSimple />
          <div>
            <strong>Offline Mode</strong>
            <span>3 books available offline</span>
          </div>
          <button type="button" onClick={() => setActiveTab('Downloads')}>
            View Downloads
          </button>
        </aside>
      </main>

      <nav className="library-bottom-nav" aria-label="Primary navigation">
        <Link href="/">
          <House />
          <span>Home</span>
        </Link>
        <Link href="/discover">
          <Compass />
          <span>Explore</span>
        </Link>
        <Link href="/signup?role=creator">
          <Feather />
          <span>Write</span>
        </Link>
        <Link href="/library" aria-current="page">
          <BookOpen weight="fill" />
          <span>Library</span>
        </Link>
        <Link href={profileHref}>
          <UserCircle />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
