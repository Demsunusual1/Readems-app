import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { getRoom, type RoomPerson } from '@/lib/rooms';
import { RoomAvatar } from '@/components/room-avatar';
import { RoomDiscussion } from '@/components/room-discussion';
import {
  RoomCloseButton,
  RoomHandButton,
  RoomJoinButton,
  RoomReactions,
  RoomStageButton,
} from '@/components/room-controls';
import '@/components/community.css';
import '@/components/rooms.css';

const rules = [
  'Be respectful',
  'One thought at a time',
  'No hate speech',
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = await getRoom(roomId, null);
  return {
    title: room ? `${room.title} | Readems` : 'Room not found | Readems',
    description: room?.tagline,
  };
}

function People({
  people,
  roomId,
  isHost,
  emptyMessage,
}: {
  people: RoomPerson[];
  roomId: string;
  isHost: boolean;
  emptyMessage: string;
}) {
  if (people.length === 0) return <p className="room-empty">{emptyMessage}</p>;
  return (
    <ul className="room-people">
      {people.map((person) => (
        <li key={person.id}>
          <Link href={`/u/${person.username}`}>
            <RoomAvatar name={person.name} url={person.avatarUrl} size={56} />
            <strong>{person.name}</strong>
          </Link>
          {person.handRaised && (
            <small className="room-hand-raised">Hand raised</small>
          )}
          {isHost && (
            <RoomStageButton
              roomId={roomId}
              userId={person.id}
              name={person.name}
              onStage={person.onStage}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const user = await getCurrentUser();
  const room = await getRoom(roomId, user?.id ?? null);
  if (!room) notFound();

  return (
    <div className="community-page room-page">
      <header className="community-hero room-hero">
        <div className="community-hero-top">
          <Link href="/community/rooms" aria-label="Back to rooms">
            <ArrowLeft />
          </Link>
        </div>
        <p className="room-eyebrow">
          {room.isLive ? 'Live room' : 'Closed room'}
        </p>
        <h1>{room.title}</h1>
        <p>{room.tagline}</p>
        <div className="room-hero-meta">
          {room.isLive && <span className="room-live">Live</span>}
          <span>
            {room.people} {room.people === 1 ? 'person' : 'people'} in the room
          </span>
          <span>Written room</span>
        </div>
        <p className="room-honesty">
          No microphones here: a Readems room is a written conversation.
          Everyone types, and the discussion below refreshes on a poll while the
          tab is open.
        </p>
      </header>

      <main className="community-main rooms-main">
        <section className="room-column">
          <article className="room-host-card">
            <RoomAvatar
              name={room.host.name}
              url={room.host.avatarUrl}
              size={72}
            />
            <div>
              <p className="room-pill">Host</p>
              <h2>
                <Link href={`/u/${room.host.username}`}>{room.host.name}</Link>
              </h2>
              {room.hostBio && <p>{room.hostBio}</p>}
              <p className="room-description">{room.description}</p>
            </div>
          </article>

          <section className="room-panel">
            <div className="room-section-head">
              <h2>On stage ({room.onStage.length})</h2>
            </div>
            <People
              people={room.onStage}
              roomId={room.id}
              isHost={room.isHost}
              emptyMessage="Nobody is on stage."
            />
          </section>

          <section className="room-panel">
            <div className="room-section-head">
              <h2>In the room ({room.inRoom.length})</h2>
              {room.isLive && room.isParticipant && (
                <RoomHandButton
                  roomId={room.id}
                  handRaised={room.handRaised}
                  joined={room.isParticipant}
                />
              )}
            </div>
            <People
              people={room.inRoom}
              roomId={room.id}
              isHost={room.isHost}
              emptyMessage="Everyone here is on stage."
            />
          </section>

          <section className="room-panel">
            <h2 className="sr-only">Reactions</h2>
            <RoomReactions
              roomId={room.id}
              counts={room.reactions}
              mine={room.myReactions}
              signedIn={Boolean(user)}
            />
          </section>

          <RoomDiscussion
            roomId={room.id}
            initialMessages={room.messages.map((message) => ({
              ...message,
              createdAt: message.createdAt.toISOString(),
            }))}
            canPost={room.isParticipant}
            signedIn={Boolean(user)}
            isLive={room.isLive}
          />

          <section className="room-rules">
            <ShieldCheck aria-hidden="true" />
            <div>
              <h2>Room rules</h2>
              <ul>
                {rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </section>
        </section>
      </main>

      <div className="room-bar">
        <p>
          {room.isHost
            ? 'You are hosting. Close the room when the conversation is done.'
            : room.isParticipant
              ? 'You are in the room. Write below to take part.'
              : 'You are reading along. Join the room to write in it.'}
        </p>
        <div>
          {room.isLive && (
            <RoomJoinButton
              roomId={room.id}
              title={room.title}
              joined={room.isParticipant}
              signedIn={Boolean(user)}
              isHost={room.isHost}
            />
          )}
          {room.isLive && room.isHost && <RoomCloseButton roomId={room.id} />}
        </div>
      </div>
    </div>
  );
}
