'use client';

import { useState, useTransition } from 'react';
import { UserPlus, UserCheck } from '@phosphor-icons/react';
import { followPerson } from '@/app/people/actions';

export function FollowButton({
  personId,
  username,
  name,
  following,
  signedIn,
}: {
  personId: string;
  username: string;
  name: string;
  following: boolean;
  signedIn: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(following);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <span className="follow-control">
      <button
        type="button"
        className="follow-button"
        aria-pressed={isFollowing}
        aria-label={isFollowing ? `Unfollow ${name}` : `Follow ${name}`}
        disabled={pending}
        onClick={() => {
          if (!signedIn) {
            setMessage('Sign in to follow people.');
            return;
          }
          startTransition(async () => {
            const result = await followPerson(personId, username);
            if (result.ok) setIsFollowing(Boolean(result.following));
            else setMessage(result.message ?? 'That did not work.');
          });
        }}
      >
        {isFollowing ? <UserCheck weight="fill" /> : <UserPlus />}
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      {message && (
        <small role="status" className="follow-message">
          {message}
        </small>
      )}
    </span>
  );
}
