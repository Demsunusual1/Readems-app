import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  Compass,
  Feather,
  House,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import {
  getCurrentPrompt,
  getFeed,
  postTopics,
  type CommunityPost,
} from '@/lib/community';
import { getGroups } from '@/lib/groups';
import { getFeaturedRooms } from '@/lib/rooms';
import { prisma } from '@/lib/prisma';
import { CommunityFeed, Composer } from '@/components/community-feed';
import { Logo } from '@/components/ui/logo';
import { JoinGroupButton } from '@/components/join-group-button';
import '@/components/rooms.css';
import '@/components/community.css';

export const metadata: Metadata = {
  title: 'Community | Readems',
  description:
    'A global community for curious minds and original stories: posts, prompts, rooms and groups.',
};

const tabs = ['For You', 'Following', ...postTopics] as const;

function serialise(post: CommunityPost) {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    replies: post.replies.map((reply) => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
    })),
  };
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = tabs.includes((tab ?? 'For You') as (typeof tabs)[number])
    ? ((tab ?? 'For You') as (typeof tabs)[number])
    : 'For You';
  const user = await getCurrentUser();

  const [posts, prompt, groups, rooms, members] = await Promise.all([
    getFeed({
      viewerId: user?.id ?? null,
      following: active === 'Following',
      topic:
        active === 'For You' || active === 'Following' ? undefined : active,
    }),
    getCurrentPrompt(),
    getGroups({ viewerId: user?.id ?? null, take: 4 }),
    getFeaturedRooms({ viewerId: user?.id ?? null, take: 4 }),
    prisma.user.count(),
  ]);

  return (
    <div className="community-page">
      <header className="community-hero">
        <div className="community-hero-top">
          <Logo tone="light" />
          <Link href="/search" aria-label="Search Readems">
            Search
          </Link>
        </div>
        <h1>
          The world <em>reads.</em>
          <br />
          We <em>write</em> together.
        </h1>
        <p>A global community for curious minds and original stories.</p>
        <div className="community-count">
          <strong>{members.toLocaleString()}</strong>
          <span>{members === 1 ? 'member' : 'members'}</span>
        </div>
      </header>

      <nav className="community-tabs" aria-label="Community filters">
        {tabs.map((name) => (
          <Link
            key={name}
            href={name === 'For You' ? '/community' : `/community?tab=${name}`}
            aria-current={active === name ? 'page' : undefined}
            className={active === name ? 'is-active' : undefined}
          >
            {name}
          </Link>
        ))}
      </nav>

      <main className="community-main">
        <section className="community-feed-column">
          {user ? (
            <Composer groupId={null} topics={postTopics} />
          ) : (
            <p className="feed-signin">
              <Link href="/login">Sign in</Link> to post, reply and follow the
              conversation.
            </p>
          )}
          <h2 className="sr-only">Posts</h2>
          <CommunityFeed
            posts={posts.map(serialise)}
            signedIn={Boolean(user)}
            emptyMessage={
              active === 'Following'
                ? 'The people you follow have not posted yet.'
                : 'Nothing here yet. Be the first to post.'
            }
          />
        </section>

        <aside className="community-side">
          {prompt && (
            <section className="community-prompt">
              <p>Weekly prompt</p>
              <h2>{prompt.title}</h2>
              <p>{prompt.body}</p>
              {user ? (
                <Composer
                  groupId={null}
                  promptId={prompt.id}
                  promptTitle={prompt.title}
                  placeholder="Write your response…"
                />
              ) : (
                <Link href="/login">Sign in to answer</Link>
              )}
            </section>
          )}

          <section className="community-groups">
            <div>
              <h2>Rooms</h2>
              <Link href="/community/rooms">View all</Link>
            </div>
            {rooms.length === 0 ? (
              <p className="feed-empty">
                No rooms are open.{' '}
                <Link href="/community/rooms">Start one</Link>.
              </p>
            ) : (
              <ul>
                {rooms.map((room) => (
                  <li key={room.id}>
                    <Link href={`/community/rooms/${room.id}`}>
                      <strong>{room.title}</strong>
                      <small>
                        {room.people} {room.people === 1 ? 'person' : 'people'}{' '}
                        <i>•</i> {room.tagline}
                      </small>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="community-groups">
            <div>
              <h2>Groups</h2>
              <Link href="/groups">View all</Link>
            </div>
            {groups.length === 0 ? (
              <p className="feed-empty">No groups yet.</p>
            ) : (
              <ul>
                {groups.map((group) => (
                  <li key={group.id}>
                    <Link href={`/groups/${group.id}`}>
                      <strong>{group.name}</strong>
                      <small>
                        {group.members}{' '}
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
            )}
          </section>
        </aside>
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
        <Link href="/community" aria-current="page">
          <UsersThree weight="fill" />
          <span>Community</span>
        </Link>
        <Link href="/groups">
          <Feather />
          <span>Groups</span>
        </Link>
      </nav>
    </div>
  );
}
