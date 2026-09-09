import { NextResponse } from 'next/server';
import { getRoomMessages } from '@/lib/rooms';
import { prisma } from '@/lib/prisma';

/**
 * The endpoint the room page polls. It answers with what was said after the
 * newest message the page already has, so a poll that finds nothing new costs
 * one empty array rather than the whole discussion again.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  if (!(await prisma.room.findUnique({ where: { id: roomId } })))
    return NextResponse.json({ error: 'Room not found.' }, { status: 404 });

  const value = new URL(request.url).searchParams.get('since');
  const since = value ? new Date(value) : undefined;
  if (since && Number.isNaN(since.getTime()))
    return NextResponse.json({ error: 'Invalid since.' }, { status: 400 });

  try {
    const messages = await getRoomMessages(roomId, since);
    return NextResponse.json(
      {
        messages: messages.map((message) => ({
          ...message,
          createdAt: message.createdAt.toISOString(),
        })),
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch {
    return NextResponse.json(
      { error: 'The discussion is temporarily unavailable.' },
      { status: 503 },
    );
  }
}
