import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Compass,
  House,
  MagnifyingGlass,
  UserCircle,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { search } from '@/lib/search';
import { relativeTime } from '@/lib/time';
import { FollowButton } from '@/components/follow-button';
import { JoinGroupButton } from '@/components/join-group-button';
import { RecentSearches } from '@/components/recent-searches';
import { Logo } from '@/components/ui/logo';
import '@/components/search.css';

export const metadata: Metadata = {
  title: 'Search | Readems',
  description: 'Search stories, creators, groups and posts across Readems.',
};

const filters = ['All', 'Stories', 'Creators', 'Groups', 'Posts'] as const;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q, filter } = await searchParams;
  const term = q ?? '';
  const active = filters.includes((filter ?? 'All') as (typeof filters)[number])
    ? ((filter ?? 'All') as (typeof filters)[number])
    : 'All';
  const user = await getCurrentUser();
  const results = await search(term, user?.id ?? null);
  const show = (name: (typeof filters)[number]) =>
    active === 'All' || active === name;

  return (
    <div className="search-page">
      <header className="search-hero">
        <div className="search-hero-top">
          <Logo tone="light" />
          <Link href="/discover">Cancel</Link>
        </div>
        <form role="search" action="/search" className="search-field">
          <label className="sr-only" htmlFor="search-input">
            Search stories, creators, groups and posts
          </label>
          <MagnifyingGlass aria-hidden="true" />
          <input
            id="search-input"
            name="q"
            defaultValue={term}
            placeholder="Search stories, creators, groups…"
            autoComplete="off"
          />
          <input type="hidden" name="filter" value={active} />
          <button type="submit">Search</button>
        </form>
      </header>

      <nav className="search-filters" aria-label="Result types">
        {filters.map((name) => (
          <Link
            key={name}
            href={`/search?q=${encodeURIComponent(term)}&filter=${name}`}
            className={active === name ? 'is-active' : undefined}
            aria-current={active === name ? 'page' : undefined}
          >
            {name}
          </Link>
        ))}
      </nav>

      <main className="search-main">
        <RecentSearches term={term} />

        {term.trim().length < 2 ? (
          <p className="search-empty">
            Type at least two letters to search Readems.
          </p>
        ) : results.total === 0 ? (
          <p className="search-empty">Nothing matches “{results.term}” yet.</p>
        ) : (
          <>
            {results.top && active === 'All' && (
              <section aria-labelledby="top-result">
                <h2 id="top-result">Top result</h2>
                <Link className="search-top" href={results.top.href}>
                  {results.top.kind === 'story' && results.stories[0] && (
                    <>
                      <Image
                        src={results.stories[0].coverUrl}
                        alt=""
                        width={96}
                        height={132}
                      />
                      <span>
                        <small>STORY</small>
                        <strong>{results.stories[0].title}</strong>
                        <span>by {results.stories[0].authorName}</span>
                        <span className="search-synopsis">
                          {results.stories[0].synopsis}
                        </span>
                      </span>
                    </>
                  )}
                  {results.top.kind !== 'story' && (
                    <span>
                      <small>{results.top.kind.toUpperCase()}</small>
                      <strong>
                        {results.top.kind === 'person'
                          ? results.people[0].name
                          : results.top.kind === 'group'
                            ? results.groups[0].name
                            : 'A post in the community'}
                      </strong>
                    </span>
                  )}
                </Link>
              </section>
            )}

            {show('Stories') && results.stories.length > 0 && (
              <section aria-labelledby="story-results">
                <h2 id="story-results">Stories</h2>
                <ul className="search-stories">
                  {results.stories.map((story) => (
                    <li key={story.id}>
                      <Link href={`/stories/${story.id}`}>
                        <Image
                          src={story.coverUrl}
                          alt=""
                          width={56}
                          height={78}
                        />
                        <span>
                          <strong>{story.title}</strong>
                          <small>
                            by {story.authorName} <i>•</i> {story.genre}
                          </small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {show('Creators') && results.people.length > 0 && (
              <section aria-labelledby="people-results">
                <h2 id="people-results">Creators</h2>
                <ul className="search-people">
                  {results.people.map((person) => (
                    <li key={person.id}>
                      <Link href={`/u/${person.username}`}>
                        {person.avatarUrl ? (
                          <Image
                            src={person.avatarUrl}
                            alt=""
                            width={48}
                            height={48}
                          />
                        ) : (
                          <UserCircle size={48} aria-hidden="true" />
                        )}
                        <span>
                          <strong>{person.name}</strong>
                          <small>
                            {person.followers}{' '}
                            {person.followers === 1 ? 'follower' : 'followers'}{' '}
                            <i>•</i> {person.storyCount}{' '}
                            {person.storyCount === 1 ? 'story' : 'stories'}
                          </small>
                        </span>
                      </Link>
                      {user?.id !== person.id && (
                        <FollowButton
                          personId={person.id}
                          username={person.username}
                          name={person.name}
                          following={person.isFollowing}
                          signedIn={Boolean(user)}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {show('Groups') && results.groups.length > 0 && (
              <section aria-labelledby="group-results">
                <h2 id="group-results">Groups</h2>
                <ul className="search-groups">
                  {results.groups.map((group) => (
                    <li key={group.id}>
                      <Link href={`/groups/${group.id}`}>
                        <strong>{group.name}</strong>
                        <small>
                          {group.tagline} <i>•</i> {group.members}{' '}
                          {group.members === 1 ? 'member' : 'members'}
                        </small>
                      </Link>
                      <JoinGroupButton
                        groupId={group.id}
                        name={group.name}
                        joined={group.isMember}
                        signedIn={Boolean(user)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {show('Posts') && results.posts.length > 0 && (
              <section aria-labelledby="post-results">
                <h2 id="post-results">Posts</h2>
                <ul className="search-posts">
                  {results.posts.map((post) => (
                    <li key={post.id}>
                      <Link href="/community">
                        <strong>{post.author.name}</strong>
                        <small>{relativeTime(post.createdAt)}</small>
                        <span>{post.body}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>

      <nav className="community-bottom-nav" aria-label="Primary navigation">
        <Link href="/">
          <House />
          <span>Home</span>
        </Link>
        <Link href="/discover">
          <Compass />
          <span>Discover</span>
        </Link>
        <Link href="/library">
          <BookOpen />
          <span>Library</span>
        </Link>
        <Link href="/community">
          <UsersThree />
          <span>Community</span>
        </Link>
        <Link href="/search" aria-current="page">
          <MagnifyingGlass weight="fill" />
          <span>Search</span>
        </Link>
      </nav>
    </div>
  );
}
