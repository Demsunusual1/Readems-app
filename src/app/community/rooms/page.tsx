import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getRooms } from '@/lib/rooms';
import { RoomAvatar } from '@/components/room-avatar';
import { RoomCreate } from '@/components/room-create';
import '@/components/community.css';
import '@/components/rooms.css';

export const metadata: Metadata = {
  title: 'Live rooms | Readems',
  description:
    'Live rooms on Readems are written conversations: join one, read along and take part.',
};

export default async function RoomsPage() {
  const user = await getCurrentUser();
  const rooms = await getRooms({ viewerId: user?.id ?? null });

  return (
    <div className="community-page rooms-page">
      <header className="community-hero">
        <div className="community-hero-top">
          <Link href="/community" aria-label="Back to community">
            <ArrowLeft />
          </Link>
        </div>
        <p className="room-eyebrow">Live rooms</p>
        <h1>Rooms open right now</h1>
        <p>
          Readems rooms are written conversations, not voice. People type, and
          the room keeps up by checking for new messages every few seconds.
        </p>
      </header>

      <main className="community-main rooms-main">
        <section>
          <div className="room-section-head">
            <h2>
              {rooms.length === 1
                ? '1 room open'
                : `${rooms.length} rooms open`}
            </h2>
          </div>

          {rooms.length === 0 ? (
            <p className="room-empty">
              No rooms are open. Start one and see who comes.
            </p>
          ) : (
            <ul className="room-grid">
              {rooms.map((room) => (
                <li key={room.id}>
                  <Link href={`/community/rooms/${room.id}`}>
                    <span className="room-live">Live</span>
                    <strong>{room.title}</strong>
                    <span>{room.tagline}</span>
                  </Link>
                  <div className="room-card-foot">
                    <RoomAvatar
                      name={room.host.name}
                      url={room.host.avatarUrl}
                      size={32}
                    />
                    <small>
                      Hosted by {room.host.name} · {room.people}{' '}
                      {room.people === 1 ? 'person' : 'people'} ·{' '}
                      {room.messageCount}{' '}
                      {room.messageCount === 1 ? 'message' : 'messages'}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {user ? (
            <RoomCreate />
          ) : (
            <p className="feed-signin">
              <Link href="/login">Sign in</Link> to open a room of your own.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
