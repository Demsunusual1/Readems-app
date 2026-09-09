import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BookOpen,
  ChatCircle,
  Compass,
  House,
  MagnifyingGlass,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import {
  getConversations,
  searchPeopleToMessage,
  type ConversationSummary,
} from '@/lib/messages';
import { relativeTime } from '@/lib/time';
import { MessagesAvatar } from '@/components/messages-avatar';
import { StartConversationButton } from '@/components/messages-start';
import { Logo } from '@/components/ui/logo';
import '@/components/community.css';
import '@/components/messages.css';

export const metadata: Metadata = {
  title: 'Messages | Readems',
  description: 'Connect. Create. Be Read.',
};

const tabs = ['Inbox', 'Groups'] as const;
type Tab = (typeof tabs)[number];

/** The one line of a conversation the inbox shows under the name. */
function preview(conversation: ConversationSummary) {
  const last = conversation.lastMessage;
  if (!last) return 'No messages yet. Say hello.';
  if (last.mine) return `You: ${last.body}`;
  return conversation.isGroup ? `${last.senderName}: ${last.body}` : last.body;
}

function matches(conversation: ConversationSummary, term: string) {
  const haystack = [
    conversation.title,
    conversation.otherPerson?.username ?? '',
    conversation.lastMessage?.body ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(term.toLowerCase());
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const { q, tab } = await searchParams;
  const term = (q ?? '').trim();
  const active: Tab = tabs.includes(tab as Tab) ? (tab as Tab) : 'Inbox';

  const [conversations, people] = await Promise.all([
    getConversations(user.id),
    searchPeopleToMessage(user.id, term),
  ]);

  const counts = {
    Inbox: conversations
      .filter((item) => !item.isGroup)
      .reduce((total, item) => total + item.unread, 0),
    Groups: conversations
      .filter((item) => item.isGroup)
      .reduce((total, item) => total + item.unread, 0),
  };
  const shown = conversations
    .filter((item) => (active === 'Groups' ? item.isGroup : !item.isGroup))
    .filter((item) => !term || matches(item, term));

  return (
    <div className="messages-page">
      <header className="messages-hero">
        <div className="messages-hero-top">
          <Logo tone="light" />
        </div>
        <h1>Messages</h1>
        <p>Connect. Create. Be Read.</p>
        <form className="messages-search" role="search" action="/messages">
          <label className="sr-only" htmlFor="messages-search">
            Search messages or people
          </label>
          <MagnifyingGlass aria-hidden="true" />
          <input
            id="messages-search"
            name="q"
            defaultValue={term}
            placeholder="Search messages or people"
          />
          <button type="submit">Search</button>
        </form>
      </header>

      <nav className="messages-tabs" aria-label="Message types">
        {tabs.map((name) => (
          <Link
            key={name}
            href={
              name === 'Inbox'
                ? `/messages${term ? `?q=${encodeURIComponent(term)}` : ''}`
                : `/messages?tab=${name}${term ? `&q=${encodeURIComponent(term)}` : ''}`
            }
            className={active === name ? 'is-active' : undefined}
            aria-current={active === name ? 'page' : undefined}
          >
            {name}
            {counts[name] > 0 && (
              <span className="messages-tab-count">
                {counts[name]}
                <span className="sr-only"> unread</span>
              </span>
            )}
          </Link>
        ))}
      </nav>

      <main className="messages-main">
        {term && (
          <section className="messages-people" aria-labelledby="people-heading">
            <h2 id="people-heading">Start a conversation</h2>
            {people.length === 0 ? (
              <p className="messages-empty">
                Nobody here goes by “{term}”. Try a username instead.
              </p>
            ) : (
              <ul>
                {people.map((person) => (
                  <li key={person.id}>
                    <MessagesAvatar
                      name={person.name}
                      avatarUrl={person.avatarUrl}
                      size={44}
                    />
                    <span>
                      <strong>{person.name}</strong>
                      <small>@{person.username}</small>
                    </span>
                    <StartConversationButton
                      personId={person.id}
                      name={person.name}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <h2 className="sr-only">Conversations</h2>
        {shown.length === 0 ? (
          <p className="messages-empty">
            {term
              ? `No conversations match “${term}”.`
              : active === 'Groups'
                ? 'You are not in a group conversation yet.'
                : 'No conversations yet. Search for somebody above to start one.'}
          </p>
        ) : (
          <ul className="messages-list">
            {shown.map((conversation) => (
              <li
                key={conversation.id}
                className={conversation.unread > 0 ? 'is-unread' : undefined}
              >
                <Link href={`/messages/${conversation.id}`}>
                  <span className="messages-unread-dot" aria-hidden="true" />
                  <MessagesAvatar
                    name={conversation.title}
                    avatarUrl={conversation.otherPerson?.avatarUrl}
                    isGroup={conversation.isGroup}
                  />
                  <span className="messages-line">
                    <strong>{conversation.title}</strong>
                    <span>{preview(conversation)}</span>
                  </span>
                  <span className="messages-meta">
                    <small>{relativeTime(conversation.updatedAt)}</small>
                    {conversation.unread > 0 && (
                      <span className="messages-badge">
                        {conversation.unread}
                        <span className="sr-only"> unread messages</span>
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
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
        <Link href="/messages" aria-current="page">
          <ChatCircle />
          <span>Messages</span>
        </Link>
      </nav>
    </div>
  );
}
