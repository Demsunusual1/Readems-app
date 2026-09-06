'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Compass,
  FunnelSimple,
  House,
  MagnifyingGlass,
  NotePencil,
  PencilSimple,
  User,
  UsersThree,
} from '@phosphor-icons/react';
import './messages-page.css';

type Tab = 'Inbox' | 'Groups' | 'Creators' | 'Requests';

const conversations = [
  [
    'Nia Okafor',
    'Loved your latest chapter — the imagery is stunning.',
    '11:24 AM',
    '2',
    'zara',
  ],
  [
    'Daniel Mensah',
    'Thanks for the feedback on my draft.',
    '10:08 AM',
    '1',
    'daniel',
  ],
  [
    'Writers’ Lounge',
    'Sofia: Just dropped a new writing prompt!',
    '9:41 AM',
    '3',
    'group',
  ],
  [
    'Isabella Romano',
    'Let’s collaborate on that anthology idea.',
    'Yesterday',
    '',
    'zara',
  ],
  [
    'Readems Team',
    'Welcome to Readems! Explore, connect, and grow.',
    'Yesterday',
    '•',
    'daniel',
  ],
  ['Poetry Circle', 'Kwame: Shared a new poem.', 'Tue', '1', 'group'],
  ['Jules Moreau', 'Your story moved me. Thank you.', 'Mon', '', 'daniel'],
  ['Creative Sparks', 'Amara: New resource pinned.', 'Mon', '2', 'zara'],
] as const;

const activeReaders = [
  ['Amara J.', 'zara'],
  ['Kwame A.', 'daniel'],
  ['Sofia M.', 'zara'],
  ['Liam T.', 'daniel'],
] as const;

export function MessagesPage({ role }: { role: string }) {
  const [tab, setTab] = useState<Tab>('Inbox');
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () =>
      conversations.filter(([name, copy]) =>
        `${name} ${copy}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const home = role === 'CREATOR' ? '/creator/dashboard' : '/reader/dashboard';
  const write =
    role === 'READER' ? '/signup?role=creator' : '/creator/stories/new';

  return (
    <main className="messages-page">
      <header className="messages-hero">
        <div className="messages-stars" />
        <div>
          <h1>Messages</h1>
          <p>Connect. Create. Be Read.</p>
        </div>
        <Image src="/readems/logo.png" alt="Readems" width={88} height={88} />
      </header>

      <section className="messages-sheet">
        <label className="message-search">
          <MagnifyingGlass />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search messages or people"
          />
          <FunnelSimple />
        </label>

        <section className="active-readers">
          <header>
            <h2>Active readers</h2>
            <button>See all</button>
          </header>
          <div>
            {activeReaders.map(([name, avatar]) => (
              <button key={name}>
                <Avatar kind={avatar} />
                <span>{name}</span>
                <i />
              </button>
            ))}
            <button>
              <b>
                <UsersThree />
              </b>
              <span>Find readers</span>
            </button>
          </div>
        </section>

        <nav className="message-tabs" aria-label="Message categories">
          {(['Inbox', 'Groups', 'Creators', 'Requests'] as Tab[]).map(
            (name) => (
              <button
                key={name}
                className={tab === name ? 'active' : ''}
                onClick={() => setTab(name)}
              >
                {name}
                {name !== 'Requests' && (
                  <small>
                    {name === 'Inbox' ? 8 : name === 'Groups' ? 3 : 1}
                  </small>
                )}
              </button>
            ),
          )}
        </nav>

        <section
          className="conversation-list"
          aria-label={`${tab} conversations`}
        >
          {filtered.map(([name, copy, time, count, avatar]) => (
            <button className="conversation" key={name}>
              <i className={count ? 'unread' : ''} />
              <Avatar kind={avatar} />
              <span>
                <strong>{name}</strong>
                <small>{copy}</small>
              </span>
              <time>{time}</time>
              {count && <em>{count}</em>}
            </button>
          ))}
        </section>
      </section>

      <button className="compose-message" aria-label="Compose message">
        <PencilSimple />
      </button>
      <nav className="messages-bottom" aria-label="Primary navigation">
        <Link href={home}>
          <House />
          <span>Home</span>
        </Link>
        <Link href="/discover">
          <Compass />
          <span>Discover</span>
        </Link>
        <Link href={write}>
          <NotePencil />
          <span>Write</span>
        </Link>
        <Link className="active" href="/messages">
          <b>12</b>
          <NotePencil />
          <span>Messages</span>
        </Link>
        <Link href="/profile-settings">
          <User />
          <span>Profile</span>
        </Link>
      </nav>
    </main>
  );
}

function Avatar({ kind }: { kind: 'zara' | 'daniel' | 'group' }) {
  if (kind === 'group')
    return (
      <span className="message-avatar group">
        <UsersThree />
      </span>
    );
  return (
    <Image
      className="message-avatar"
      src={`/readems/community-${kind}.png`}
      alt=""
      width={70}
      height={70}
    />
  );
}
