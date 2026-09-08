'use client';

import Image from 'next/image';
import { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Star, UserCircle } from '@phosphor-icons/react';
import { relativeTime } from '@/lib/time';
import { likeReview, removeReview, submitReview } from '@/app/stories/actions';

export type ReviewView = {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  likes: number;
  liked: boolean;
  mine: boolean;
  author: { name: string; username: string; avatarUrl: string | null };
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          weight={value <= rating ? 'fill' : 'regular'}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function StoryReviews({
  storyId,
  reviews,
  signedIn,
  myReview,
}: {
  storyId: string;
  reviews: ReviewView[];
  signedIn: boolean;
  myReview: { rating: number; body: string | null } | null;
}) {
  const [rating, setRating] = useState(myReview?.rating ?? 5);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [state, submit] = useActionState(
    submitReview.bind(null, storyId),
    null,
  );

  return (
    <section className="details-reviews" id="reviews">
      <div className="details-heading">
        <h2>Reader Reviews</h2>
        {signedIn && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
          >
            {myReview ? 'Edit your review' : 'Write a review'}
          </button>
        )}
      </div>

      {open && signedIn && (
        <form action={submit} className="review-form">
          <fieldset>
            <legend>Your rating</legend>
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                />
                {value} {value === 1 ? 'star' : 'stars'}
              </label>
            ))}
          </fieldset>
          <label htmlFor="review-body">Your review</label>
          <textarea
            id="review-body"
            name="body"
            rows={4}
            maxLength={2000}
            defaultValue={myReview?.body ?? ''}
            placeholder="What stayed with you?"
          />
          <div className="review-form-actions">
            <button type="submit">Post review</button>
            {myReview && (
              <button
                type="button"
                className="review-delete"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await removeReview(storyId);
                    setOpen(false);
                    router.refresh();
                  })
                }
              >
                Delete review
              </button>
            )}
          </div>
          {state?.message && <p role="status">{state.message}</p>}
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="reviews-empty">
          No reviews yet.{' '}
          {signedIn
            ? 'Be the first to say what you thought.'
            : 'Sign in to leave the first one.'}
        </p>
      ) : (
        <ul className="review-list">
          {reviews.map((review) => (
            <li key={review.id}>
              {review.author.avatarUrl ? (
                <Image
                  src={review.author.avatarUrl}
                  alt=""
                  width={52}
                  height={52}
                />
              ) : (
                <UserCircle size={52} aria-hidden="true" />
              )}
              <div>
                <p>
                  <b>{review.author.name}</b>
                  {review.mine && <span>Your review</span>}
                </p>
                <p className="details-stars">
                  <Stars rating={review.rating} />
                  <small>· {relativeTime(new Date(review.createdAt))}</small>
                </p>
                {review.body && <p>{review.body}</p>}
                <footer>
                  <button
                    type="button"
                    aria-pressed={review.liked}
                    aria-label={
                      review.liked
                        ? `Remove your like from ${review.author.name}’s review`
                        : `Like ${review.author.name}’s review`
                    }
                    disabled={pending || !signedIn}
                    onClick={() =>
                      startTransition(async () => {
                        await likeReview(review.id, storyId);
                        router.refresh();
                      })
                    }
                  >
                    <Heart weight={review.liked ? 'fill' : 'regular'} />{' '}
                    {review.likes}
                  </button>
                </footer>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
