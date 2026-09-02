import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { catalogue } from '@/lib/discover';
import { prisma } from '@/lib/prisma';
import { getReadingStory } from '@/lib/reading';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    storyId?: string;
    chapterNumber?: number;
    progressPercent?: number;
  };
  const story = body.storyId ? getReadingStory(body.storyId) : undefined;
  const chapter = story?.chapters.find(
    (item) => item.number === body.chapterNumber,
  );
  if (!story || !chapter || !catalogue.some((item) => item.id === story.id)) {
    return NextResponse.json(
      { error: 'Invalid story progress' },
      { status: 400 },
    );
  }

  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(body.progressPercent ?? 0)),
  );
  const progress = await prisma.readingProgress.upsert({
    where: { userId_storyId: { userId: user.id, storyId: story.id } },
    update: { chapterNumber: chapter.number, progressPercent },
    create: {
      userId: user.id,
      storyId: story.id,
      chapterNumber: chapter.number,
      progressPercent,
    },
  });

  return NextResponse.json({ progress });
}
