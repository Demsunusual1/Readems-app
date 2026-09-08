import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  isReadingPositionValid,
  isStoryFinished,
  progressSchema,
  storyPercent,
} from '@/lib/chapters';
import {
  getChapterByNumber,
  getPublishedChapters,
  getStory,
} from '@/lib/stories';
import { isSameOrigin } from '@/lib/http';
import { notify } from '@/lib/notifications';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { error: 'Sign in to access your reading progress.' },
      { status: 401 },
    );
  const storyId = new URL(request.url).searchParams.get('storyId') ?? '';
  if (!(await getStory(storyId)))
    return NextResponse.json({ error: 'Story not found.' }, { status: 404 });
  try {
    const progress = await prisma.readingProgress.findUnique({
      where: { userId_storyId: { userId: user.id, storyId } },
      select: { chapter: true, paragraph: true, completed: true },
    });
    return NextResponse.json(
      { progress },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch {
    return NextResponse.json(
      { error: 'Saved progress is temporarily unavailable.' },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: 'Invalid request origin.' },
      { status: 403 },
    );
  if (!request.headers.get('content-type')?.includes('application/json'))
    return NextResponse.json({ error: 'JSON required.' }, { status: 415 });
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { error: 'Sign in to save your reading progress.' },
      { status: 401 },
    );
  const parsed = progressSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Invalid reading position.' },
      { status: 400 },
    );
  const { storyId, ...position } = parsed.data;
  const chapter = await getChapterByNumber(storyId, position.chapter);
  if (!chapter || !isReadingPositionValid(chapter.paragraphs.length, position))
    return NextResponse.json(
      { error: 'Invalid reading position.' },
      { status: 400 },
    );
  const chapterNumbers = (await getPublishedChapters(storyId)).map(
    (published) => published.number,
  );
  const finished = isStoryFinished(chapterNumbers, position);
  const stored = {
    ...position,
    percent: storyPercent(chapterNumbers, position, chapter.paragraphs.length),
  };
  const alreadyFinished = Boolean(
    (
      await prisma.readingProgress.findUnique({
        where: { userId_storyId: { userId: user.id, storyId } },
        select: { completedAt: true },
      })
    )?.completedAt,
  );
  try {
    await prisma.readingProgress.upsert({
      where: { userId_storyId: { userId: user.id, storyId } },
      create: {
        userId: user.id,
        storyId,
        ...stored,
        completedAt: finished ? new Date() : null,
      },
      // Finishing a story is remembered even if the reader opens it again.
      update: finished ? { ...stored, completedAt: new Date() } : stored,
    });
    if (finished && !alreadyFinished) {
      const year = new Date().getFullYear();
      const [story, booksThisYear] = await Promise.all([
        getStory(storyId),
        prisma.readingProgress.count({
          where: {
            userId: user.id,
            completedAt: { gte: new Date(Date.UTC(year, 0, 1)) },
          },
        }),
      ]);
      if (story)
        await notify({
          userId: user.id,
          kind: 'MILESTONE',
          category: 'READING',
          title: 'Reading milestone',
          body: `You finished ${story.title}. That is ${booksThisYear} ${booksThisYear === 1 ? 'story' : 'stories'} this year.`,
          href: '/library',
        });
    }
    return NextResponse.json(
      { saved: true },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch {
    return NextResponse.json(
      { error: 'Your place could not be saved. Please try again.' },
      { status: 503 },
    );
  }
}
