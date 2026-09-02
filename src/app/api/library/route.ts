import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { catalogue } from '@/lib/discover';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as { storyId?: string; saved?: boolean };
  const story = catalogue.find((item) => item.id === body.storyId);
  if (!story || typeof body.saved !== 'boolean') {
    return NextResponse.json({ error: 'Invalid library request' }, { status: 400 });
  }

  if (body.saved) {
    await prisma.libraryEntry.upsert({
      where: { userId_storyId: { userId: user.id, storyId: story.id } },
      update: {},
      create: { userId: user.id, storyId: story.id },
    });
  } else {
    await prisma.libraryEntry.deleteMany({
      where: { userId: user.id, storyId: story.id },
    });
  }

  return NextResponse.json({ saved: body.saved });
}
