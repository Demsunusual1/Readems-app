'use client';

import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';

const KEY = 'readems-recent-searches';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function snapshot() {
  try {
    return localStorage.getItem(KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

function save(value: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // A browser that refuses storage simply has no history to show.
  }
  listeners.forEach((listener) => listener());
}

function parse(raw: string): string[] {
  try {
    const stored: unknown = JSON.parse(raw);
    return Array.isArray(stored)
      ? stored.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

/**
 * Recent searches stay on the device that made them: they are one person's
 * half-formed questions, not something the server needs to keep.
 */
export function RecentSearches({ term }: { term: string }) {
  const stored = useSyncExternalStore(subscribe, snapshot, () => '[]');
  const recent = parse(stored);

  useEffect(() => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const current = parse(snapshot());
    if (current[0] === trimmed) return;
    save([trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 8));
  }, [term]);

  if (recent.length === 0) return null;

  return (
    <section className="recent-searches" aria-labelledby="recent-searches">
      <div>
        <h2 id="recent-searches">Recent searches</h2>
        <button type="button" onClick={() => save([])}>
          Clear all
        </button>
      </div>
      <ul>
        {recent.map((item) => (
          <li key={item}>
            <Link href={`/search?q=${encodeURIComponent(item)}`}>
              <ClockCounterClockwise aria-hidden="true" /> {item}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
