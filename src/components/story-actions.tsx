'use client';
import Link from 'next/link';
import { BookOpen, BookmarkSimple, Heart } from '@phosphor-icons/react';
import { useState } from 'react';

export function StoryActions({
  storyId,
  canRead,
}: {
  storyId: string;
  canRead: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  return (
    <div className="details-actions">
      {canRead && (
        <Link href={`/stories/${storyId}/chapters/1`}>
          <BookOpen />
          Start Reading
        </Link>
      )}
      <button aria-pressed={saved} onClick={() => setSaved(!saved)}>
        <BookmarkSimple weight={saved ? 'fill' : 'regular'} />
        {saved ? 'Added to Library' : 'Add to Library'}
      </button>
      <button
        className="details-like"
        aria-label="Like story"
        aria-pressed={liked}
        onClick={() => setLiked(!liked)}
      >
        <Heart weight={liked ? 'fill' : 'regular'} />
      </button>
    </div>
  );
}
