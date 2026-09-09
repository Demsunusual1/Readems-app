import { prisma } from './prisma';

/**
 * Readems rooms are written conversations. Nothing here carries audio: a room
 * is a live thread that people join, and the page keeps up by polling for the
 * messages posted since the last one it saw.
 */

export const roomReactionKinds = ['heart', 'clap', 'star'] as const;
export type RoomReactionKind = (typeof roomReactionKinds)[number];

const MESSAGE_LIMIT = 500;
const RECENT_MESSAGES = 50;

export type RoomPerson = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  handRaised: boolean;
  onStage: boolean;
  joinedAt: Date;
};

export type RoomSummary = {
  id: string;
  title: string;
  tagline: string;
  coverUrl: string | null;
  isLive: boolean;
  createdAt: Date;
  host: { name: string; username: string; avatarUrl: string | null };
  people: number;
  messageCount: number;
  isParticipant: boolean;
  isHost: boolean;
};

export type RoomMessageView = {
  id: string;
  body: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
};

export type RoomDetail = RoomSummary & {
  description: string;
  hostId: string;
  hostBio: string | null;
  onStage: RoomPerson[];
  inRoom: RoomPerson[];
  reactions: Record<RoomReactionKind, number>;
  myReactions: RoomReactionKind[];
  handRaised: boolean;
  messages: RoomMessageView[];
};

/** A readable id derived from the title, kept unique with a short suffix. */
export function roomSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'room';
}

function isReactionKind(kind: string): kind is RoomReactionKind {
  return (roomReactionKinds as readonly string[]).includes(kind);
}

const personSelect = {
  select: { id: true, fullName: true, username: true, avatarUrl: true },
} as const;

type ParticipantRow = {
  userId: string;
  handRaised: boolean;
  onStage: boolean;
  joinedAt: Date;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl: string | null;
  };
};

function toPerson(row: ParticipantRow): RoomPerson {
  return {
    id: row.user.id,
    name: row.user.fullName,
    username: row.user.username,
    avatarUrl: row.user.avatarUrl,
    handRaised: row.handRaised,
    onStage: row.onStage,
    joinedAt: row.joinedAt,
  };
}

export async function createRoom(
  userId: string,
  input: {
    title: string;
    tagline: string;
    description: string;
    coverUrl?: string;
  },
) {
  const title = input.title.trim();
  if (title.length < 3 || title.length > 70)
    throw new Error('A room title needs between 3 and 70 characters.');
  const tagline = input.tagline.trim();
  if (tagline.length < 5)
    throw new Error('Say in one line what the room is about.');

  let id = roomSlug(title);
  if (await prisma.room.findUnique({ where: { id } }))
    id = `${id}-${Math.random().toString(36).slice(2, 6)}`;

  // The host is a participant like everybody else, so the count of people in
  // the room is always the number of rows and never a number we maintain.
  return prisma.room.create({
    data: {
      id,
      title,
      tagline,
      description: input.description.trim(),
      coverUrl: input.coverUrl ?? null,
      hostId: userId,
      participants: { create: { userId, onStage: true } },
    },
  });
}

async function requireLiveRoom(roomId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error('That room does not exist.');
  if (!room.isLive) throw new Error('That room has ended.');
  return room;
}

export async function joinRoom(userId: string, roomId: string) {
  await requireLiveRoom(roomId);
  await prisma.roomParticipant.upsert({
    where: { roomId_userId: { roomId, userId } },
    create: { roomId, userId },
    update: {},
  });
}

export async function leaveRoom(userId: string, roomId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return;
  if (room.hostId === userId)
    throw new Error('A host cannot leave their own room. Close it instead.');
  const participant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!participant) return;
  await prisma.roomParticipant.delete({
    where: { roomId_userId: { roomId, userId } },
  });
}

/** Raises or lowers a hand, and reports the state it settled on. */
export async function raiseHand(userId: string, roomId: string) {
  const participant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!participant) throw new Error('Join the room before raising a hand.');
  const handRaised = !participant.handRaised;
  await prisma.roomParticipant.update({
    where: { roomId_userId: { roomId, userId } },
    data: { handRaised },
  });
  return handRaised;
}

export async function setOnStage(
  hostId: string,
  roomId: string,
  userId: string,
  onStage: boolean,
) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error('That room does not exist.');
  if (room.hostId !== hostId)
    throw new Error('Only the host can change who is on stage.');
  const participant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!participant) throw new Error('That person is not in the room.');
  await prisma.roomParticipant.update({
    where: { roomId_userId: { roomId, userId } },
    // Coming on stage answers a raised hand, so the hand goes back down.
    data: { onStage, handRaised: onStage ? false : participant.handRaised },
  });
}

export async function postRoomMessage(
  userId: string,
  roomId: string,
  body: string,
) {
  await requireLiveRoom(roomId);
  const participant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!participant) throw new Error('Join the room before writing in it.');
  const text = body.trim();
  if (!text) throw new Error('Write something first.');
  if (text.length > MESSAGE_LIMIT)
    throw new Error(`Keep it under ${MESSAGE_LIMIT} characters.`);
  return prisma.roomMessage.create({
    data: { roomId, userId, body: text },
  });
}

