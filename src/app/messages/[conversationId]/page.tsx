import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getConversation, markConversationRead } from '@/lib/messages';
import { relativeTime } from '@/lib/time';
import { MessagesAvatar } from '@/components/messages-avatar';
import { MessageComposer } from '@/components/messages-composer';
import '@/components/messages.css';

export const metadata: Metadata = {
  title: 'Conversation | Readems',
  description: 'Your messages on Readems.',
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const { conversationId } = await params;

  const thread = await getConversation(conversationId, user.id);
  if (!thread) notFound();
  // Opening the thread is what reading it means.
  await markConversationRead(user.id, conversationId);

  const others = thread.participants.filter((person) => person.id !== user.id);

  return (
    <div className="messages-page messages-thread-page">
      <header className="messages-thread-header">
        <Link
          href="/messages"
          className="messages-back"
          aria-label="Back to messages"
        >
          <ArrowLeft aria-hidden="true" />
        </Link>
        <MessagesAvatar
          name={thread.title}
          avatarUrl={thread.otherPerson?.avatarUrl}
          isGroup={thread.isGroup}
          size={46}
        />
        <span className="messages-thread-title">
          <strong>{thread.title}</strong>
          <small>
            {others.map((person, index) => (
              <span key={person.id}>
                {index > 0 && ', '}
                <Link href={`/u/${person.username}`}>@{person.username}</Link>
              </span>
            ))}
          </small>
        </span>
      </header>

      <main className="messages-thread">
        <h1 className="sr-only">Conversation with {thread.title}</h1>
        {thread.messages.length === 0 ? (
          <p className="messages-empty">
            Nothing said yet. Yours would be the first message.
          </p>
        ) : (
          <ol className="messages-bubbles">
            {thread.messages.map((message) => (
              <li
                key={message.id}
                className={message.mine ? 'is-mine' : undefined}
              >
                <p className="messages-bubble-meta">
                  <strong>{message.mine ? 'You' : message.sender.name}</strong>
                  <small>{relativeTime(message.createdAt)}</small>
                </p>
                <p className="messages-bubble">{message.body}</p>
              </li>
            ))}
          </ol>
        )}
      </main>

      <MessageComposer conversationId={thread.id} title={thread.title} />
    </div>
  );
}
