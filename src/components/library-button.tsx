'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkSimple } from '@phosphor-icons/react';

export function LibraryButton({
  storyId,
  signedIn,
  initialSaved,
}: {
  storyId: string;
  signedIn: boolean;
  initialSaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push('/login');
      return;
    }
    const nextSaved = !saved;
    setPending(true);
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, saved: nextSaved }),
      });
      if (response.ok) setSaved(nextSaved);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className="story-secondary"
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
    >
      <BookmarkSimple weight={saved ? 'fill' : 'regular'} />
      {saved ? 'Saved to library' : 'Save to library'}
    </button>
  );
}
