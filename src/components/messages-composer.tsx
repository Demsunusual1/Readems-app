'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { postMessage } from '@/app/messages/actions';

export function MessageComposer({
  conversationId,
  title,
}: {
  conversationId: string;
  title: string;
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [state, submit] = useActionState(
    postMessage.bind(null, conversationId),
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      form.current?.reset();
      router.refresh();
    }
    // A sent message is the only thing worth refreshing for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={form} action={submit} className="messages-composer">
      <label className="sr-only" htmlFor={`message-${conversationId}`}>
        Message {title}
      </label>
      <textarea
        id={`message-${conversationId}`}
        name="body"
        rows={2}
        required
        maxLength={2000}
        placeholder="Write a message…"
      />
      <button type="submit" aria-label={`Send message to ${title}`}>
        <PaperPlaneRight weight="fill" aria-hidden="true" />
      </button>
      {state?.message && (
        <p role="alert" className="messages-error">
          {state.message}
        </p>
      )}
    </form>
  );
}
