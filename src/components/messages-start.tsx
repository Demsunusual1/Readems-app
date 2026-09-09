'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { openConversation } from '@/app/messages/actions';

export function StartConversationButton({
  personId,
  name,
}: {
  personId: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  return (
    <span className="messages-start">
      <button
        type="button"
        aria-label={`Message ${name}`}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await openConversation(personId);
            if (result.ok && result.conversationId)
              router.push(`/messages/${result.conversationId}`);
            else setMessage(result.message ?? 'That did not work.');
          })
        }
      >
        Message
      </button>
      {message && (
        <small role="status" className="messages-error">
          {message}
        </small>
      )}
    </span>
  );
}
