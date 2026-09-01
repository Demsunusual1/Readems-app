'use client';
import Link from 'next/link';
import { useRef, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  BookmarkSimple,
  Check,
  Moon,
  Sun,
  TextAa,
} from '@phosphor-icons/react';
import { Logo } from './ui/logo';
import { type Chapter, readingMinutes } from '@/lib/chapters';
import './reading.css';
function subscribeView(notify: () => void) {
  window.addEventListener('storage', notify);
  return () => window.removeEventListener('storage', notify);
}
function readView() {
  try {
    return localStorage.getItem('readems-reading-view') ?? '{}';
  } catch {
    return '{}';
  }
}
export function ChapterReader({
  storyId,
  storyTitle,
  chapter,
  total,
}: {
  storyId: string;
  storyTitle: string;
  chapter: Chapter;
  total: number;
}) {
  const stored = useSyncExternalStore(subscribeView, readView, () => '{}');
  const [override, setOverride] = useState<{
    size: number;
    night: boolean;
  } | null>(null);
  let settings: { size?: number; night?: boolean } = {};
  try {
    settings = JSON.parse(stored) ?? {};
  } catch {}
  const size =
    override?.size ??
    (settings.size && [18, 20, 24, 28].includes(settings.size)
      ? settings.size
      : 20);
  const night = override?.night ?? settings.night === true;
  const [message, setMessage] = useState(
    'Use “Save my place” to remember where you stop.',
  );
  const [saving, setSaving] = useState(false);
  const [login, setLogin] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  function preference(nextSize: number, nextNight: boolean) {
    setOverride({ size: nextSize, night: nextNight });
    try {
      localStorage.setItem(
        'readems-reading-view',
        JSON.stringify({ size: nextSize, night: nextNight }),
      );
    } catch {}
  }
  async function save(completed = false) {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setLogin(false);
    setMessage('Saving your place…');
    const paragraphs = Array.from(
      body.current?.querySelectorAll<HTMLElement>('[data-paragraph]') ?? [],
    );
    const visible = paragraphs
      .filter((paragraph) => paragraph.getBoundingClientRect().top <= 180)
      .at(-1);
    const paragraph = completed
      ? chapter.paragraphs.length - 1
      : Number(visible?.dataset.paragraph ?? 0);
    try {
      const response = await fetch('/api/reading-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          chapter: chapter.number,
          paragraph,
          completed,
        }),
      });
      if (response.status === 401) {
        setLogin(true);
        setMessage('Sign in to save your reading progress.');
        return;
      }
      if (!response.ok) throw new Error();
      setMessage(
        completed
          ? 'Chapter marked complete. Progress saved to your account.'
          : 'Your place is saved to your account.',
      );
    } catch {
      setMessage('Could not save your place. Please try again.');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  return (
    <div className={`chapter-reader${night ? ' reader-night' : ''}`}>
      <header className="reader-top">
        <Link href={`/stories/${storyId}`} aria-label="Back to story">
          <ArrowLeft size={24} />
        </Link>
        <Logo tone="light" />
        <button onClick={() => save()} disabled={saving}>
          <BookmarkSimple aria-hidden="true" />
          <span>Save my place</span>
        </button>
      </header>
      <main>
        <section className="reader-heading">
          <p>{storyTitle}</p>
          <h1>Chapter {chapter.number}</h1>
          <h2>{chapter.title}</h2>
          <span>
            {chapter.number} of {total} · {readingMinutes(chapter)} min read ·
            Sample text
          </span>
        </section>
        <div className="reader-surface">
          <div className="reader-controls" aria-label="Reading preferences">
            <label>
              <TextAa aria-hidden="true" />
              Text size
              <select
                aria-label="Text size"
                value={size}
                onChange={(event) =>
                  preference(Number(event.target.value), night)
                }
              >
                {[18, 20, 24, 28].map((value) => (
                  <option key={value} value={value}>
                    {value}px
                  </option>
                ))}
              </select>
            </label>
            <button
              aria-pressed={night}
              onClick={() => preference(size, !night)}
            >
              {night ? <Sun /> : <Moon />}
              {night ? 'Light theme' : 'Dark theme'}
            </button>
          </div>
          <div
            className="reader-text"
            ref={body}
            style={{ fontSize: `${size}px` }}
          >
            {chapter.paragraphs.map((paragraph, index) => (
              <p key={index} id={`paragraph-${index}`} data-paragraph={index}>
                {paragraph}
              </p>
            ))}
          </div>
          <aside className="reader-note">
            <strong>About this sample</strong>
            <p>
              This original demonstration text lets you try the reading
              experience. It is not a published creator submission.
            </p>
          </aside>
          <div className="reader-save">
            <button onClick={() => save(true)} disabled={saving}>
              <Check aria-hidden="true" />
              Mark chapter complete
            </button>
            <p role="status">{message}</p>
            {login && <Link href="/login">Log in to save</Link>}
          </div>
          <nav className="reader-chapters" aria-label="Chapter navigation">
            {chapter.number > 1 ? (
              <Link href={`/stories/${storyId}/chapters/${chapter.number - 1}`}>
                ← Previous chapter
              </Link>
            ) : (
              <Link href={`/stories/${storyId}`}>All chapters</Link>
            )}
            {chapter.number < total ? (
              <Link href={`/stories/${storyId}/chapters/${chapter.number + 1}`}>
                Next chapter →
              </Link>
            ) : (
              <Link href="/discover">Back to Discover →</Link>
            )}
          </nav>
        </div>
      </main>
    </div>
  );
}
