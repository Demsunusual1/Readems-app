import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { progressSchema, getChapters } from '@/lib/chapters';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { error: 'Sign in to access your reading progress.' },
      { status: 401 },
    );
  const storyId = new URL(request.url).searchParams.get('storyId') ?? '';
  if (!getChapters(storyId).length)
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
  if (request.headers.get('origin') !== new URL(request.url).origin)
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
  try {
    await prisma.readingProgress.upsert({
      where: { userId_storyId: { userId: user.id, storyId } },
      create: { userId: user.id, storyId, ...position },
      update: position,
    });
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
