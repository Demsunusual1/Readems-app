'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Bell,
  Books,
  ChatCircleDots,
  EnvelopeSimple,
  FunnelSimple,
  House,
  Medal,
  Plus,
  User,
  UserPlus,
  Wallet,
} from '@phosphor-icons/react';
import './notifications-page.css';

type Kind = 'All' | 'Reading' | 'Community' | 'Creator';

const items = [
  {
    title: 'New chapter published',
    copy: (
      <>
        A new chapter of <i>Shadows of the Drum</i> is now live.
      </>
    ),
    time: '10m',
    kind: 'Reading',
    icon: Books,
    tone: 'navy',
  },
  {
    title: 'New follower',
    copy: (
      <>
        <i>Isabella Morgan</i> started following you.
      </>
    ),
    time: '1h',
    kind: 'Creator',
    icon: UserPlus,
    tone: 'purple',
  },
  {
    title: 'New comment',
    copy: (
      <>
        Kwame Mensah commented on your chapter{' '}
        <i>“Letters to My Younger Self”</i>.
      </>
    ),
    time: '2h',
    kind: 'Community',
    icon: ChatCircleDots,
    tone: 'blue',
  },
  {
    title: 'Group invitation',
    copy: (
      <>
        You’ve been invited to join <i>Story Craft Collective.</i>
      </>
    ),
    time: '3h',
    kind: 'Community',
    icon: EnvelopeSimple,
    tone: 'purple',
  },
  {
    title: 'Reading milestone',
    copy: <>You’ve completed 10 books this month. Keep the momentum!</>,
    time: '5h',
    kind: 'Reading',
    icon: Medal,
    tone: 'gold',
  },
  {
    title: 'Earnings update',
    copy: (
      <>
        You earned <i>$128.40</i> from your stories in May.
      </>
    ),
    time: '6h',
    kind: 'Creator',
    icon: Wallet,
    tone: 'purple',
  },
] as const;

export function NotificationsPage({ role }: { role: string }) {
  const [kind, setKind] = useState<Kind>('All');
  const [read, setRead] = useState(false);
  const filtered = useMemo(
    () => (kind === 'All' ? items : items.filter((item) => item.kind === kind)),
    [kind],
  );
  const home = role === 'CREATOR' ? '/creator/dashboard' : '/reader/dashboard';

  return (
    <main className="notifications-page">
      <header className="notifications-top">
        <Link href={home}>
          <Image src="/readems/logo.png" alt="Readems" width={48} height={48} />
          <strong>Readems</strong>
        </Link>
        <button aria-label="Search notifications">
          <span />
        </button>
      </header>
      <section className="notifications-intro">
        <div className="notification-stars" />
        <div>
          <h1>Notifications</h1>
          <p>
            Stay updated with your stories
            <br />
            and community.
          </p>
        </div>
        <button aria-label="Filter notifications">
          <FunnelSimple />
        </button>
      </section>
      <nav className="notification-tabs" aria-label="Notification categories">
        {(['All', 'Reading', 'Community', 'Creator'] as Kind[]).map((tab) => (
          <button
            className={kind === tab ? 'active' : ''}
            key={tab}
            onClick={() => setKind(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      <section className="notification-feed">
        <header>
          <h2>Today</h2>
          <button onClick={() => setRead(true)}>Mark all read</button>
        </header>
        {filtered.map(({ title, copy, time, icon: Icon, tone }) => (
          <article className="notification-card" key={title}>
            <span className={`notification-icon ${tone}`}>
              <Icon />
            </span>
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
            <time>{time}</time>
            <b className={read ? 'read' : ''} />
          </article>
        ))}
        <h2 className="week-title">This week</h2>
        <article className="notification-card">
          <span className="notification-icon navy">♡</span>
          <div>
            <h3>New like</h3>
            <p>
              <i>Sofia Alvarez</i> liked your chapter{' '}
              <i>“Beneath the Baobab Tree”</i>.
            </p>
          </div>
          <time>2d</time>
          <b className="read" />
        </article>
      </section>
      <nav className="notifications-bottom" aria-label="Primary navigation">
        <Link href={home}>
          <House />
          <span>Home</span>
        </Link>
        <Link href="#library">
          <Books />
          <span>Library</span>
        </Link>
        <Link className="create" href="/creator/stories/new">
          <Plus />
        </Link>
        <Link className="active" href="/notifications">
          <Bell weight="fill" />
          <i />
          <span>Notifications</span>
        </Link>
        <Link href="#profile">
          <User />
          <span>Profile</span>
        </Link>
      </nav>
    </main>
  );
}