/** Adds or removes one reaction, and reports whether it now stands. */
export async function reactToRoom(
  userId: string,
  roomId: string,
  kind: RoomReactionKind,
) {
  if (!isReactionKind(kind)) throw new Error('That is not a reaction.');
  const existing = await prisma.roomReaction.findUnique({
    where: { roomId_userId_kind: { roomId, userId, kind } },
  });
  if (existing) {
    await prisma.roomReaction.delete({
      where: { roomId_userId_kind: { roomId, userId, kind } },
    });
    return false;
  }
  await requireLiveRoom(roomId);
  await prisma.roomReaction.create({ data: { roomId, userId, kind } });
  return true;
}

export async function getRooms(options: {
  viewerId: string | null;
  take?: number;
  includeClosed?: boolean;
  hostId?: string;
}): Promise<RoomSummary[]> {
  const rooms = await prisma.room.findMany({
    where: {
      ...(options.includeClosed ? {} : { isLive: true }),
      ...(options.hostId ? { hostId: options.hostId } : {}),
    },
    orderBy: [{ isLive: 'desc' }, { createdAt: 'desc' }],
    take: options.take ?? 24,
    include: {
      host: personSelect,
      _count: { select: { participants: true, messages: true } },
      participants: options.viewerId
        ? { where: { userId: options.viewerId }, select: { userId: true } }
        : false,
    },
  });
  return rooms.map((room) => ({
    id: room.id,
    title: room.title,
    tagline: room.tagline,
    coverUrl: room.coverUrl,
    isLive: room.isLive,
    createdAt: room.createdAt,
    host: {
      name: room.host.fullName,
      username: room.host.username,
      avatarUrl: room.host.avatarUrl,
    },
    people: room._count.participants,
    messageCount: room._count.messages,
    isParticipant:
      Array.isArray(room.participants) && room.participants.length > 0,
    isHost: room.hostId === options.viewerId,
  }));
}

/**
 * The strip of rooms on the community page: the busiest live rooms first, so
 * a reader lands somewhere with a conversation already going.
 */
export async function getFeaturedRooms(options: {
  viewerId: string | null;
  take?: number;
}): Promise<RoomSummary[]> {
  const rooms = await getRooms({ viewerId: options.viewerId, take: 24 });
  return rooms
    .sort((a, b) => b.people - a.people || b.messageCount - a.messageCount)
    .slice(0, options.take ?? 4);
}

export async function getRoom(
  roomId: string,
  viewerId: string | null,
): Promise<RoomDetail | null> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      host: {
        select: {
          id: true,
          fullName: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      },
      _count: { select: { participants: true, messages: true } },
      participants: {
        orderBy: { joinedAt: 'asc' },
        include: { user: personSelect },
      },
      reactions: { select: { kind: true, userId: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: RECENT_MESSAGES,
        include: { user: personSelect },
      },
    },
  });
  if (!room) return null;

  const people = room.participants.map(toPerson);
  const reactions: Record<RoomReactionKind, number> = {
    heart: 0,
    clap: 0,
    star: 0,
  };
  const myReactions: RoomReactionKind[] = [];
  for (const reaction of room.reactions) {
    if (!isReactionKind(reaction.kind)) continue;
    reactions[reaction.kind] += 1;
    if (reaction.userId === viewerId) myReactions.push(reaction.kind);
  }
  const viewer = people.find((person) => person.id === viewerId);

  return {
    id: room.id,
    title: room.title,
    tagline: room.tagline,
    description: room.description,
    coverUrl: room.coverUrl,
    isLive: room.isLive,
    createdAt: room.createdAt,
    hostId: room.hostId,
    hostBio: room.host.bio,
    host: {
      name: room.host.fullName,
      username: room.host.username,
      avatarUrl: room.host.avatarUrl,
    },
    people: room._count.participants,
    messageCount: room._count.messages,
    messages: room.messages
      .map((message) => ({
        id: message.id,
        body: message.body,
        createdAt: message.createdAt,
        author: {
          id: message.user.id,
          name: message.user.fullName,
          username: message.user.username,
          avatarUrl: message.user.avatarUrl,
        },
      }))
      .reverse(),
    onStage: people.filter((person) => person.onStage),
    inRoom: people.filter((person) => !person.onStage),
    reactions,
    myReactions: roomReactionKinds.filter((kind) => myReactions.includes(kind)),
    isParticipant: Boolean(viewer),
    isHost: room.hostId === viewerId,
    handRaised: viewer?.handRaised ?? false,
  };
}

/**
 * What the poll asks for: everything said after the newest message the page
 * already shows. Without `since` it returns the recent tail instead.
 */
export async function getRoomMessages(
  roomId: string,
  since?: Date,
): Promise<RoomMessageView[]> {
  const messages = await prisma.roomMessage.findMany({
    where: { roomId, ...(since ? { createdAt: { gt: since } } : {}) },
    orderBy: { createdAt: since ? 'asc' : 'desc' },
    take: RECENT_MESSAGES,
    include: { user: personSelect },
  });
  const ordered = since ? messages : messages.reverse();
  return ordered.map((message) => ({
    id: message.id,
    body: message.body,
    createdAt: message.createdAt,
    author: {
      id: message.user.id,
      name: message.user.fullName,
      username: message.user.username,
      avatarUrl: message.user.avatarUrl,
    },
  }));
}

export async function closeRoom(hostId: string, roomId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error('That room does not exist.');
  if (room.hostId !== hostId)
    throw new Error('Only the host can close the room.');
  await prisma.room.update({ where: { id: roomId }, data: { isLive: false } });
}
