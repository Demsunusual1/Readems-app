'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Saved = { chapter: number; paragraph: number; completed: boolean };
export function StoryProgress({ storyId }: { storyId: string }) {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [message, setMessage] = useState('Checking for a saved place…');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/reading-progress?storyId=${encodeURIComponent(storyId)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          setMessage('Sign in to save your place across devices.');
          return;
        }
        if (!response.ok) throw new Error();
        const data = (await response.json()) as { progress: Saved | null };
        setSaved(data.progress);
        setMessage(
          data.progress
            ? `Saved at chapter ${data.progress.chapter}${data.progress.completed ? ' · chapter completed' : ''}.`
            : 'Your saved place will appear here.',
        );
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setMessage(
            'Saved progress is temporarily unavailable. You can still read.',
          );
      });
    return () => controller.abort();
  }, [storyId]);
  return (
    <div className="story-resume">
      <p role="status">{message}</p>
      {saved && (
        <Link
          href={`/stories/${storyId}/chapters/${saved.chapter}#paragraph-${saved.paragraph}`}
        >
          Resume reading
        </Link>
      )}
    </div>
  );
}
