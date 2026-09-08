'use client';

import Link from 'next/link';
import { BookOpen, BookmarkSimple } from '@phosphor-icons/react';
import { useState, useTransition } from 'react';
import { toggleLibraryStory } from '@/app/library/actions';

export function StoryActions({
  storyId,
  canRead,
  signedIn,
  savedInLibrary,
}: {
  storyId: string;
  canRead: boolean;
  signedIn: boolean;
  savedInLibrary: boolean;
}) {
  const [saved, setSaved] = useState(savedInLibrary);
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
      <p className="details-action-status" role="status">
        {message}
      </p>
    </div>
  );
}
