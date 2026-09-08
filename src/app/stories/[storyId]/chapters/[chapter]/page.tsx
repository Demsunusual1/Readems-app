import { notFound } from 'next/navigation';
import { ChapterReader } from '@/components/chapter-reader';
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
  const chapters = await getPublishedChapters(story.id);
  return (
    <ChapterReader
      key={`${story.id}-${chapter.number}`}
      storyId={story.id}
      storyTitle={story.title}
      chapter={chapter}
      total={chapters.length}
    />
  );
}
