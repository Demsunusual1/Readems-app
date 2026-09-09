'use client';

import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { startStory } from '@/app/creator/actions';

export function NewStoryForm({
  genres,
  covers,
}: {
  genres: string[];
  covers: string[];
}) {
  const [cover, setCover] = useState(covers[0]);
  const [state, submit] = useActionState(startStory, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && state.storyId)
      router.push(`/creator/stories/${state.storyId}`);
    // Navigating once, when the story exists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={submit} className="story-form">
      <label htmlFor="story-title">Title</label>
      <input id="story-title" name="title" required maxLength={120} />

      <label htmlFor="story-synopsis">Synopsis</label>
      <textarea
        id="story-synopsis"
        name="synopsis"
        rows={4}
        maxLength={1200}
        placeholder="What is this story about?"
      />

      <label htmlFor="story-genre">Genre</label>
      <select id="story-genre" name="genre" defaultValue={genres[0]}>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      <label htmlFor="story-audience">Audience</label>
      <select id="story-audience" name="audience" defaultValue="General">
        {['General', 'Young Adult', 'Adult'].map((audience) => (
          <option key={audience} value={audience}>
            {audience}
          </option>
        ))}
      </select>

      <label htmlFor="story-tags">Tags</label>
      <input
        id="story-tags"
        name="tags"
        placeholder="Family Secrets, Coming of Age"
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

      <button type="submit">Create story</button>
      {state?.message && !state.ok && <p role="alert">{state.message}</p>}
    </form>
  );
}
