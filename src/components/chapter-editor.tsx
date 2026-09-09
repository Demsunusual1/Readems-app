'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CloudCheck, Clock, PaperPlaneRight } from '@phosphor-icons/react';
import { countWords } from '@/lib/creator-text';
import { saveChapterDraft, setChapterPublished } from '@/app/creator/actions';

export function ChapterEditor({
  storyId,
  chapter,
}: {
  storyId: string;
  chapter: {
    id: string;
    number: number;
    title: string;
    body: string;
    authorNote: string;
    status: string;
    scheduledFor: string | null;
  };
}) {
  const [title, setTitle] = useState(chapter.title);
  const [body, setBody] = useState(chapter.body);
  const [note, setNote] = useState(chapter.authorNote);
  const [status, setStatus] = useState('');
  const [schedule, setSchedule] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const saved = useRef({
    title: chapter.title,
    body: chapter.body,
    note: chapter.authorNote,
  });

  // Autosave: the writer should never lose a paragraph to a closed tab.
  useEffect(() => {
    if (
      title === saved.current.title &&
      body === saved.current.body &&
      note === saved.current.note
    )
      return;
    const timer = setTimeout(async () => {
      const result = await saveChapterDraft(chapter.id, storyId, {
        title,
        body,
        authorNote: note,
      });
      if (result.ok) {
        saved.current = { title, body, note };
        setStatus('Saved just now');
      } else setStatus(result.message ?? 'Could not save');
    }, 1200);
    return () => clearTimeout(timer);
  }, [title, body, note, chapter.id, storyId]);

  const words = countWords(body);

  return (
    <main className="editor-main">
      <label htmlFor="chapter-title-input">Chapter title</label>
      <input
        id="chapter-title-input"
        className="editor-title"
        value={title}
        maxLength={120}
        onChange={(event) => setTitle(event.target.value)}
      />

      <label htmlFor="chapter-body">Chapter</label>
      <textarea
        id="chapter-body"
        className="editor-body"
        value={body}
        rows={18}
        placeholder="Leave a blank line between paragraphs."
        onChange={(event) => setBody(event.target.value)}
      />

      <label htmlFor="chapter-note">Author’s note</label>
      <textarea
        id="chapter-note"
        rows={2}
        maxLength={400}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <div className="editor-meta">
        <span>
          <b>{words}</b> {words === 1 ? 'word' : 'words'}
        </span>
        <span>
          <b>{body.length}</b> characters
        </span>
        <span role="status">
          <CloudCheck aria-hidden="true" /> {status || 'Nothing to save yet'}
        </span>
      </div>

      <div className="editor-actions">
        <label htmlFor="chapter-schedule">
          <Clock aria-hidden="true" /> Schedule for
        </label>
        <input
          id="chapter-schedule"
          type="datetime-local"
          value={schedule}
          onChange={(event) => setSchedule(event.target.value)}
        />
        <button
          type="button"
          className="editor-schedule"
          disabled={pending || !schedule}
          onClick={() =>
            startTransition(async () => {
              await saveChapterDraft(chapter.id, storyId, {
                title,
                body,
                authorNote: note,
              });
              const result = await setChapterPublished(
                chapter.id,
                storyId,
                true,
                schedule,
              );
              setStatus(result.ok ? 'Scheduled' : (result.message ?? ''));
              router.refresh();
            })
          }
        >
          Schedule
        </button>
        <button
          type="button"
          className="editor-publish"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await saveChapterDraft(chapter.id, storyId, {
                title,
                body,
                authorNote: note,
              });
              const result = await setChapterPublished(
                chapter.id,
                storyId,
                chapter.status !== 'PUBLISHED',
              );
              setStatus(
                result.ok
                  ? chapter.status === 'PUBLISHED'
                    ? 'Unpublished'
                    : 'Published'
                  : (result.message ?? ''),
              );
              router.refresh();
            })
          }
        >
          <PaperPlaneRight weight="fill" aria-hidden="true" />
          {chapter.status === 'PUBLISHED'
            ? 'Unpublish chapter'
            : 'Publish chapter'}
        </button>
      </div>
    </main>
  );
}
