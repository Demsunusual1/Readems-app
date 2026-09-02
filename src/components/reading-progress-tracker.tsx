'use client';

import { useEffect, useRef } from 'react';

export function ReadingProgressTracker({
  storyId,
  chapterNumber,
}: {
  storyId: string;
  chapterNumber: number;
}) {
  const lastSent = useRef(-1);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const persist = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent =
        scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 100;
      if (Math.abs(percent - lastSent.current) < 5 && percent !== 100) return;
      lastSent.current = percent;
      void fetch('/api/reading-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          chapterNumber,
          progressPercent: percent,
        }),
        keepalive: true,
      });
    };

    const onScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(persist, 350);
    };

    persist();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    return () => {
      if (timer) clearTimeout(timer);
      persist();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
    };
  }, [storyId, chapterNumber]);

  return null;
}
