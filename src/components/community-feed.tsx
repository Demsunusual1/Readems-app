'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChatCircle,
  Feather,
  Heart,
  PaperPlaneRight,
  UserCircle,
} from '@phosphor-icons/react';
import { relativeTime } from '@/lib/time';
import {
  likePost,
  publishPost,
  removePost,
  replyToPost,
} from '@/app/community/actions';
import { ReportButton } from './report-button';

export type FeedPost = {
  id: string;
  body: string;
  title: string | null;
  topic: string | null;
  createdAt: string;
  likes: number;
  comments: number;
  liked: boolean;
  mine: boolean;
  groupName: string | null;
  promptTitle: string | null;
  story: { id: string; title: string; coverUrl: string } | null;
  author: { name: string; username: string; avatarUrl: string | null };
  replies: {
    id: string;
    body: string;
    createdAt: string;
    author: { name: string; username: string; avatarUrl: string | null };
  }[];
};

function Avatar({ url, size = 44 }: { url: string | null; size?: number }) {
  return url ? (
    <Image
      src={url}
      alt=""
      width={size}
      height={size}
      className="feed-avatar"
    />
  ) : (
    <UserCircle size={size} aria-hidden="true" className="feed-avatar" />
  );
}

export function Composer({
  groupId,
  promptId,
  promptTitle,
  topics,
  placeholder,
}: {
  groupId: string | null;
  promptId?: string | null;
  promptTitle?: string | null;
  topics?: readonly string[];
  placeholder?: string;
}) {
  const router = useRouter();
  const [state, submit] = useActionState(
    publishPost.bind(null, groupId, promptId ?? null),
    null,
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
    // A successful post is the only thing worth refreshing for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={submit} className="composer">
      {promptTitle && (
        <p className="composer-prompt">Answering: {promptTitle}</p>
      )}
      <label className="sr-only" htmlFor={`post-${groupId ?? 'community'}`}>
        Share a thought
      </label>
      <textarea
        id={`post-${groupId ?? 'community'}`}
        name="body"
        rows={3}
        required
        maxLength={4000}
        placeholder={placeholder ?? 'Share a thought, question, or a line…'}
      />
      <div className="composer-actions">
        {topics && (
          <label>
            <span className="sr-only">Topic</span>
            <select name="topic" defaultValue="">
              <option value="">No topic</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="submit">
          <Feather weight="fill" aria-hidden="true" /> Post
        </button>
      </div>
      {state?.message && <p role="status">{state.message}</p>}
    </form>
  );
}

function Reply({ post, groupId }: { post: FeedPost; groupId: string | null }) {
  const router = useRouter();
  const [state, submit] = useActionState(
    replyToPost.bind(null, post.id, groupId),
    null,
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={submit} className="feed-reply-form">
      <label className="sr-only" htmlFor={`reply-${post.id}`}>
        Reply to {post.author.name}
      </label>
      <input
        id={`reply-${post.id}`}
        name="body"
        required
        maxLength={2000}
        placeholder="Write a reply…"
      />
      <button type="submit" aria-label={`Send reply to ${post.author.name}`}>
        <PaperPlaneRight weight="fill" />
      </button>
      {state?.message && <p role="alert">{state.message}</p>}
    </form>
  );
}

export function CommunityFeed({
  posts,
  signedIn,
  groupId = null,
  emptyMessage = 'No posts yet. Start the conversation.',
}: {
  posts: FeedPost[];
  signedIn: boolean;
  groupId?: string | null;
  emptyMessage?: string;
}) {
  const [openReply, setOpenReply] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (posts.length === 0) return <p className="feed-empty">{emptyMessage}</p>;

  return (
    <ul className="feed-list">
      {posts.map((post) => (
        <li key={post.id}>
          <article>
            <header>
              <Avatar url={post.author.avatarUrl} />
              <div>
                <p>
                  <Link href={`/u/${post.author.username}`}>
                    <b>{post.author.name}</b>
                  </Link>
                  <small>{relativeTime(new Date(post.createdAt))}</small>
                </p>
                <small className="feed-meta">
                  {post.groupName ?? post.topic ?? 'Community'}
                  {post.promptTitle && ` · ${post.promptTitle}`}
                </small>
              </div>
            </header>
            {post.title && <h3>{post.title}</h3>}
            <p className="feed-body">{post.body}</p>
            {post.story && (
              <Link className="feed-story" href={`/stories/${post.story.id}`}>
                <Image
                  src={post.story.coverUrl}
                  alt=""
                  width={44}
                  height={62}
                />
                <span>{post.story.title}</span>
              </Link>
            )}
            <footer>
              <button
                type="button"
                aria-pressed={post.liked}
                aria-label={
                  post.liked
                    ? `Remove your like from ${post.author.name}’s post`
                    : `Like ${post.author.name}’s post`
                }
                disabled={!signedIn || pending}
                onClick={() =>
                  startTransition(async () => {
                    await likePost(post.id, groupId);
                    router.refresh();
                  })
                }
              >
                <Heart weight={post.liked ? 'fill' : 'regular'} /> {post.likes}
              </button>
              <button
                type="button"
                aria-label={`Replies to ${post.author.name}’s post`}
                onClick={() =>
                  setOpenReply(openReply === post.id ? null : post.id)
                }
                aria-expanded={openReply === post.id}
              >
                <ChatCircle /> {post.comments}
              </button>
              {!post.mine && (
                <ReportButton
                  targetType="POST"
                  targetId={post.id}
                  signedIn={signedIn}
                  label={`Report ${post.author.name}’s post`}
                />
              )}
              {post.mine && (
                <button
                  type="button"
                  className="feed-delete"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await removePost(post.id, groupId);
                      router.refresh();
                    })
                  }
                >
                  Delete
                </button>
              )}
            </footer>
            {post.replies.length > 0 && (
              <ul className="feed-replies">
                {post.replies.map((reply) => (
                  <li key={reply.id}>
                    <Avatar url={reply.author.avatarUrl} size={32} />
                    <div>
                      <p>
                        <b>{reply.author.name}</b>{' '}
                        <small>{relativeTime(new Date(reply.createdAt))}</small>
                      </p>
                      <p>{reply.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {openReply === post.id &&
              (signedIn ? (
                <Reply post={post} groupId={groupId} />
              ) : (
                <p className="feed-signin">
                  <Link href="/login">Sign in</Link> to reply.
                </p>
              ))}
          </article>
        </li>
      ))}
    </ul>
  );
}
