import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  countUnreadMessages,
  getConversation,
  getConversations,
  markConversationRead,
  searchPeopleToMessage,
  sendMessage,
  startConversation,
} from './messages';
import { getNotifications } from './notifications';
import { blockPerson, unblockPerson } from './settings';
import { prisma } from './prisma';
import {
  createTestUser,
  deleteTestUsers,
  uniqueSuffix,
} from '@/test/factories';

let niaId: string;
let kwameId: string;
let strangerId: string;
let conversationId: string;
let quietConversationId: string;
let searchName: string;

beforeAll(async () => {
  searchName = `Findable ${uniqueSuffix()}`;
  niaId = (await createTestUser({ fullName: 'Nia Okafor' })).id;
  kwameId = (await createTestUser({ fullName: 'Kwame Asante' })).id;
  strangerId = (await createTestUser({ fullName: searchName })).id;
});

afterAll(async () => {
  await deleteTestUsers(niaId, kwameId, strangerId);
  await prisma.conversation.deleteMany({
    where: { id: { in: [conversationId, quietConversationId] } },
  });
});

describe('starting a conversation', () => {
  it('opens one conversation between two people and reuses it', async () => {
    const first = await startConversation(niaId, kwameId);
    conversationId = first.id;
    const second = await startConversation(kwameId, niaId);

    expect(second.id).toBe(first.id);
    expect(first.isGroup).toBe(false);
    expect(
      await prisma.conversationMember.count({
        where: { conversationId: first.id },
      }),
    ).toBe(2);
  });

  it('refuses a conversation with yourself', async () => {
    await expect(startConversation(niaId, niaId)).rejects.toThrow();
  });

  it('refuses a conversation with somebody who blocked you', async () => {
    await blockPerson(strangerId, niaId);
    await expect(startConversation(niaId, strangerId)).rejects.toThrow();
    await expect(startConversation(strangerId, niaId)).rejects.toThrow();
    await unblockPerson(strangerId, niaId);
  });
});

describe('sending a message', () => {
  it('refuses an empty body and one that is too long', async () => {
    await expect(sendMessage(niaId, conversationId, '   ')).rejects.toThrow();
    await expect(
      sendMessage(niaId, conversationId, 'a'.repeat(2001)),
    ).rejects.toThrow();
  });

  it('refuses somebody who is not in the conversation', async () => {
    await expect(
      sendMessage(strangerId, conversationId, 'Let me in.'),
    ).rejects.toThrow();
  });

  it('stores the message, moves the conversation up and tells the other person', async () => {
    quietConversationId = (await startConversation(niaId, strangerId)).id;
    const before = await prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
    });

    const message = await sendMessage(
      niaId,
      conversationId,
      'Loved your latest chapter.',
    );
    expect(message.body).toBe('Loved your latest chapter.');

    const after = await prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
    });
    expect(after.updatedAt.getTime()).toBeGreaterThan(
      before.updatedAt.getTime(),
    );

    const heard = await getNotifications(kwameId);
    expect(heard[0].href).toBe(`/messages/${conversationId}`);
    expect(heard[0].body).toContain('Nia Okafor');

    // The sender hears nothing about their own message.
    expect(
      (await getNotifications(niaId)).some(
        (item) => item.href === `/messages/${conversationId}`,
      ),
    ).toBe(false);
  });
});

describe('the inbox', () => {
  it('lists conversations newest first, with the other person and the last message', async () => {
    const inbox = await getConversations(kwameId);
    const conversation = inbox[0];

    expect(conversation.id).toBe(conversationId);
    expect(conversation.title).toBe('Nia Okafor');
    expect(conversation.otherPerson?.id).toBe(niaId);
    expect(conversation.lastMessage?.body).toBe('Loved your latest chapter.');
    expect(conversation.lastMessage?.mine).toBe(false);
  });

  it('counts what the reader has not read yet', async () => {
    await sendMessage(niaId, conversationId, 'And the ending.');

    const inbox = await getConversations(kwameId);
    expect(inbox[0].unread).toBe(2);
    expect(await countUnreadMessages(kwameId)).toBe(2);

    // Your own messages are never unread to you.
    expect(
      (await getConversations(niaId)).find((item) => item.id === conversationId)
        ?.unread,
    ).toBe(0);
    expect(await countUnreadMessages(niaId)).toBe(0);
  });

  it('clears the count when the conversation is read', async () => {
    await markConversationRead(kwameId, conversationId);

    expect(await countUnreadMessages(kwameId)).toBe(0);
    const inbox = await getConversations(kwameId);
    expect(inbox[0].unread).toBe(0);
  });

  it('clears the count even when a message is timed ahead of the reader', async () => {
    // Message times come from the database and the reading time came from the
    // application, so a clock a moment behind used to leave a message unread
    // for good. Reading is recorded against the messages themselves instead.
    const ahead = await prisma.message.create({
      data: {
        conversationId,
        senderId: niaId,
        body: 'Sent by a clock that runs fast.',
        createdAt: new Date(Date.now() + 5_000),
      },
    });

    try {
      await markConversationRead(kwameId, conversationId);
      expect(await countUnreadMessages(kwameId)).toBe(0);
    } finally {
      await prisma.message.delete({ where: { id: ahead.id } });
    }
  });

  it('shows a conversation with nothing said in it yet', async () => {
    const inbox = await getConversations(strangerId);
    const quiet = inbox.find((item) => item.id === quietConversationId);
    expect(quiet?.lastMessage).toBeNull();
    expect(quiet?.unread).toBe(0);
  });
});

describe('reading a thread', () => {
  it('returns the messages oldest first with their sender', async () => {
    const thread = await getConversation(conversationId, kwameId);

    expect(thread?.messages.map((message) => message.body)).toEqual([
      'Loved your latest chapter.',
      'And the ending.',
    ]);
    expect(thread?.messages[0].sender.name).toBe('Nia Okafor');
    expect(thread?.messages[0].mine).toBe(false);
    expect(thread?.participants.map((person) => person.id).sort()).toEqual(
      [niaId, kwameId].sort(),
    );
    expect(thread?.title).toBe('Nia Okafor');
  });

  it('hides a thread from somebody who is not in it', async () => {
    expect(await getConversation(conversationId, strangerId)).toBeNull();
  });
});

describe('finding somebody to message', () => {
  it('finds people by name and leaves out the reader themselves', async () => {
    const found = await searchPeopleToMessage(niaId, searchName);
    expect(found.map((person) => person.id)).toContain(strangerId);

    expect(
      (await searchPeopleToMessage(niaId, 'Nia Okafor')).map(
        (person) => person.id,
      ),
    ).not.toContain(niaId);
  });

  it('leaves out anybody a block stands between', async () => {
    await blockPerson(niaId, strangerId);
    expect(
      (await searchPeopleToMessage(niaId, searchName)).map(
        (person) => person.id,
      ),
    ).not.toContain(strangerId);
    expect(
      (await searchPeopleToMessage(strangerId, 'Nia Okafor')).map(
        (person) => person.id,
      ),
    ).not.toContain(niaId);
    await unblockPerson(niaId, strangerId);
  });
});
