'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
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
  const [reached, setReached] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const pending = useRef<Promise<void>>(Promise.resolve());
  const furthest = useRef(0);
  const lastSaved = useRef(-1);

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
  const lastParagraph = chapter.paragraphs.length - 1;

  useEffect(
    () => () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },
    [],
  );

  // The furthest paragraph the reader has actually seen, remembered as they
  // scroll. Reading the position at the moment the bookmark is pressed would
  // record the top of the page instead, because pressing a control in the
  // header scrolls back up to it.
  useEffect(() => {
    function update() {
      const paragraphs = Array.from(
        body.current?.querySelectorAll<HTMLElement>('[data-paragraph]') ?? [],
      );
      const seen = paragraphs
        .filter(
          (paragraph) =>
            paragraph.getBoundingClientRect().top < window.innerHeight - 40,
        )
        .at(-1);
      const index = Number(seen?.dataset.paragraph ?? 0);
      if (index > furthest.current) {
        furthest.current = index;
        setReached(index);
      }
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [chapter.number]);

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

  const runSave = useCallback(
    async (announce: boolean) => {
      const paragraph = furthest.current;
      if (!announce && paragraph <= lastSaved.current) return;
      if (announce) {
        setSaving(true);
        setMessage('Saving your place…');
      }
      try {
        const response = await fetch('/api/reading-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId,
            chapter: chapter.number,
            paragraph,
            completed: paragraph === lastParagraph,
          }),
        });
        if (response.status === 401) {
          if (announce) setMessage('Sign in to save your reading progress.');
          lastSaved.current = lastParagraph;
          return;
        }
        if (!response.ok) throw new Error();
        lastSaved.current = paragraph;
        if (announce) setMessage('Your place is saved.');
      } catch {
        if (announce)
          setMessage('Could not save your place. Please try again.');
      } finally {
        if (announce) setSaving(false);
      }
    },
    [chapter.number, lastParagraph, storyId],
  );

  // One save at a time, in order, so a background save cannot swallow the
  // bookmark press that a reader is waiting on.
  const save = useCallback(
    (announce: boolean) => {
      pending.current = pending.current.then(() => runSave(announce));
      return pending.current;
    },
    [runSave],
  );

  // Progress is kept without asking: the reader can still press the bookmark,
  // which reports success or the need to sign in.
  useEffect(() => {
    if (reached === 0) return;
    const timer = setTimeout(() => void save(false), 1500);
    return () => clearTimeout(timer);
  }, [reached, save]);

  const previousNumber = chapter.number - 1;
  const nextNumber = chapter.number + 1;
  const percent = Math.round(((reached + 1) / chapter.paragraphs.length) * 100);
  const remaining = readingMinutes({
    paragraphs: chapter.paragraphs.slice(reached),
  });

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
              onClick={() => void save(true)}
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
          <div className="reader-progress" aria-label={`${percent}% complete`}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <p className="reader-progress-label">
            {percent}% complete <i>•</i> {remaining} min left
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

        {chapter.authorNote && (
          <aside className="reader-note">
            <span>
              <Feather weight="duotone" />
            </span>
            <div>
              <strong>Author’s Note</strong>
              <p>{chapter.authorNote}</p>
            </div>
          </aside>
        )}

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
          <h2>Comments</h2>
          <p>Join the conversation with readers</p>
        </div>
      </section>
    </div>
  );
}
