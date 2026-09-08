import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  Compass,
  House,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getGroups } from '@/lib/groups';
import { GroupsBrowser } from '@/components/groups-browser';
import { Logo } from '@/components/ui/logo';
import '@/components/community.css';

export const metadata: Metadata = {
  title: 'Groups | Readems',
  description:
    'Join groups to connect, learn, share and grow with other readers and writers.',
};

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string; view?: string }>;
}) {
  const { q, topic, view } = await searchParams;
  const user = await getCurrentUser();
  const joinedView = view === 'joined' && Boolean(user);

  const groups = await getGroups({
    viewerId: user?.id ?? null,
    joined: joinedView,
    topic: topic || undefined,
    query: q || undefined,
  });

  return (
    <div className="community-page">
      <header className="community-hero">
        <div className="community-hero-top">
          <Logo tone="light" />
        </div>
        <h1>
          Find Your People.
          <br />
          <em>Fuel</em> Your Story.
        </h1>
        <p>Join groups to connect, learn, share and grow together.</p>
        <form className="group-search" role="search" action="/groups">
          <label className="sr-only" htmlFor="group-search">
            Search groups by name or topic
          </label>
          <input
            id="group-search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search groups by name or topic"
          />
          <button type="submit">Search</button>
        </form>
      </header>

      <main className="community-main groups-main">
        <GroupsBrowser
          groups={groups}
          signedIn={Boolean(user)}
          joinedView={joinedView}
          topic={topic ?? ''}
          query={q ?? ''}
        />
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
        <Link href="/groups" aria-current="page">
          <UsersThree weight="fill" />
          <span>Groups</span>
        </Link>
      </nav>
    </div>
  );
}
