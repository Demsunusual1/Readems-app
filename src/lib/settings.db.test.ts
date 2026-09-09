import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  blockPerson,
  changePassword,
  getBlockedPeople,
  getSettings,
  listSessions,
  revokeSession,
  saveProfile,
  saveSettings,
  unblockPerson,
} from './settings';
import { getProfile, toggleFollow } from './people';
import { hashPassword, verifyPassword } from './auth';
import { createTestUser, deleteTestUsers } from '@/test/factories';

let personId: string;
let otherId: string;
let otherUsername: string;

beforeAll(async () => {
  const person = await createTestUser({ fullName: 'Daniel Effiong' });
  personId = person.id;
  const other = await createTestUser({ fullName: 'Noisy Neighbour' });
  otherId = other.id;
  otherUsername = other.username;
  await prisma.user.update({
    where: { id: personId },
    data: { passwordHash: await hashPassword('OriginalPassword9') },
  });
});

afterAll(async () => {
  await deleteTestUsers(personId, otherId);
});

describe('account settings', () => {
  it('starts from sensible defaults and remembers what is changed', async () => {
    const defaults = await getSettings(personId);
    expect(defaults.theme).toBe('system');
    expect(defaults.profilePublic).toBe(true);

    await saveSettings(personId, {
      theme: 'dark',
      language: 'French',
      showReadingActivity: true,
    });
    const stored = await getSettings(personId);
    expect(stored.theme).toBe('dark');
    expect(stored.language).toBe('French');
    expect(stored.showReadingActivity).toBe(true);
    expect(stored.profilePublic).toBe(true);
  });

  it('refuses a theme it does not have', async () => {
    await expect(
      // A value the interface cannot produce still has to be refused.
      saveSettings(personId, { theme: 'neon' as never }),
    ).rejects.toThrow();
  });

  it('edits the profile people see', async () => {
    await saveProfile(personId, {
      fullName: 'Daniel E. Effiong',
      bio: 'Reader, sometimes writer.',
    });
    const person = await prisma.user.findUniqueOrThrow({
      where: { id: personId },
    });
    expect(person.fullName).toBe('Daniel E. Effiong');
    expect(person.bio).toBe('Reader, sometimes writer.');
  });

  it('refuses a profile picture Readems could not show', async () => {
    await expect(
      saveProfile(personId, { avatarUrl: 'https://example.com/face.png' }),
    ).rejects.toThrow();
    await saveProfile(personId, {
      avatarUrl: 'data:image/png;base64,iVBORw0KGgo=',
    });
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: personId } }))
        .avatarUrl,
    ).toContain('data:image/png');
  });

  it('hides a private profile from everybody else', async () => {
    await saveSettings(personId, { profilePublic: false });
    const person = await prisma.user.findUniqueOrThrow({
      where: { id: personId },
    });
    expect(await getProfile(person.username, otherId)).toBeNull();
    expect(await getProfile(person.username, personId)).not.toBeNull();
    await saveSettings(personId, { profilePublic: true });
  });

  it('changes a password only with the current one', async () => {
    await expect(
      changePassword(personId, 'WrongPassword9', 'NewSafePassword9'),
    ).rejects.toThrow();
    await changePassword(personId, 'OriginalPassword9', 'NewSafePassword9');
    const person = await prisma.user.findUniqueOrThrow({
      where: { id: personId },
    });
    expect(await verifyPassword('NewSafePassword9', person.passwordHash)).toBe(
      true,
    );
  });

  it('refuses a new password that is too weak', async () => {
    await expect(
      changePassword(personId, 'NewSafePassword9', 'short'),
    ).rejects.toThrow();
  });

  it('lists sessions and lets one be signed out', async () => {
    await prisma.session.createMany({
      data: [
        {
          tokenHash: `hash-a-${personId}`,
          userId: personId,
          expiresAt: new Date(Date.now() + 86_400_000),
        },
        {
          tokenHash: `hash-b-${personId}`,
          userId: personId,
          expiresAt: new Date(Date.now() + 86_400_000),
        },
      ],
    });
    const sessions = await listSessions(personId);
    expect(sessions).toHaveLength(2);

    await revokeSession(personId, sessions[0].id);
    expect(await listSessions(personId)).toHaveLength(1);

    await expect(
      revokeSession(otherId, (await listSessions(personId))[0].id),
    ).rejects.toThrow();
  });

  it('blocks somebody, and the follow between them goes with it', async () => {
    await toggleFollow(otherId, personId);
    await blockPerson(personId, otherId);

    expect(
      await prisma.follow.count({
        where: { followerId: otherId, followingId: personId },
      }),
    ).toBe(0);
    await expect(toggleFollow(otherId, personId)).rejects.toThrow();

    const blocked = await getBlockedPeople(personId);
    expect(blocked.map((person) => person.username)).toEqual([otherUsername]);

    await unblockPerson(personId, otherId);
    expect(await getBlockedPeople(personId)).toHaveLength(0);
  });

  it('will not let somebody block themselves', async () => {
    await expect(blockPerson(personId, personId)).rejects.toThrow();
  });
});
