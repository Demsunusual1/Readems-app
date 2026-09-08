'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { removeStoryFromList } from '@/app/library/actions';

export function RemoveFromList({
  listId,
  storyId,
  title,
}: {
  listId: string;
  storyId: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      className="list-remove"
      disabled={pending}
      aria-label={`Remove ${title} from this list`}
      onClick={() =>
        startTransition(async () => {
          await removeStoryFromList(listId, storyId);
          router.refresh();
        })
      }
    >
      Remove
    </button>
  );
}
