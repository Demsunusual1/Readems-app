'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import {
  Bell,
  BookOpen,
  CaretRight,
  Compass,
  Feather,
  Heart,
  House,
  MagnifyingGlass,
  MapPin,
  MaskHappy,
  Planet,
  SlidersHorizontal,
  Sparkle,
  Star,
  UsersThree,
  Crown,
} from '@phosphor-icons/react';
import { Logo } from './ui/logo';
import './discover.css';

const genres = [
  ['Drama', MaskHappy],
  ['Romance', Heart],
  ['Fantasy', Sparkle],
  ['Mystery', MagnifyingGlass],
  ['Sci-Fi', Planet],
  ['Poetry', Feather],
] as const;
const regions = [
  [
    'African Folktales',
    'Timeless tales from across Africa',
    '312 stories',
    '/readems/featured-beneath-the-baobab-tree.png',
  ],
  [
    'Nigerian Stories',
    'Legends, myths & stories from Nigeria',
    '248 stories',
    '/readems/cover-shadows-of-the-drum.png',
  ],
  [
    'American Folktales',
    'Classic stories from Native traditions',
    '196 stories',
    '/readems/featured-when-stars-learn-to-bloom.png',
  ],
  [
    'World Folktales',
    'Stories that transcend borders',
    '428 stories',
    '/readems/featured-archivist-of-salt.png',
  ],
] as const;
const trends = [
  [
    'Coming of Age',
    '1.2K stories',
    'Journeys of growth, identity, and self-discovery.',
    Star,
    'purple',
  ],
  [
    'Family & Relationships',
    '1.8K stories',
    'Love, bonds, and the people who shape us.',
    UsersThree,
    'plum',
  ],
  [
    'Legends & Mythology',
    '2.3K stories',
    'Timeless myths and legends from around the world.',
    Crown,
    'gold',
  ],
] as const;

export function Discover({ dashboardHref }: { dashboardHref: string }) {
  const [query, setQuery] = useState('');
  const [mood, setMood] = useState('All Moods');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value)
      window.location.href = `/discover?search=${encodeURIComponent(value)}`;
  }
  return (
    <div className="discover-page">
      <header className="discover-header">
        <Logo tone="dark" />
        <div className="discover-header-actions">
          <button aria-label="Notifications">
            <Bell />
          </button>
          <Link href={dashboardHref} aria-label="Open profile">
            <Image
              src="/readems/creator-chinelo-okoye.png"
              alt=""
              width={58}
              height={58}
            />
          </Link>
        </div>
      </header>
      <main>
        <section className="discover-hero">
          <div className="discover-hero-copy">
            <h1>
              Find your
              <br />
              next world
            </h1>
            <p>
              Explore stories that move you, ideas that stay, and voices that
              belong.
            </p>
          </div>
          <div className="discover-hero-art" aria-hidden="true">
            <Image
              src="/readems/categories-hero.png"
              alt=""
              fill
              priority
              sizes="(max-width: 700px) 55vw, 430px"
            />
          </div>
          <form className="discover-search" onSubmit={submit} role="search">
            <MagnifyingGlass />
            <label className="sr-only" htmlFor="story-search">
              Search stories, authors, genres
            </label>
            <input
              id="story-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, authors, genres..."
            />
            <button type="button" aria-label="Search filters">
              <SlidersHorizontal />
            </button>
          </form>
        </section>
        <div className="discover-content">
          <section aria-labelledby="genre-heading">
            <Heading id="genre-heading">Browse by Genre</Heading>
            <div className="discover-genres">
              {genres.map(([label, Icon]) => (
                <button key={label} onClick={() => setQuery(label)}>
                  <span>
                    <Icon />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </section>
          <section aria-labelledby="regional-heading">
            <Heading id="regional-heading">Regional Folktales</Heading>
            <div className="discover-regions">
              {regions.map(([title, copy, count, image]) => (
                <article key={title}>
                  <div className="discover-region-image">
                    <Image src={image} alt="" fill sizes="210px" />
                    <MapPin weight="fill" />
                  </div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <small>{count}</small>
                </article>
              ))}
            </div>
          </section>
          <section aria-labelledby="mood-heading">
            <h2 id="mood-heading">Find Your Mood</h2>
            <div className="discover-moods">
              {[
                'All Moods',
                'Inspirational',
                'Thoughtful',
                'Adventurous',
                'Heartfelt',
              ].map((label) => (
                <button
                  key={label}
                  aria-pressed={mood === label}
                  onClick={() => setMood(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
          <section aria-labelledby="trending-heading">
            <Heading id="trending-heading">Trending Categories</Heading>
            <div className="discover-trends">
              {trends.map(([title, count, copy, Icon, tone]) => (
                <Link
                  href={`/discover?category=${encodeURIComponent(title)}`}
                  key={title}
                >
                  <span className={`discover-trend-icon ${tone}`}>
                    <Icon />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{count}</small>
                  </span>
                  <p>{copy}</p>
                  <CaretRight />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <nav className="discover-bottom" aria-label="Primary navigation">
        <Link href="/">
          <House />
          <span>Home</span>
        </Link>
        <Link href="/discover" aria-current="page">
          <Compass weight="fill" />
          <span>Discover</span>
        </Link>
        <Link href="/signup?role=creator">
          <Feather />
          <span>Write</span>
        </Link>
        <Link href="/#community-title">
          <UsersThree />
          <span>Community</span>
        </Link>
        <Link href={dashboardHref}>
          <BookOpen />
          <span>Library</span>
        </Link>
      </nav>
    </div>
  );
}
function Heading({ id, children }: { id: string; children: string }) {
  return (
    <div className="discover-section-heading">
      <h2 id={id}>{children}</h2>
      <Link href="/discover">
        View all <CaretRight />
      </Link>
    </div>
  );
}
