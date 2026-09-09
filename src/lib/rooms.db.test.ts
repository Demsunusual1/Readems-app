import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeRoom,
  createRoom,
  getRoom,
  getRoomMessages,
  getRooms,
  joinRoom,
  leaveRoom,
  postRoomMessage,
  raiseHand,
  reactToRoom,
  setOnStage,
} from './rooms';
import { createTestUser, deleteTestUsers } from '@/test/factories';

let hostId: string;
let guestId: string;
let strangerId: string;
let roomId: string;

beforeAll(async () => {
  hostId = (await createTestUser({ fullName: 'Nia Host' })).id;
  guestId = (await createTestUser({ fullName: 'Kwame Guest' })).id;
  strangerId = (await createTestUser({ fullName: 'Passing Stranger' })).id;
});

afterAll(async () => {
  await deleteTestUsers(hostId, guestId, strangerId);
});

describe('rooms', () => {
  it('opens a room with its host already on stage', async () => {
    const room = await createRoom(hostId, {
      title: 'African Folklore After Dark',
      tagline: 'Stories. Voices. Heritage.',
      description: 'We read timeless African stories and talk about them.',
    });
    roomId = room.id;
    expect(roomId).toMatch(/^african-folklore-after-dark/);

    const detail = await getRoom(roomId, hostId);
    expect(detail?.isLive).toBe(true);
    expect(detail?.people).toBe(1);
    expect(detail?.isHost).toBe(true);
    expect(detail?.isParticipant).toBe(true);
    expect(detail?.onStage.map((person) => person.id)).toEqual([hostId]);
    expect(detail?.host.name).toBe('Nia Host');
  });

  it('refuses a room without a usable title or tagline', async () => {
    await expect(
      createRoom(hostId, {
        title: 'x',
        tagline: 'Long enough to pass',
        description: 'Fine.',
      }),
    ).rejects.toThrow();
    await expect(
      createRoom(hostId, {
        title: 'A Perfectly Good Title',
        tagline: 'no',
        description: 'Fine.',
      }),
    ).rejects.toThrow();
  });

  it('gives a second room of the same name its own id', async () => {
    const twin = await createRoom(strangerId, {
      title: 'African Folklore After Dark',
      tagline: 'The second sitting of the same fire.',
      description: 'Another night, another telling.',
    });
    expect(twin.id).not.toBe(roomId);
    expect(twin.id).toMatch(/^african-folklore-after-dark/);
    await closeRoom(strangerId, twin.id);
  });

  it('lets somebody join once and leave again', async () => {
    await joinRoom(guestId, roomId);
    await joinRoom(guestId, roomId);
    expect((await getRoom(roomId, guestId))?.people).toBe(2);

    await leaveRoom(guestId, roomId);
    expect((await getRoom(roomId, guestId))?.isParticipant).toBe(false);
    expect((await getRoom(roomId, guestId))?.people).toBe(1);
    await joinRoom(guestId, roomId);
  });

  it('will not let the host walk out of their own room', async () => {
    await expect(leaveRoom(hostId, roomId)).rejects.toThrow();
  });

  it('toggles a raised hand', async () => {
    expect(await raiseHand(guestId, roomId)).toBe(true);
    expect((await getRoom(roomId, guestId))?.handRaised).toBe(true);
    expect(
      (await getRoom(roomId, hostId))?.inRoom.find(
        (person) => person.id === guestId,
      )?.handRaised,
    ).toBe(true);

    expect(await raiseHand(guestId, roomId)).toBe(false);
    expect((await getRoom(roomId, guestId))?.handRaised).toBe(false);
  });

  it('only lets the host move somebody on stage', async () => {
    await expect(setOnStage(guestId, roomId, guestId, true)).rejects.toThrow();

    await setOnStage(hostId, roomId, guestId, true);
    const detail = await getRoom(roomId, hostId);
    expect(detail?.onStage.map((person) => person.id)).toContain(guestId);
    expect(detail?.inRoom.map((person) => person.id)).not.toContain(guestId);

    await setOnStage(hostId, roomId, guestId, false);
    expect(
      (await getRoom(roomId, hostId))?.onStage.map((person) => person.id),
    ).not.toContain(guestId);
  });

  it('takes a message only from somebody who has joined', async () => {
    await expect(
      postRoomMessage(strangerId, roomId, 'Let me in.'),
    ).rejects.toThrow();
    await expect(postRoomMessage(guestId, roomId, '   ')).rejects.toThrow();
    await expect(
      postRoomMessage(guestId, roomId, 'x'.repeat(501)),
    ).rejects.toThrow();

    const message = await postRoomMessage(
      guestId,
      roomId,
      'The Anansi stories teach us that wisdom hides behind laughter.',
    );
    const detail = await getRoom(roomId, guestId);
    expect(detail?.messages.map((item) => item.id)).toContain(message.id);
    expect(detail?.messages.at(-1)?.author.name).toBe('Kwame Guest');
  });

  it('returns only what was said after the last poll', async () => {
    const first = await postRoomMessage(hostId, roomId, 'Welcome in.');
    const later = await postRoomMessage(
      hostId,
      roomId,
      'Which region should we read next?',
    );

    const since = await getRoomMessages(roomId, first.createdAt);
    expect(since.map((item) => item.id)).toEqual([later.id]);
    expect(since.map((item) => item.id)).not.toContain(first.id);
  });

  it('counts a reaction once per person and takes it back', async () => {
    expect(await reactToRoom(guestId, roomId, 'heart')).toBe(true);
    expect(await reactToRoom(guestId, roomId, 'heart')).toBe(false);
    expect(await reactToRoom(guestId, roomId, 'heart')).toBe(true);
    await reactToRoom(hostId, roomId, 'heart');
    await reactToRoom(hostId, roomId, 'clap');

    const detail = await getRoom(roomId, guestId);
    expect(detail?.reactions.heart).toBe(2);
    expect(detail?.reactions.clap).toBe(1);
    expect(detail?.reactions.star).toBe(0);
    expect(detail?.myReactions).toEqual(['heart']);

    await expect(
      reactToRoom(guestId, roomId, 'trumpet' as 'heart'),
    ).rejects.toThrow();
  });

  it('lists live rooms with the count of people actually in them', async () => {
    const rooms = await getRooms({ viewerId: guestId });
    const listed = rooms.find((room) => room.id === roomId);
    expect(listed?.people).toBe(2);
    expect(listed?.isParticipant).toBe(true);
    expect(listed?.isHost).toBe(false);
    expect(
      rooms.every((room) => room.isLive),
      'a closed room is not a live room',
    ).toBe(true);
  });

  it('closes a room, and only the host can do it', async () => {
    await expect(closeRoom(guestId, roomId)).rejects.toThrow();

    await closeRoom(hostId, roomId);
    expect((await getRoom(roomId, hostId))?.isLive).toBe(false);
    expect(
      (await getRooms({ viewerId: guestId })).map((room) => room.id),
    ).not.toContain(roomId);
    expect(
      (await getRooms({ viewerId: guestId, includeClosed: true })).map(
        (room) => room.id,
      ),
    ).toContain(roomId);

    await expect(joinRoom(strangerId, roomId)).rejects.toThrow();
    await expect(
      postRoomMessage(guestId, roomId, 'Anyone still here?'),
    ).rejects.toThrow();
  });
});
