'use client';

import { useState } from 'react';

export function ReadingToolbar() {
  const [size, setSize] = useState(1);

  return (
    <div className="reading-toolbar" aria-label="Reading controls">
      <span>Text size</span>
      <button
        type="button"
        aria-label="Decrease text size"
        onClick={() => setSize((value) => Math.max(0.9, value - 0.1))}
      >
        A−
      </button>
      <button
        type="button"
        aria-label="Increase text size"
        onClick={() => setSize((value) => Math.min(1.4, value + 0.1))}
      >
        A+
      </button>
      <span aria-live="polite">{Math.round(size * 100)}%</span>
      <style>{`.chapter-body{font-size:${size * 1.18}rem}`}</style>
    </div>
  );
}
