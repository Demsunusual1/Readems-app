'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleMembership } from '@/app/groups/actions';

export function JoinGroupButton({
  groupId,
  name,
  joined,
  signedIn,
}: {
  groupId: string;
  name: string;
  joined: boolean;
  signedIn: boolean;
}) {
  const [isJoined, setIsJoined] = useState(joined);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <span className="join-control">
      <button
        type="button"
        className="join-button"
        aria-pressed={isJoined}
        aria-label={isJoined ? `Leave ${name}` : `Join ${name}`}
        disabled={pending}
        onClick={() => {
          if (!signedIn) {
            setMessage('Sign in to join groups.');
            return;
          }
          startTransition(async () => {
            const result = await toggleMembership(groupId, isJoined);
            if (result.ok) {
              setIsJoined(Boolean(result.joined));
              router.refresh();
            } else setMessage(result.message ?? 'That did not work.');
          });
        }}
      >
        {isJoined ? 'Joined' : 'Join'}
      </button>
      {message && (
        <small role="status" className="join-message">
          {message}
        </small>
      )}
    </span>
  );
}
