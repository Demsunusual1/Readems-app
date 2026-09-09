'use client';

import { useState, useTransition } from 'react';
import { ListPlus } from '@phosphor-icons/react';
import { addStoryToList, removeStoryFromList } from '@/app/library/actions';

export type ListChoice = { id: string; title: string; holdsStory: boolean };

/** Put a story into one of the reader's own lists, or take it out again. */
export function StoryLists({
  storyId,
  lists,
}: {
  storyId: string;
  lists: ListChoice[];
}) {
  const [choices, setChoices] = useState(lists);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  if (choices.length === 0)
    return (
      <p className="story-lists-empty">
        Reading lists you make in your library will show up here.
      </p>
    );

  return (
    <div className="story-lists">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="story-lists-toggle"
      >
        <ListPlus aria-hidden="true" /> Add to a reading list
      </button>
      {open && (
        <ul>
          {choices.map((list) => (
            <li key={list.id}>
              <label>
                <input
                  type="checkbox"
                  checked={list.holdsStory}
                  disabled={pending}
                  onChange={() => {
                    // The tick moves as it is pressed and goes back if the
                    // server refuses, rather than waiting on a round trip.
                    const wasIn = list.holdsStory;
                    const flip = (holds: boolean) =>
                      setChoices((current) =>
                        current.map((item) =>
                          item.id === list.id
                            ? { ...item, holdsStory: holds }
                            : item,
                        ),
                      );
                    flip(!wasIn);
                    startTransition(async () => {
                      const result = wasIn
                        ? await removeStoryFromList(list.id, storyId)
                        : await addStoryToList(list.id, storyId);
                      if (result.ok) {
                        setMessage(
                          wasIn
                            ? `Removed from ${list.title}.`
                            : `Added to ${list.title}.`,
                        );
                      } else {
                        flip(wasIn);
                        setMessage(result.message ?? 'That did not work.');
                      }
                    });
                  }}
                />
                {list.title}
              </label>
            </li>
          ))}
        </ul>
      )}
      <p role="status" className="story-lists-status">
        {message}
      </p>
    </div>
  );
}
