'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChatCircle, Eye, Heart, PlusCircle } from '@phosphor-icons/react';
import { relativeTime } from '@/lib/time';
import {
  addChapter,
  editStory,
  removeChapter,
  removeStory,
  setChapterPublished,
  setStoryPublished,
} from '@/app/creator/actions';

export type ManagedChapter = {
  id: string;
  number: number;
  title: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  words: number;
  scheduledFor: string | null;
  updatedAt: string;
};

export function StoryManager({
  story,
  chapters,
  genres,
  covers,
}: {
  story: {
    id: string;
    title: string;
    synopsis: string;
    genre: string;
    audience: string;
    tags: string[];
    coverUrl: string;
    status: string;
    reads: number;
    likes: number;
    comments: number;
  };
  chapters: ManagedChapter[];
  genres: string[];
  covers: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cover, setCover] = useState(story.coverUrl);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsState, saveDetails] = useActionState(
    editStory.bind(null, story.id),
    null,
  );
  const [chapterState, submitChapter] = useActionState(
    addChapter.bind(null, story.id),
    null,
  );

  useEffect(() => {
    if (chapterState?.ok && chapterState.chapterId)
      router.push(
        `/creator/stories/${story.id}/chapters/${chapterState.chapterId}`,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterState]);

  return (
    <>
      <section className="manager-stats">
        <span>
          <Eye aria-hidden="true" /> <b>{story.reads}</b> reads
        </span>
        <span>
          <Heart aria-hidden="true" /> <b>{story.likes}</b> likes
        </span>
        <span>
          <ChatCircle aria-hidden="true" /> <b>{story.comments}</b> comments
        </span>
      </section>

      <section className="manager-publish">
        <div>
          <h2>
            {story.status === 'PUBLISHED' ? 'Published' : 'Not published'}
          </h2>
          <p>
            {story.status === 'PUBLISHED'
              ? 'Readers can find this story and read every published chapter.'
              : 'Only you can see this story until you publish it.'}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setStoryPublished(story.id, story.status !== 'PUBLISHED');
              router.refresh();
            })
          }
        >
          {story.status === 'PUBLISHED' ? 'Unpublish' : 'Publish story'}
        </button>
      </section>

      <section className="manager-chapters">
        <div>
          <h2>Chapters</h2>
        </div>
        {chapters.length === 0 ? (
          <p className="creator-empty">No chapters yet.</p>
        ) : (
          <ul>
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={`/creator/stories/${story.id}/chapters/${chapter.id}`}
                >
                  <span>
                    <strong>
                      Chapter {chapter.number}: {chapter.title}
                    </strong>
                    <small>
                      {chapter.words} words <i>•</i> edited{' '}
                      {relativeTime(new Date(chapter.updatedAt))}
                      {chapter.scheduledFor &&
                        ` • scheduled for ${new Date(
                          chapter.scheduledFor,
                        ).toUTCString()}`}
                    </small>
                  </span>
                </Link>
                <b className={`creator-status ${chapter.status.toLowerCase()}`}>
                  {chapter.status}
                </b>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await setChapterPublished(
                        chapter.id,
                        story.id,
                        chapter.status !== 'PUBLISHED',
                      );
                      router.refresh();
                    })
                  }
                >
                  {chapter.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  className="manager-delete"
                  disabled={pending}
                  aria-label={`Delete chapter ${chapter.number}`}
                  onClick={() =>
                    startTransition(async () => {
                      await removeChapter(chapter.id, story.id);
                      router.refresh();
                    })
                  }
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <form action={submitChapter} className="manager-new-chapter">
          <label htmlFor="chapter-title">New chapter title</label>
          <input id="chapter-title" name="title" required maxLength={120} />
          <button type="submit">
            <PlusCircle aria-hidden="true" /> Add chapter
          </button>
          {chapterState?.message && !chapterState.ok && (
            <p role="alert">{chapterState.message}</p>
          )}
        </form>
      </section>

      <section className="manager-details">
        <div>
          <h2>Story details</h2>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
          >
            {showDetails ? 'Close' : 'Edit'}
          </button>
        </div>
        {showDetails && (
          <form action={saveDetails}>
            <label htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              name="title"
              defaultValue={story.title}
              required
              maxLength={120}
            />
            <label htmlFor="edit-synopsis">Synopsis</label>
            <textarea
              id="edit-synopsis"
              name="synopsis"
              rows={4}
              defaultValue={story.synopsis}
              maxLength={1200}
            />
            <label htmlFor="edit-genre">Genre</label>
            <select id="edit-genre" name="genre" defaultValue={story.genre}>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <label htmlFor="edit-audience">Audience</label>
            <select
              id="edit-audience"
              name="audience"
              defaultValue={story.audience}
            >
              {['General', 'Young Adult', 'Adult'].map((audience) => (
                <option key={audience} value={audience}>
                  {audience}
                </option>
              ))}
            </select>
            <label htmlFor="edit-tags">Tags</label>
            <input
              id="edit-tags"
              name="tags"
              defaultValue={story.tags.join(', ')}
            />
            <fieldset className="cover-picker">
              <legend>Cover</legend>
              <input type="hidden" name="coverUrl" value={cover} />
              {covers.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="cover-choice"
                    checked={cover === option}
                    onChange={() => setCover(option)}
                  />
                  <Image src={option} alt="" width={72} height={100} />
                  <span className="sr-only">{option.split('/').pop()}</span>
                </label>
              ))}
            </fieldset>
            <button type="submit">Save details</button>
            {detailsState?.message && (
              <p role="status">{detailsState.message}</p>
            )}
          </form>
        )}
      </section>

      <section className="manager-danger">
        <h2>Delete this story</h2>
        <p>
          Deleting removes the story, its chapters and everything readers wrote
          on them. It cannot be undone.
        </p>
        <button
          type="button"
          className="manager-delete"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await removeStory(story.id);
              if (result.ok) router.push('/creator/stories');
            })
          }
        >
          Delete story
        </button>
      </section>
    </>
  );
}
