'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Compass,
  House,
  Feather,
  UsersThree,
  UserCircle,
  MagnifyingGlass,
  ArrowUpRight,
  Sparkle,
  Heart,
  GlobeHemisphereWest,
  BookOpen,
  Planet,
  MaskHappy,
} from '@phosphor-icons/react';
import { Logo } from './ui/logo';
import { Input } from './ui/input';
import { categories, selectStories } from '@/lib/discover';
import './discover.css';

const collections = [
  ['featured', 'Featured'],
  ['trending', 'Trending'],
  ['recent', 'Recently updated'],
  ['for-you', 'For you'],
] as const;
const icons = [
  BookOpen,
  GlobeHemisphereWest,
  MaskHappy,
  Heart,
  Sparkle,
  MagnifyingGlass,
  Planet,
  Feather,
  BookOpen,
];
export function Discover({
  interests,
  signedIn,
  dashboardHref,
}: {
  interests: string[];
  signedIn: boolean;
  dashboardHref: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All stories');
  const [collection, setCollection] = useState('featured');
  const stories = selectStories(query, category, collection, interests);

  function clear() {
    setQuery('');
    setCategory('All stories');
    setCollection('trending');
  }

  return (
    <div className="discover-page">
      <header className="discover-header">
        <Logo tone="dark" />
        <nav aria-label="Discover navigation">
          <Link href="/">Home</Link>
          <Link href="/discover" aria-current="page">
            Discover
          </Link>
          <Link href={dashboardHref}>{signedIn ? 'Dashboard' : 'Log in'}</Link>
        </nav>
        <Link
          className="discover-account"
          href={signedIn ? dashboardHref : '/signup'}
        >
          {signedIn ? (
            <>
              <UserCircle aria-hidden="true" />
              My account
            </>
          ) : (
            'Join Readems'
          )}
        </Link>
      </header>
      <main className="discover-main" id="discover-main">
        <div className="discover-heading">
          <div>
            <p className="discover-eyebrow">THE READEMS BOOKSHELF</p>
            <h1>Find your next world.</h1>
            <p>Folktales, new voices, and stories that stay with you.</p>
          </div>
          <Compass aria-hidden="true" />
        </div>
        <div className="discover-search">
          <label htmlFor="story-search" className="sr-only">
            Search stories or authors
          </label>
          <Input
            id="story-search"
            type="search"
            placeholder="Search stories, authors, genres…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCollection('trending');
            }}
            leadingIcon={<MagnifyingGlass size={24} />}
          />
        </div>
        <section className="discover-genres" aria-labelledby="genre-heading">
          <h2 id="genre-heading">Browse by genre</h2>
          <div className="discover-category-row">
            {categories.map((name, index) => {
              const Icon = icons[index];
              return (
                <button
                  key={name}
                  aria-pressed={category === name}
                  onClick={() => {
                    setCategory(name);
                    setCollection('trending');
                  }}
                >
                  <Icon aria-hidden="true" />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </section>
        <section aria-labelledby="collection-heading">
          <div className="discover-collection-heading">
            <h2 id="collection-heading">Your next chapter</h2>
            <span className="discover-preview-label">Sample catalogue</span>
          </div>
          <div
            className="discover-collections"
            role="group"
            aria-label="Story collections"
          >
            {collections.map(([value, label]) => (
              <button
                key={value}
                aria-pressed={collection === value}
                onClick={() => setCollection(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="discover-note">
            {collection === 'for-you'
              ? interests.length
                ? `Matched to your interests: ${interests.join(', ')}.`
                : signedIn
                  ? 'Choose interests during account setup to personalise your recommendations. Showing editorial picks for now.'
                  : 'Sign in to see matches for your selected interests. Showing editorial picks for now.'
              : 'Explore editorial story previews and open any title to start reading.'}
          </p>
          <p className="discover-results" role="status">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            {query.trim() ? ` matching “${query.trim()}”` : ''}
            {category !== 'All stories' ? ` in ${category}` : ''}
          </p>
          {stories.length ? (
            <div className="discover-grid">
              {stories.map((story) => (
                <article className="discover-story-card" key={story.id}>
                  <div className="discover-cover">
                    <Image
                      src={story.cover}
                      alt={`Cover artwork for ${story.title}`}
                      fill
                      sizes="(max-width: 600px) 44vw, (max-width: 900px) 30vw, 280px"
                    />
                    <span>{story.category}</span>
                  </div>
                  <div className="discover-story-card-copy">
                    <h3>{story.title}</h3>
                    <p className="discover-author">{story.author}</p>
                    <p className="discover-description">{story.description}</p>
                    <Link
                      className="discover-story-link"
                      href={`/story/${story.id}`}
                      aria-label={`Open ${story.title}`}
                    >
                      View story <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="discover-empty">
              <MagnifyingGlass size={36} aria-hidden="true" />
              <h3>No matching previews yet</h3>
              <p>
                Try another title or genre. New categories will fill up as
                stories are published.
              </p>
              <button onClick={clear}>Show all previews</button>
            </div>
          )}
        </section>
        <aside className="discover-writer">
          <Feather size={36} aria-hidden="true" />
          <div>
            <h2>There’s room for your story.</h2>
            <p>Join the next generation of Readems storytellers.</p>
          </div>
          <Link href={signedIn ? dashboardHref : '/signup?role=creator'}>
            {signedIn ? 'Open dashboard' : 'Become a creator'}{' '}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </aside>
      </main>
      <nav className="discover-bottom" aria-label="Mobile navigation">
        <Link href="/">
          <House />
          <span>Home</span>
        </Link>
        <Link href="/discover" aria-current="page">
          <Compass weight="fill" />
          <span>Discover</span>
        </Link>
        <Link href={signedIn ? dashboardHref : '/signup?role=creator'}>
          <Feather />
          <span>Write</span>
        </Link>
        <Link href="/#community-title">
          <UsersThree />
          <span>Community</span>
        </Link>
        <Link href={dashboardHref}>
          <UserCircle />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
