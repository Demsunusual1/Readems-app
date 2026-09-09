'use client';

import Link from 'next/link';
import { BookOpen, BookmarkSimple, Heart } from '@phosphor-icons/react';
import { useState, useTransition } from 'react';
import { toggleLibraryStory } from '@/app/library/actions';
import { likeStory } from '@/app/stories/actions';

export function StoryActions({
  storyId,
  canRead,
  signedIn,
  savedInLibrary,
  likes,
  likedByMe,
}: {
  storyId: string;
  canRead: boolean;
  signedIn: boolean;
  savedInLibrary: boolean;
  likes: number;
  likedByMe: boolean;
}) {
  const [saved, setSaved] = useState(savedInLibrary);
  const [liked, setLiked] = useState(likedByMe);
  const [likeCount, setLikeCount] = useState(likes);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (!signedIn) {
      setMessage('Sign in to keep this story in your library.');
      return;
    }
    startTransition(async () => {
      const result = await toggleLibraryStory(storyId);
      if (result.ok) {
        setSaved(Boolean(result.saved));
        setMessage(
          result.saved
            ? 'Saved to your library.'
            : 'Removed from your library.',
        );
      } else {
        setMessage(result.message ?? 'That did not work. Try again.');
      }
    });
  }

  return (
    <div className="details-actions">
      {canRead && (
        <Link href={`/stories/${storyId}/chapters/1`}>
          <BookOpen />
          Start Reading
        </Link>
      )}
      <button aria-pressed={saved} onClick={toggle} disabled={pending}>
        <BookmarkSimple weight={saved ? 'fill' : 'regular'} />
        {saved ? 'In your library' : 'Add to Library'}
      </button>
      <button
        className="details-like"
        aria-pressed={liked}
        aria-label={liked ? 'Remove your like' : 'Like this story'}
        disabled={pending}
        onClick={() => {
          if (!signedIn) {
            setMessage('Sign in to like this story.');
            return;
          }
          startTransition(async () => {
            const result = await likeStory(storyId);
            if (result.ok) {
              setLiked(Boolean(result.liked));
              setLikeCount((count) => count + (result.liked ? 1 : -1));
            } else {
              setMessage(result.message ?? 'That did not work. Try again.');
            }
          });
        }}
      >
        <Heart weight={liked ? 'fill' : 'regular'} />
        <span>{likeCount}</span>
      </button>
      <p className="details-action-status" role="status">
        {message}
      </p>
    </div>
  );
}
