import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CalendarBlank,
  UserCircle,
} from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getFeed, type CommunityPost } from '@/lib/community';
import { getGroup } from '@/lib/groups';
import { CommunityFeed, Composer } from '@/components/community-feed';
import { JoinGroupButton } from '@/components/join-group-button';
import { GroupEvents } from '@/components/group-events';
import '@/components/community.css';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = await getGroup(groupId, null);
  return {
    title: group ? `${group.name} | Readems` : 'Group not found | Readems',
    description: group?.tagline,
  };
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const user = await getCurrentUser();
  const group = await getGroup(groupId, user?.id ?? null);
  if (!group) notFound();
  const posts = await getFeed({ viewerId: user?.id ?? null, groupId });

  return (
    <div className="community-page group-page">
      <header className="community-hero">
        <div className="community-hero-top">
          <Link href="/groups" aria-label="Back to groups">
            <ArrowLeft />
          </Link>
        </div>
        <p className="group-topic">{group.topic}</p>
        <h1>{group.name}</h1>
        <p>{group.tagline}</p>
        <div className="group-hero-meta">
          <span>
            {group.members} {group.members === 1 ? 'member' : 'members'}
          </span>
          <span>{group.isPublic ? 'Public group' : 'Private group'}</span>
          <JoinGroupButton
            groupId={group.id}
            name={group.name}
            joined={group.isMember}
            signedIn={Boolean(user)}
          />
        </div>
      </header>

      <main className="community-main">
        <section className="community-feed-column">
          <h2>Latest from members</h2>
          {user && group.isMember ? (
            <Composer
              groupId={group.id}
              placeholder={`Share something with ${group.name}…`}
            />
          ) : (
            <p className="feed-signin">
              {user
                ? 'Join the group to post in it.'
                : 'Sign in and join the group to post in it.'}
            </p>
          )}
          <CommunityFeed
            posts={posts.map(serialise)}
            signedIn={Boolean(user)}
            groupId={group.id}
            emptyMessage="No posts in this group yet."
          />
        </section>

        <aside className="community-side">
          <section className="group-about">
            <h2>About</h2>
            <p>{group.description}</p>
          </section>

          <GroupEvents
            groupId={group.id}
            events={group.events.map((event) => ({
              ...event,
              startsAt: event.startsAt.toISOString(),
            }))}
            canSchedule={group.role === 'FOUNDER' || group.role === 'MODERATOR'}
            signedIn={Boolean(user)}
          />

          <section className="group-moderators">
            <h2>Moderators</h2>
            <ul>
              {group.moderators.map((moderator) => (
                <li key={moderator.username}>
                  <Link href={`/u/${moderator.username}`}>
                    {moderator.avatarUrl ? (
                      <Image
                        src={moderator.avatarUrl}
                        alt=""
                        width={36}
                        height={36}
                      />
                    ) : (
                      <UserCircle size={36} aria-hidden="true" />
                    )}
                    <span>
                      <strong>{moderator.name}</strong>
                      <small>{moderator.role}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>

      <nav className="community-bottom-nav" aria-label="Primary navigation">
        <Link href="/community">
          <CalendarBlank />
          <span>Community</span>
        </Link>
        <Link href="/groups" aria-current="page">
          <UserCircle />
          <span>Groups</span>
        </Link>
      </nav>
    </div>
  );
}
