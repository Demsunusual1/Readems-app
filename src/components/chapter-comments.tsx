'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, PaperPlaneRight, UserCircle } from '@phosphor-icons/react';
import { relativeTime } from '@/lib/time';
import { likeComment, postComment, removeComment } from '@/app/stories/actions';

export type CommentView = {
  id: string;
  body: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  mine: boolean;
  canRemove: boolean;
  author: { name: string; username: string; avatarUrl: string | null };
  replies: CommentView[];
};

function Avatar({ url }: { url: string | null }) {
  return url ? (
    <Image src={url} alt="" width={40} height={40} className="comment-avatar" />
  ) : (
    <UserCircle size={40} aria-hidden="true" className="comment-avatar" />
  );
}

function CommentForm({
  chapterId,
  parentId,
  label,
  onPosted,
}: {
  chapterId: string;
  parentId: string | null;
  label: string;
  onPosted?: () => void;
}) {
  const router = useRouter();
  const [state, submit] = useActionState(
    postComment.bind(null, chapterId, parentId),
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      onPosted?.();
    }
    // Refreshing once per successful post is the whole intent here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={submit} className="comment-form">
      <label htmlFor={`comment-${parentId ?? 'new'}`}>{label}</label>
      <div>
        <textarea
          id={`comment-${parentId ?? 'new'}`}
          name="body"
          rows={parentId ? 2 : 3}
          maxLength={2000}
          required
          placeholder="Share your thoughts…"
        />
        <button type="submit" aria-label="Post comment">
          <PaperPlaneRight weight="fill" />
        </button>
      </div>
      {state?.message && <p role="alert">{state.message}</p>}
    </form>
  );
}

function Comment({
  comment,
  chapterId,
  signedIn,
}: {
  comment: CommentView;
  chapterId: string;
  signedIn: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <li>
      <article>
        <Avatar url={comment.author.avatarUrl} />
        <div>
          <p className="comment-head">
            <b>{comment.author.name}</b>
            <small>{relativeTime(new Date(comment.createdAt))}</small>
          </p>
          <p className="comment-body">{comment.body}</p>
          <footer>
            <button
              type="button"
              aria-pressed={comment.liked}
              aria-label={
                comment.liked
                  ? `Remove your like from ${comment.author.name}’s comment`
                  : `Like ${comment.author.name}’s comment`
              }
              disabled={!signedIn || pending}
              onClick={() =>
                startTransition(async () => {
                  await likeComment(comment.id);
                  router.refresh();
                })
              }
            >
              <Heart weight={comment.liked ? 'fill' : 'regular'} />{' '}
              {comment.likes}
            </button>
            {signedIn && (
              <button type="button" onClick={() => setReplying(!replying)}>
                Reply
              </button>
            )}
            {comment.canRemove && (
              <button
                type="button"
                className="comment-delete"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await removeComment(comment.id);
                    router.refresh();
                  })
                }
              >
                Delete
              </button>
            )}
          </footer>
        </div>
      </article>
      {(replying || comment.replies.length > 0) && (
        <ul className="comment-replies">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <article>
                <Avatar url={reply.author.avatarUrl} />
                <div>
                  <p className="comment-head">
                    <b>{reply.author.name}</b>
                    <small>{relativeTime(new Date(reply.createdAt))}</small>
                  </p>
                  <p className="comment-body">{reply.body}</p>
                  <footer>
                    <button
                      type="button"
                      aria-pressed={reply.liked}
                      aria-label={
                        reply.liked
                          ? `Remove your like from ${reply.author.name}’s reply`
                          : `Like ${reply.author.name}’s reply`
                      }
                      disabled={!signedIn || pending}
                      onClick={() =>
                        startTransition(async () => {
                          await likeComment(reply.id);
                          router.refresh();
                        })
                      }
                    >
                      <Heart weight={reply.liked ? 'fill' : 'regular'} />{' '}
                      {reply.likes}
                    </button>
                    {reply.canRemove && (
                      <button
                        type="button"
                        className="comment-delete"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await removeComment(reply.id);
                            router.refresh();
                          })
                        }
                      >
                        Delete
                      </button>
                    )}
                  </footer>
                </div>
              </article>
            </li>
          ))}
          {replying && signedIn && (
            <li>
              <CommentForm
                chapterId={chapterId}
                parentId={comment.id}
                label={`Reply to ${comment.author.name}`}
                onPosted={() => setReplying(false)}
              />
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

export function ChapterComments({
  chapterId,
  comments,
  signedIn,
}: {
  chapterId: string;
  comments: CommentView[];
  signedIn: boolean;
}) {
  const total = comments.reduce(
    (count, comment) => count + 1 + comment.replies.length,
    0,
  );

  return (
    <section className="reader-comments" id="comments">
      <div>
        <h2>
          Comments <span>{total}</span>
        </h2>
        <p>Join the conversation with readers</p>
      </div>
      {signedIn ? (
        <CommentForm
          chapterId={chapterId}
          parentId={null}
          label="Add a comment"
        />
      ) : (
        <p className="comment-signin">
          <Link href="/login">Sign in</Link> to join the conversation.
        </p>
      )}
      {comments.length > 0 && (
        <ul className="comment-list">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              chapterId={chapterId}
              signedIn={signedIn}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
