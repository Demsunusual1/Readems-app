import { notFound } from 'next/navigation';
import { ChapterReader } from '@/components/chapter-reader';
import { getCurrentUser } from '@/lib/auth';
import { getComments } from '@/lib/comments';
import { getSettings } from '@/lib/settings';
import {
  getChapterByNumber,
  getPublishedChapters,
  getStory,
} from '@/lib/stories';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storyId: string; chapter: string }>;
}) {
  const route = await params;
  const story = await getStory(route.storyId);
  const chapter = story
    ? await getChapterByNumber(route.storyId, Number(route.chapter))
    : null;
  return {
    title:
      story && chapter
        ? `${chapter.title} — ${story.title} | Readems`
        : 'Chapter not found | Readems',
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ storyId: string; chapter: string }>;
}) {
  const route = await params;
  if (!/^[1-9]\d*$/.test(route.chapter)) notFound();
  const story = await getStory(route.storyId);
  if (!story) notFound();
  const chapter = await getChapterByNumber(story.id, Number(route.chapter));
  if (!chapter) notFound();
  const user = await getCurrentUser();
  const [chapters, comments, settings] = await Promise.all([
    getPublishedChapters(story.id),
    getComments(chapter.id, user?.id ?? null),
    user ? getSettings(user.id) : null,
  ]);

  return (
    <ChapterReader
      key={`${story.id}-${chapter.number}`}
      storyId={story.id}
      storyTitle={story.title}
      chapter={chapter}
      chapterId={chapter.id}
      total={chapters.length}
      signedIn={Boolean(user)}
      defaultNight={settings?.theme === 'dark'}
      comments={comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        replies: comment.replies.map((reply) => ({
          ...reply,
          createdAt: reply.createdAt.toISOString(),
          replies: [],
        })),
      }))}
    />
  );
}
