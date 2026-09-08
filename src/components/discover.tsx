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
import {
  discoverGenres,
  discoverRegions,
  discoverTrends,
  storyCountLabel,
} from '@/lib/discover-sections';

const genreIcons: Record<string, typeof MaskHappy> = {
  Drama: MaskHappy,
  Romance: Heart,
  Fantasy: Sparkle,
  Mystery: MagnifyingGlass,
  'Sci-Fi': Planet,
  Poetry: Feather,
};

const trendIcons: Record<string, typeof Star> = {
  'Coming of Age': Star,
  'Family & Relationships': UsersThree,
  'Legends & Mythology': Crown,
};
import './discover.css';

export function Discover({
  dashboardHref,
  counts,
}: {
  dashboardHref: string;
  counts: Record<string, number>;
}) {
  const [query, setQuery] = useState('');
  const [mood, setMood] = useState('All Moods');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value) window.location.href = `/search?q=${encodeURIComponent(value)}`;
  }
  return (
    <div className="discover-page">
      <header className="discover-header">
        <Logo tone="dark" />
        <div className="discover-header-actions">
          <Link href="/notifications" aria-label="Notifications">
            <Bell />
          </Link>
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
              {discoverGenres.map((label) => {
                const Icon = genreIcons[label];
                return (
                  <Link
                    key={label}
                    href={`/search?q=${encodeURIComponent(label)}`}
                  >
                    <span>
                      <Icon />
                    </span>
                    {label}
                    <small>{storyCountLabel(counts, label)}</small>
                  </Link>
                );
              })}
            </div>
          </section>
          <section aria-labelledby="regional-heading">
            <Heading id="regional-heading">Regional Folktales</Heading>
            <div className="discover-regions">
              {discoverRegions.map((region) => (
                <Link
                  key={region.tag}
                  href={`/search?q=${encodeURIComponent(region.tag)}`}
                >
                  <span className="discover-region-image">
                    <Image src={region.image} alt="" fill sizes="210px" />
                    <MapPin weight="fill" />
                  </span>
                  <h3>{region.tag}</h3>
                  <p>{region.copy}</p>
                  <small>{storyCountLabel(counts, region.tag)}</small>
                </Link>
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
              {discoverTrends.map(({ tag, copy, tone }) => {
                const Icon = trendIcons[tag];
                return (
                  <Link href={`/search?q=${encodeURIComponent(tag)}`} key={tag}>
                    <span className={`discover-trend-icon ${tone}`}>
                      <Icon />
                    </span>
                    <span>
                      <strong>{tag}</strong>
                      <small>{storyCountLabel(counts, tag)}</small>
                    </span>
                    <p>{copy}</p>
                    <CaretRight />
                  </Link>
                );
              })}
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
        <Link href="/library">
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
      <Link href={`/search?q=${encodeURIComponent(children)}`}>
        View all <CaretRight />
      </Link>
    </div>
  );
}
