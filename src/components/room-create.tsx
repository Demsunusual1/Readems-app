'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from '@phosphor-icons/react';
import { startRoom } from '@/app/community/rooms/actions';

export function RoomCreate() {
  const [showForm, setShowForm] = useState(false);
  const [state, submit] = useActionState(startRoom, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && state.roomId)
      router.push(`/community/rooms/${state.roomId}`);
    // Navigating once, when a room has actually been opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <section className="room-create">
      <button
        type="button"
        className="room-button"
        aria-expanded={showForm}
        onClick={() => setShowForm(!showForm)}
      >
        <Plus aria-hidden="true" />
        Start a room
      </button>

      {showForm && (
        <form action={submit}>
          <label htmlFor="room-title">Title</label>
          <input id="room-title" name="title" required maxLength={70} />
          <label htmlFor="room-tagline">One line about it</label>
          <input id="room-tagline" name="tagline" required maxLength={120} />
          <label htmlFor="room-description">Description</label>
          <textarea
            id="room-description"
            name="description"
            rows={3}
            maxLength={600}
          />
          <button type="submit">Open the room</button>
          {state?.message && !state.ok && <p role="alert">{state.message}</p>}
        </form>
      )}
    </section>
  );
}
