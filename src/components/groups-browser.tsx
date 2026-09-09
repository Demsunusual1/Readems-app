'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from '@phosphor-icons/react';
import type { GroupSummary } from '@/lib/groups';
import { startGroup } from '@/app/groups/actions';
import { JoinGroupButton } from './join-group-button';

export const groupTopics = [
  'Writing',
  'Genres',
  'Craft',
  'Community',
  'Culture',
] as const;

export function GroupsBrowser({
  groups,
  signedIn,
  joinedView,
  topic,
  query,
}: {
  groups: GroupSummary[];
  signedIn: boolean;
  joinedView: boolean;
  topic: string;
  query: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [state, submit] = useActionState(startGroup, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && state.groupId) router.push(`/groups/${state.groupId}`);
    // Navigating once, when a group has actually been created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const link = (next: Record<string, string>) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (topic) params.set('topic', topic);
    if (joinedView) params.set('view', 'joined');
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const search = params.toString();
    return search ? `/groups?${search}` : '/groups';
  };

  return (
    <>
      <nav className="community-tabs" aria-label="Group views">
        {signedIn && (
          <Link
            href={joinedView ? link({ view: '' }) : link({ view: 'joined' })}
            className={joinedView ? 'is-active' : undefined}
            aria-current={joinedView ? 'page' : undefined}
          >
            Joined
          </Link>
        )}
        <Link
          href={link({ view: '' })}
          className={!joinedView ? 'is-active' : undefined}
          aria-current={!joinedView ? 'page' : undefined}
        >
          Discover
        </Link>
      </nav>

      <div className="group-topics">
        <Link
          href={link({ topic: '' })}
          className={topic ? undefined : 'is-active'}
        >
          All
        </Link>
        {groupTopics.map((name) => (
          <Link
            key={name}
            href={link({ topic: name })}
            className={topic === name ? 'is-active' : undefined}
          >
            {name}
          </Link>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="feed-empty">
          {joinedView
            ? 'You have not joined a group yet.'
            : 'No groups match that yet. Start one below.'}
        </p>
      ) : (
        <ul className="group-grid">
          {groups.map((group) => (
            <li key={group.id}>
              <Link href={`/groups/${group.id}`}>
                <strong>{group.name}</strong>
                <span>{group.tagline}</span>
                <small>
                  {group.members} {group.members === 1 ? 'member' : 'members'}{' '}
                  <i>•</i> {group.topic}
                </small>
              </Link>
              <JoinGroupButton
                groupId={group.id}
                name={group.name}
                joined={group.isMember}
                signedIn={signedIn}
              />
            </li>
          ))}
        </ul>
      )}

      {signedIn ? (
        <section className="group-create">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            aria-expanded={showForm}
          >
            <Plus /> Create a Group
          </button>
          <p>Build your community and grow together.</p>
          {showForm && (
            <form action={submit}>
              <label htmlFor="group-name">Name</label>
              <input id="group-name" name="name" required maxLength={60} />
              <label htmlFor="group-tagline">One line about it</label>
              <input
                id="group-tagline"
                name="tagline"
                required
                maxLength={120}
              />
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                name="description"
                rows={3}
                maxLength={600}
              />
              <label htmlFor="group-topic">Topic</label>
              <select id="group-topic" name="topic" defaultValue="Community">
                {groupTopics.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <button type="submit">Create group</button>
              {state?.message && !state.ok && (
                <p role="alert">{state.message}</p>
              )}
            </form>
          )}
        </section>
      ) : (
        <p className="feed-signin">
          <Link href="/login">Sign in</Link> to join or start a group.
        </p>
      )}
    </>
  );
}
