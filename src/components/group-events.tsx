'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarBlank } from '@phosphor-icons/react';
import { respondToEvent, scheduleEvent } from '@/app/groups/actions';

export type EventView = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  going: number;
  attending: boolean;
};

const when = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
});

export function GroupEvents({
  groupId,
  events,
  canSchedule,
  signedIn,
}: {
  groupId: string;
  events: EventView[];
  canSchedule: boolean;
  signedIn: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [state, submit] = useActionState(
    scheduleEvent.bind(null, groupId),
    null,
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
    // Refreshing once, when an event has actually been scheduled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // A scheduled event closes the form without another render pass.
  const formOpen = showForm && !state?.ok;

  return (
    <section className="group-events">
      <div>
        <h2>Events</h2>
        {canSchedule && (
          <button
            type="button"
            onClick={() => setShowForm(!formOpen)}
            aria-expanded={formOpen}
          >
            Schedule
          </button>
        )}
      </div>

      {formOpen && (
        <form action={submit}>
          <label htmlFor="event-title">Title</label>
          <input id="event-title" name="title" required maxLength={100} />
          <label htmlFor="event-description">Description</label>
          <textarea
            id="event-description"
            name="description"
            rows={2}
            maxLength={400}
          />
          <label htmlFor="event-starts">Starts</label>
          <input
            id="event-starts"
            name="startsAt"
            type="datetime-local"
            required
          />
          <button type="submit">Schedule event</button>
          {state?.message && !state.ok && <p role="alert">{state.message}</p>}
        </form>
      )}

      {events.length === 0 ? (
        <p className="feed-empty">Nothing planned yet.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <CalendarBlank aria-hidden="true" />
              <div>
                <strong>{event.title}</strong>
                <small>{when.format(new Date(event.startsAt))}</small>
                {event.description && <p>{event.description}</p>}
                <small>
                  {event.going} {event.going === 1 ? 'person' : 'people'} going
                </small>
              </div>
              <button
                type="button"
                aria-pressed={event.attending}
                disabled={!signedIn || pending}
                onClick={() =>
                  startTransition(async () => {
                    await respondToEvent(event.id, groupId);
                    router.refresh();
                  })
                }
              >
                {event.attending ? 'Going' : 'RSVP'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
