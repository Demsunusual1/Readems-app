'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { HandsClapping, Hand, Heart, Star } from '@phosphor-icons/react';
import {
  endRoom,
  moveOnStage,
  reactInRoom,
  toggleHand,
  toggleRoomMembership,
} from '@/app/community/rooms/actions';
import type { RoomReactionKind } from '@/lib/rooms';

// The kinds are listed here rather than imported from the rooms module: that
// module reaches for Prisma, which has no business in a browser bundle. The
// records below are keyed by the kind, so adding one there fails the build
// here until it is drawn.
const reactionLabels: Record<RoomReactionKind, string> = {
  heart: 'Love this',
  clap: 'Applaud',
  star: 'Mark as memorable',
};

const reactionIcons: Record<RoomReactionKind, typeof Heart> = {
  heart: Heart,
  clap: HandsClapping,
  star: Star,
};

const reactionKinds = Object.keys(reactionLabels) as RoomReactionKind[];

export function RoomJoinButton({
  roomId,
  title,
  joined,
  signedIn,
  isHost,
}: {
  roomId: string;
  title: string;
  joined: boolean;
  signedIn: boolean;
  isHost: boolean;
}) {
  const [isJoined, setIsJoined] = useState(joined);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (isHost)
    return <span className="room-host-note">You are hosting this room.</span>;

  return (
    <span className="join-control">
      <button
        type="button"
        className="room-button"
        aria-pressed={isJoined}
        aria-label={isJoined ? `Leave ${title}` : `Join ${title}`}
        disabled={pending}
        onClick={() => {
          if (!signedIn) {
            setMessage('Sign in to join rooms.');
            return;
          }
          startTransition(async () => {
            const result = await toggleRoomMembership(roomId, isJoined);
            if (result.ok) {
              setIsJoined(Boolean(result.joined));
              router.refresh();
            } else setMessage(result.message ?? 'That did not work.');
          });
        }}
      >
        {isJoined ? 'Leave room' : 'Join room'}
      </button>
      {message && (
        <small role="status" className="join-message">
          {message}
        </small>
      )}
    </span>
  );
}

export function RoomHandButton({
  roomId,
  handRaised,
  joined,
}: {
  roomId: string;
  handRaised: boolean;
  joined: boolean;
}) {
  const [raised, setRaised] = useState(handRaised);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <span className="join-control">
      <button
        type="button"
        className="room-button room-hand"
        aria-pressed={raised}
        disabled={!joined || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await toggleHand(roomId);
            if (result.ok) {
              setRaised(Boolean(result.handRaised));
              router.refresh();
            } else setMessage(result.message ?? 'That did not work.');
          })
        }
      >
        <Hand aria-hidden="true" />
        {raised ? 'Hand raised' : 'Raise hand'}
      </button>
      {message && (
        <small role="status" className="join-message">
          {message}
        </small>
      )}
    </span>
  );
}

export function RoomReactions({
  roomId,
  counts,
  mine,
  signedIn,
}: {
  roomId: string;
  counts: Record<RoomReactionKind, number>;
  mine: RoomReactionKind[];
  signedIn: boolean;
}) {
  const [tally, setTally] = useState(counts);
  const [chosen, setChosen] = useState(mine);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="room-reactions">
      {reactionKinds.map((kind) => {
        const Icon = reactionIcons[kind];
        const pressed = chosen.includes(kind);
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={pressed}
            aria-label={`${reactionLabels[kind]} (${tally[kind]})`}
            disabled={pending}
            onClick={() => {
              if (!signedIn) {
                setMessage('Sign in to react.');
                return;
              }
              startTransition(async () => {
                const result = await reactInRoom(roomId, kind);
                if (!result.ok) {
                  setMessage(result.message ?? 'That did not work.');
                  return;
                }
                const reacted = Boolean(result.reacted);
                setChosen((current) =>
                  reacted
                    ? [...current, kind]
                    : current.filter((item) => item !== kind),
                );
                setTally((current) => ({
                  ...current,
                  [kind]: current[kind] + (reacted ? 1 : -1),
                }));
                router.refresh();
              });
            }}
          >
            <Icon weight={pressed ? 'fill' : 'regular'} aria-hidden="true" />
            <span>{tally[kind]}</span>
          </button>
        );
      })}
      {message && (
        <small role="status" className="join-message">
          {message}
        </small>
      )}
    </div>
  );
}

export function RoomStageButton({
  roomId,
  userId,
  name,
  onStage,
}: {
  roomId: string;
  userId: string;
  name: string;
  onStage: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      className="room-stage-button"
      disabled={pending}
      aria-label={onStage ? `Take ${name} off stage` : `Bring ${name} on stage`}
      onClick={() =>
        startTransition(async () => {
          await moveOnStage(roomId, userId, !onStage);
          router.refresh();
        })
      }
    >
      {onStage ? 'Take off stage' : 'Bring on stage'}
    </button>
  );
}

export function RoomCloseButton({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <span className="join-control">
      <button
        type="button"
        className="room-button room-close"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await endRoom(roomId);
            if (result.ok) router.refresh();
            else setMessage(result.message ?? 'That did not work.');
          })
        }
      >
        Close room
      </button>
      {message && (
        <small role="status" className="join-message">
          {message}
        </small>
      )}
    </span>
  );
}
