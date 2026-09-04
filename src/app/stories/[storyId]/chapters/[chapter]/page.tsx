import { notFound } from 'next/navigation';
import { catalogue } from '@/lib/discover';
import { getChapter, getChapters } from '@/lib/chapters';
import { ChapterReader } from '@/components/chapter-reader';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ storyId: string; chapter: string }>;
}) {
  const route = await params;
  const story = catalogue.find((item) => item.id === route.storyId);
  const chapter = getChapter(route.storyId, Number(route.chapter));
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
  const story = catalogue.find((item) => item.id === route.storyId);
  const chapter = getChapter(route.storyId, Number(route.chapter));
  if (!story || !chapter || !/^[1-9]\d*$/.test(route.chapter)) notFound();
  return (
    <ChapterReader
      key={`${story.id}-${chapter.number}`}
      storyId={story.id}
      storyTitle={story.title}
      chapter={chapter}
      total={getChapters(story.id).length}
    />
  );
}
