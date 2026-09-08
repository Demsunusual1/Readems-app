import { prisma } from './prisma';

export type GroupSummary = {
  id: string;
  name: string;
  tagline: string;
  topic: string;
  coverUrl: string | null;
  isPublic: boolean;
  members: number;
  isMember: boolean;
  role: 'MEMBER' | 'MODERATOR' | 'FOUNDER' | null;
};

export type GroupEventView = {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  going: number;
  attending: boolean;
};

export type GroupDetail = GroupSummary & {
  description: string;
  createdAt: Date;
  moderators: {
    name: string;
    username: string;
    avatarUrl: string | null;
    role: string;
  }[];
  events: GroupEventView[];
};

/** A readable id derived from the name, kept unique with a short suffix. */
export function groupSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'group';
}

export async function createGroup(
  userId: string,
  input: {
    name: string;
    tagline: string;
    description: string;
    topic: string;
    isPublic?: boolean;
    coverUrl?: string;
  },
) {
  const name = input.name.trim();
  if (name.length < 3 || name.length > 60)
    throw new Error('A group name needs between 3 and 60 characters.');
  const tagline = input.tagline.trim();
  if (tagline.length < 5)
    throw new Error('Say in one line what the group is for.');

  let id = groupSlug(name);
  if (await prisma.group.findUnique({ where: { id } }))
    id = `${id}-${Math.random().toString(36).slice(2, 6)}`;

  return prisma.group.create({
    data: {
      id,
      name,
      tagline,
      description: input.description.trim(),
      topic: input.topic,
      isPublic: input.isPublic ?? true,
      coverUrl: input.coverUrl ?? null,
      createdById: userId,
      members: { create: { userId, role: 'FOUNDER' } },
    },
  });
}

export async function joinGroup(userId: string, groupId: string) {
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId, userId } },
    create: { groupId, userId },
    update: {},
  });
}

export async function leaveGroup(userId: string, groupId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership) return;
  if (membership.role === 'FOUNDER')
    throw new Error('A founder cannot leave their own group.');
  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } },
  });
}

export async function getGroups(options: {
  viewerId: string | null;
  joined?: boolean;
  topic?: string;
  query?: string;
  take?: number;
}): Promise<GroupSummary[]> {
  const term = options.query?.trim();
  const groups = await prisma.group.findMany({
    where: {
      ...(options.topic ? { topic: options.topic } : {}),
      ...(options.joined && options.viewerId
        ? { members: { some: { userId: options.viewerId } } }
        : {}),
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { tagline: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
              { topic: { contains: term, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: options.take ?? 30,
    include: {
      _count: { select: { members: true } },
      members: options.viewerId
        ? { where: { userId: options.viewerId }, select: { role: true } }
        : false,
    },
  });
  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    tagline: group.tagline,
    topic: group.topic,
    coverUrl: group.coverUrl,
    isPublic: group.isPublic,
    members: group._count.members,
    isMember: Array.isArray(group.members) && group.members.length > 0,
    role: Array.isArray(group.members)
      ? (group.members[0]?.role ?? null)
      : null,
  }));
}

export async function getGroup(
  groupId: string,
  viewerId: string | null,
): Promise<GroupDetail | null> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      _count: { select: { members: true } },
      members: {
        where: { role: { in: ['FOUNDER', 'MODERATOR'] } },
        include: {
          user: { select: { fullName: true, username: true, avatarUrl: true } },
        },
      },
      events: {
        orderBy: { startsAt: 'asc' },
        include: {
          _count: { select: { rsvps: true } },
          rsvps: viewerId
            ? { where: { userId: viewerId }, select: { userId: true } }
            : false,
        },
      },
    },
  });
  if (!group) return null;
  const membership = viewerId
    ? await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: viewerId } },
      })
    : null;

  return {
    id: group.id,
    name: group.name,
    tagline: group.tagline,
    description: group.description,
    topic: group.topic,
    coverUrl: group.coverUrl,
    isPublic: group.isPublic,
    createdAt: group.createdAt,
    members: group._count.members,
    isMember: Boolean(membership),
    role: membership?.role ?? null,
    moderators: group.members.map((member) => ({
      name: member.user.fullName,
      username: member.user.username,
      avatarUrl: member.user.avatarUrl,
      role: member.role === 'FOUNDER' ? 'Founder' : 'Moderator',
    })),
    events: group.events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      going: event._count.rsvps,
      attending: Array.isArray(event.rsvps) ? event.rsvps.length > 0 : false,
    })),
  };
}

async function requireModerator(userId: string, groupId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership || membership.role === 'MEMBER')
    throw new Error('Only a moderator can do that.');
  return membership;
}

export async function createGroupEvent(
  userId: string,
  groupId: string,
  input: { title: string; description: string; startsAt: Date },
) {
  await requireModerator(userId, groupId);
  const title = input.title.trim();
  if (title.length < 3) throw new Error('Give the event a name.');
  if (Number.isNaN(input.startsAt.getTime()))
    throw new Error('Choose when the event starts.');
  return prisma.groupEvent.create({
    data: {
      groupId,
      title,
      description: input.description.trim(),
      startsAt: input.startsAt,
      createdById: userId,
    },
  });
}

export async function toggleRsvp(userId: string, eventId: string) {
  const existing = await prisma.groupEventRsvp.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (existing) {
    await prisma.groupEventRsvp.delete({
      where: { eventId_userId: { eventId, userId } },
    });
    return false;
  }
  await prisma.groupEventRsvp.create({ data: { eventId, userId } });
  return true;
}
