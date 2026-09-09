'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import { relativeTime } from '@/lib/time';
import { sendRoomMessage } from '@/app/community/rooms/actions';
import { RoomAvatar } from './room-avatar';

export type RoomMessageItem = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
};

const POLL_SECONDS = 5;

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

const isVisible = () => !document.hidden;
// Rendered on the server as if the tab were open; the first client read
// corrects it if it is not.
const always = () => true;

export function RoomDiscussion({
  roomId,
  initialMessages,
  canPost,
  signedIn,
  isLive,
}: {
  roomId: string;
  initialMessages: RoomMessageItem[];
  canPost: boolean;
  signedIn: boolean;
  isLive: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  // Nobody is reading a hidden tab, so it does not get to keep asking.
  const visible = useSyncExternalStore(
    subscribeToVisibility,
    isVisible,
    always,
  );
  const [state, submit] = useActionState(
    sendRoomMessage.bind(null, roomId),
    null,
  );
  const form = useRef<HTMLFormElement>(null);
  // The timestamp the next poll asks from, kept in a ref so the interval
  // always reads the current one rather than the one it closed over.
  const since = useRef(initialMessages.at(-1)?.createdAt ?? null);

  const poll = useCallback(async () => {
    const query = since.current
      ? `?since=${encodeURIComponent(since.current)}`
      : '';
    try {
      const response = await fetch(
        `/community/rooms/${roomId}/messages${query}`,
        { cache: 'no-store' },
      );
      if (!response.ok) return;
      const data = (await response.json()) as { messages: RoomMessageItem[] };
      const newest = data.messages.at(-1);
      if (!newest) return;
      since.current = newest.createdAt;
      setMessages((current) => {
        const seen = new Set(current.map((message) => message.id));
        const added = data.messages.filter((message) => !seen.has(message.id));
        return added.length ? [...current, ...added] : current;
      });
    } catch {
      // A poll that fails is not worth an error on screen; the next one may
      // work, and the messages already on the page are still true.
    }
  }, [roomId]);

  useEffect(() => {
    if (!isLive || !visible) return;
    void poll();
    const timer = setInterval(poll, POLL_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [isLive, visible, poll]);

  useEffect(() => {
    if (!state?.ok) return;
    form.current?.reset();
    void poll();
    // Only a message that actually posted is worth fetching for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <section className="room-discussion">
      <div className="room-section-head">
        <h2>Live discussion</h2>
        <p className="room-poll-status" role="status">
          {isLive
            ? visible
              ? `Checking for new messages every ${POLL_SECONDS} seconds`
              : 'Paused while this tab is in the background'
            : 'This room has closed'}
        </p>
      </div>

      {messages.length === 0 ? (
        <p className="room-empty">Nothing said yet. Open the conversation.</p>
      ) : (
        <ul className="room-messages">
          {messages.map((message) => (
            <li key={message.id}>
              <RoomAvatar
                name={message.author.name}
                url={message.author.avatarUrl}
                size={36}
              />
              <div>
                <p className="room-message-head">
                  <Link href={`/u/${message.author.username}`}>
                    {message.author.name}
                  </Link>
                  <small>{relativeTime(new Date(message.createdAt))}</small>
                </p>
                <p className="room-message-body">{message.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isLive && canPost && (
        <form action={submit} ref={form} className="room-composer">
          <label className="sr-only" htmlFor={`room-message-${roomId}`}>
            Share your thoughts
          </label>
          <input
            id={`room-message-${roomId}`}
            name="body"
            maxLength={500}
            required
            autoComplete="off"
            placeholder="Share your thoughts…"
          />
          <button type="submit">Send</button>
          {state?.message && !state.ok && <p role="alert">{state.message}</p>}
        </form>
      )}

      {isLive && !canPost && (
        <p className="room-empty">
          {signedIn ? (
            'Join the room to write in it.'
          ) : (
            <>
              <Link href="/login">Sign in</Link> and join the room to write in
              it.
            </>
          )}
        </p>
      )}
    </section>
  );
}
