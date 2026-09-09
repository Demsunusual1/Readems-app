import { prisma } from './prisma';
import { notifyMany } from './notifications';
import { isBlockedBetween } from './settings';

export type MessagePerson = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

export type ConversationSummary = {
  id: string;
  isGroup: boolean;
  title: string;
  otherPerson: MessagePerson | null;
  participants: MessagePerson[];
  updatedAt: Date;
  unread: number;
  lastMessage: {
    body: string;
    createdAt: Date;
    senderName: string;
    mine: boolean;
  } | null;
};

export type ThreadMessage = {
  id: string;
  body: string;
  createdAt: Date;
  mine: boolean;
  sender: MessagePerson;
};

export type ConversationThread = {
  id: string;
  isGroup: boolean;
  title: string;
  otherPerson: MessagePerson | null;
  participants: MessagePerson[];
  messages: ThreadMessage[];
};

const MAX_BODY = 2000;

const personSelect = {
  id: true,
  fullName: true,
  username: true,
  avatarUrl: true,
} as const;

type PersonRow = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
};

function toPerson(row: PersonRow): MessagePerson {
  return {
    id: row.id,
    name: row.fullName,
    username: row.username,
    avatarUrl: row.avatarUrl,
  };
}

/** What a conversation is called to the person looking at it. */
function conversationTitle(
  isGroup: boolean,
  title: string | null,
  others: MessagePerson[],
) {
  if (isGroup) return title ?? 'Group conversation';
  return others[0]?.name ?? title ?? 'Conversation';
}

export async function startConversation(userId: string, otherUserId: string) {
  if (userId === otherUserId) throw new Error('You cannot message yourself.');
  if (await isBlockedBetween(userId, otherUserId))
    throw new Error('You cannot message this person.');

  // A one-to-one conversation is one whose members are exactly these two, so
  // the same pair always lands back in the thread they already have.
  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } },
        { participants: { every: { userId: { in: [userId, otherUserId] } } } },
      ],
    },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      isGroup: false,
      participants: { create: [{ userId }, { userId: otherUserId }] },
    },
  });
}

async function requireMembership(userId: string, conversationId: string) {
  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!membership) throw new Error('That conversation is not yours.');
  return membership;
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  body: string,
) {
  const text = body.trim();
  if (!text) throw new Error('Write something before sending.');
  if (text.length > MAX_BODY)
    throw new Error(`A message can be up to ${MAX_BODY} characters.`);
  await requireMembership(userId, conversationId);

  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, body: text },
  });
  // The inbox is ordered by this, so a new message has to move it.
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const [sender, members] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    }),
    prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    }),
  ]);
  if (sender)
    await notifyMany(
      members.map((member) => member.userId),
      {
        actorId: userId,
        kind: 'REPLY',
        category: 'COMMUNITY',
        title: 'New message',
        body: `${sender.fullName} sent you a message.`,
        href: `/messages/${conversationId}`,
      },
    );
  return message;
}

type Membership = { conversationId: string; lastReadAt: Date | null };

/** Messages from other people that arrived after the reader last looked. */
function unreadWhere(userId: string, memberships: Membership[]) {
  return {
    senderId: { not: userId },
    OR: memberships.map((membership) => ({
      conversationId: membership.conversationId,
      ...(membership.lastReadAt
        ? { createdAt: { gt: membership.lastReadAt } }
        : {}),
    })),
  };
}

export async function getConversations(
  userId: string,
): Promise<ConversationSummary[]> {
  const memberships = await prisma.conversationMember.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });
  if (memberships.length === 0) return [];

  const [conversations, unreadRows] = await Promise.all([
    prisma.conversation.findMany({
      where: { id: { in: memberships.map((row) => row.conversationId) } },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: { include: { user: { select: personSelect } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: personSelect } },
        },
      },
    }),
    prisma.message.groupBy({
      by: ['conversationId'],
      where: unreadWhere(userId, memberships),
      _count: { _all: true },
    }),
  ]);
  const unread = new Map(
    unreadRows.map((row) => [row.conversationId, row._count._all]),
  );

  return conversations.map((conversation) => {
    const participants = conversation.participants.map((member) =>
      toPerson(member.user),
    );
    const others = participants.filter((person) => person.id !== userId);
    const last = conversation.messages[0];
    return {
      id: conversation.id,
      isGroup: conversation.isGroup,
      title: conversationTitle(
        conversation.isGroup,
        conversation.title,
        others,
      ),
      otherPerson: conversation.isGroup ? null : (others[0] ?? null),
      participants,
      updatedAt: conversation.updatedAt,
      unread: unread.get(conversation.id) ?? 0,
      lastMessage: last
        ? {
            body: last.body,
            createdAt: last.createdAt,
            senderName: last.sender.fullName,
            mine: last.senderId === userId,
          }
        : null,
    };
  });
}

export async function getConversation(
  conversationId: string,
  userId: string,
): Promise<ConversationThread | null> {
  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!membership) return null;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: { include: { user: { select: personSelect } } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: personSelect } },
      },
    },
  });
  if (!conversation) return null;

  const participants = conversation.participants.map((member) =>
    toPerson(member.user),
  );
  const others = participants.filter((person) => person.id !== userId);
  return {
    id: conversation.id,
    isGroup: conversation.isGroup,
    title: conversationTitle(conversation.isGroup, conversation.title, others),
    otherPerson: conversation.isGroup ? null : (others[0] ?? null),
    participants,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      mine: message.senderId === userId,
      sender: toPerson(message.sender),
    })),
  };
}

export async function markConversationRead(
  userId: string,
  conversationId: string,
) {
  await prisma.conversationMember.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

export async function countUnreadMessages(userId: string) {
  const memberships = await prisma.conversationMember.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });
  if (memberships.length === 0) return 0;
  return prisma.message.count({ where: unreadWhere(userId, memberships) });
}

export async function searchPeopleToMessage(
  userId: string,
  term: string,
  take = 8,
): Promise<MessagePerson[]> {
  const query = term.trim();
  if (!query) return [];
  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const excluded = new Set([userId]);
  for (const block of blocks) {
    excluded.add(block.blockerId);
    excluded.add(block.blockedId);
  }
  const rows = await prisma.user.findMany({
    where: {
      id: { notIn: [...excluded] },
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { followers: { _count: 'desc' } },
    take,
    select: personSelect,
  });
  return rows.map(toPerson);
}
