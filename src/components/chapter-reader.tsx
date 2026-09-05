'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookmarkSimple,
  ChatCircleDots,
  CircleHalf,
  DotsThreeVertical,
  Feather,
  Headphones,
  ListBullets,
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
  const [compact, setCompact] = useState(false);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const pending = useRef(false);

  let settings: { size?: number; night?: boolean } = {};
  try {
    settings = JSON.parse(stored) ?? {};
  } catch {}

  const size =
    override?.size ??
    (settings.size && [16, 18, 20, 22].includes(settings.size)
      ? settings.size
      : 18);
  const night = override?.night ?? settings.night === true;

  useEffect(
    () => () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },
    [],
  );

  function preference(nextSize: number, nextNight: boolean) {
    setOverride({ size: nextSize, night: nextNight });
    try {
      localStorage.setItem(
        'readems-reading-view',
        JSON.stringify({ size: nextSize, night: nextNight }),
      );
    } catch {}
  }

  function cycleTextSize() {
    const sizes = [16, 18, 20, 22];
    const index = sizes.indexOf(size);
    preference(sizes[(index + 1) % sizes.length], night);
  }

  function toggleListen() {
    if (!('speechSynthesis' in window)) {
      setMessage('Listening is not supported by this browser.');
      return;
    }
    if (listening) {
      window.speechSynthesis.cancel();
      setListening(false);
      return;
    }
    const narration = new SpeechSynthesisUtterance(
      chapter.paragraphs.join(' '),
    );
    narration.onend = () => setListening(false);
    narration.onerror = () => setListening(false);
    window.speechSynthesis.speak(narration);
    setListening(true);
  }

  async function save() {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setMessage('Saving your place…');
    const paragraphs = Array.from(
      body.current?.querySelectorAll<HTMLElement>('[data-paragraph]') ?? [],
    );
    const visible = paragraphs
      .filter((paragraph) => paragraph.getBoundingClientRect().top <= 180)
      .at(-1);
    const paragraph = Number(visible?.dataset.paragraph ?? 0);
    try {
      const response = await fetch('/api/reading-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          chapter: chapter.number,
          paragraph,
          completed: false,
        }),
      });
      if (response.status === 401) {
        setMessage('Sign in to save your reading progress.');
        return;
      }
      if (!response.ok) throw new Error();
      setMessage('Your place is saved.');
    } catch {
      setMessage('Could not save your place. Please try again.');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  const previousNumber = chapter.number - 1;
  const nextNumber = chapter.number + 1;

  return (
    <div
      className={`chapter-reader${night ? ' reader-night' : ''}${compact ? ' reader-compact' : ''}`}
    >
      <section className="reader-hero">
        <header className="reader-top">
          <Link href={`/stories/${storyId}`} aria-label="Back to story">
            <ArrowLeft />
          </Link>
          <Logo tone="light" />
          <div className="reader-top-actions">
            <button
              aria-label="Save my place"
              title="Save my place"
              onClick={save}
              disabled={saving}
            >
              <BookmarkSimple
                weight={message === 'Your place is saved.' ? 'fill' : 'regular'}
              />
            </button>
            <button aria-label="More reading options" title="More options">
              <DotsThreeVertical weight="bold" />
            </button>
          </div>
        </header>

        <div className="reader-heading">
          <p>{storyTitle}</p>
          <h1>Chapter {chapter.number}</h1>
          <h2>{chapter.title}</h2>
          <div className="reader-progress" aria-label="58% complete">
            <span />
          </div>
          <p className="reader-progress-label">
            58% complete <i>•</i> {readingMinutes(chapter)} min left
          </p>
          <Feather className="reader-hero-feather" weight="thin" />
        </div>
      </section>

      <main className="reader-surface">
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
          <span>
            <Feather weight="duotone" />
          </span>
          <div>
            <strong>Author’s Note</strong>
            <p>
              This chapter was inspired by childhood journeys and the places
              that hold our unspoken stories.
            </p>
          </div>
        </aside>

        <div className="reader-controls" aria-label="Reading preferences">
          <button onClick={cycleTextSize}>
            <TextAa />
            <b>Text</b>
            <small>Serif · {Math.round((size / 18) * 100)}%</small>
          </button>
          <button onClick={() => preference(size, !night)} aria-pressed={night}>
            <CircleHalf weight="fill" />
            <b>Theme</b>
            <small>{night ? 'Night' : 'Paper'}</small>
          </button>
          <button onClick={() => setCompact(!compact)} aria-pressed={compact}>
            <ListBullets />
            <b>Layout</b>
            <small>{compact ? 'Compact' : 'Comfort'}</small>
          </button>
          <button onClick={toggleListen} aria-pressed={listening}>
            <Headphones />
            <b>{listening ? 'Stop' : 'Listen'}</b>
            <small>Voice</small>
          </button>
        </div>

        <nav className="reader-chapters" aria-label="Chapter navigation">
          <div>
            {previousNumber > 0 ? (
              <Link href={`/stories/${storyId}/chapters/${previousNumber}`}>
                <ArrowLeft />
                <span>
                  <small>Previous</small>
                  <b>Chapter {previousNumber}</b>
                </span>
              </Link>
            ) : (
              <Link href={`/stories/${storyId}`}>
                <ArrowLeft />
                <span>
                  <small>Previous</small>
                  <b>Story</b>
                </span>
              </Link>
            )}
          </div>
          <Link className="reader-comments-link" href="#comments">
            <ChatCircleDots />
            <span>Comments</span>
            <small>24</small>
          </Link>
          <div>
            {nextNumber <= total ? (
              <Link href={`/stories/${storyId}/chapters/${nextNumber}`}>
                <span>
                  <small>Next</small>
                  <b>Chapter {nextNumber}</b>
                </span>
                <ArrowRight />
              </Link>
            ) : (
              <Link href={`/stories/${storyId}`}>
                <span>
                  <small>Next</small>
                  <b>Story</b>
                </span>
                <ArrowRight />
              </Link>
            )}
          </div>
        </nav>
        <p className="reader-status" role="status">
          {message}
        </p>
      </main>

      <section className="reader-comments" id="comments">
        <div>
          <h2>
            Comments <span>24</span>
          </h2>
          <p>Join the conversation with readers</p>
        </div>
        <Link href="#comments">
          View all <ArrowRight />
        </Link>
      </section>
    </div>
  );
}
