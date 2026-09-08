import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ChartLineUp,
  ChatCircle,
  Eye,
  Heart,
  House,
  PlusCircle,
  UserCircle,
} from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getMyStories } from '@/lib/creator';
import { Logo } from '@/components/ui/logo';
import '@/components/creator.css';

export const metadata: Metadata = {
  title: 'My Stories | Readems',
  description: 'Create worlds. Share stories. Inspire readers.',
};

const tabs = ['Published', 'Drafts', 'Scheduled'] as const;

export default async function MyStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const { tab, q } = await searchParams;
  const active = tabs.includes((tab ?? 'Published') as (typeof tabs)[number])
    ? ((tab ?? 'Published') as (typeof tabs)[number])
    : 'Published';

  const mine = await getMyStories(user.id);
  const byTab = {
    Published: mine.published,
    Drafts: mine.drafts,
    Scheduled: mine.scheduled,
  }[active];
  const term = (q ?? '').trim().toLowerCase();
  const stories = term
    ? byTab.filter((story) => story.title.toLowerCase().includes(term))
    : byTab;

  return (
    <div className="creator-page">
      <header className="creator-hero">
        <Logo tone="light" />
        <div className="creator-hero-copy">
          <div>
            <h1>My Stories</h1>
            <p>Create worlds. Share stories. Inspire readers.</p>
          </div>
          <Link className="creator-primary" href="/creator/stories/new">
            <PlusCircle aria-hidden="true" /> Create New Story
          </Link>
        </div>
        <nav className="creator-tabs" aria-label="Story states">
          {tabs.map((name) => (
            <Link
              key={name}
              href={`/creator/stories?tab=${name}`}
              className={active === name ? 'is-active' : undefined}
              aria-current={active === name ? 'page' : undefined}
            >
              {name}
              <span>
                {
                  {
                    Published: mine.published.length,
                    Drafts: mine.drafts.length,
                    Scheduled: mine.scheduled.length,
                  }[name]
                }
              </span>
            </Link>
          ))}
        </nav>
      </header>

      <main className="creator-main">
        <form
          role="search"
          action="/creator/stories"
          className="creator-search"
        >
          <input type="hidden" name="tab" value={active} />
          <label className="sr-only" htmlFor="story-filter">
            Search your stories
          </label>
          <input
            id="story-filter"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search stories…"
          />
          <button type="submit">Search</button>
        </form>

        {stories.length === 0 ? (
          <p className="creator-empty">
            {active === 'Published'
              ? 'Nothing published yet. Write a chapter and publish it when it is ready.'
              : active === 'Drafts'
                ? 'No drafts. Start a story and it will wait here until you publish it.'
                : 'Nothing scheduled.'}
          </p>
        ) : (
          <ul className="creator-stories">
            {stories.map((story) => (
              <li key={story.id}>
                <Link href={`/creator/stories/${story.id}`}>
                  <Image src={story.coverUrl} alt="" width={96} height={132} />
                  <span>
                    <strong>{story.title}</strong>
                    <small>
                      {story.genre} <i>•</i> {story.chapters}{' '}
                      {story.chapters === 1 ? 'chapter' : 'chapters'}
                    </small>
                    <span className="creator-synopsis">{story.synopsis}</span>
                    <span className="creator-stats">
                      <span>
                        <Eye aria-hidden="true" /> {story.reads} reads
                      </span>
                      <span>
                        <Heart aria-hidden="true" /> {story.likes} likes
                      </span>
                      <span>
                        <ChatCircle aria-hidden="true" /> {story.comments}{' '}
                        comments
                      </span>
                    </span>
                  </span>
                  <b className={`creator-status ${story.status.toLowerCase()}`}>
                    {story.status}
                  </b>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <nav className="creator-bottom-nav" aria-label="Creator navigation">
        <Link href="/creator/dashboard">
          <House />
          <span>Dashboard</span>
        </Link>
        <Link href="/creator/stories" aria-current="page">
          <PlusCircle weight="fill" />
          <span>My Stories</span>
        </Link>
        <Link href="/creator/analytics">
          <ChartLineUp />
          <span>Analytics</span>
        </Link>
        <Link href="/creator/dashboard">
          <UserCircle />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
