import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  getCreatorUpdates,
  getFollowers,
  getFollowing,
  getProfile,
  toggleFollow,
} from './people';
import {
  createTestStory,
  createTestUser,
  deleteTestUsers,
} from '@/test/factories';

let readerId: string;
let creatorId: string;
let creatorName: string;
let storyId: string;

beforeAll(async () => {
  const reader = await createTestUser();
  const creator = await createTestUser({ role: 'CREATOR' });
  readerId = reader.id;
  creatorId = creator.id;
  creatorName = creator.username;
  storyId = (await createTestStory(creatorId, { title: 'Followed Story' })).id;
});

afterAll(async () => {
  await deleteTestUsers(readerId, creatorId);
});

describe('following people', () => {
  it('follows and unfollows, counting each side once', async () => {
    expect(await toggleFollow(readerId, creatorId)).toBe(true);
    expect(await toggleFollow(readerId, creatorId)).toBe(false);

    await toggleFollow(readerId, creatorId);
    expect(await getFollowing(readerId)).toHaveLength(1);
    expect(await getFollowers(creatorId)).toHaveLength(1);
  });

  it('refuses to let somebody follow themselves', async () => {
    await expect(toggleFollow(readerId, readerId)).rejects.toThrow();
  });

  it('describes a profile from what the person has actually published', async () => {
    const profile = await getProfile(creatorName, readerId);
    expect(profile?.username).toBe(creatorName);
    expect(profile?.followers).toBe(1);
    expect(profile?.isFollowing).toBe(true);
    expect(profile?.isMe).toBe(false);
    expect(profile?.stories.map((story) => story.id)).toContain(storyId);
  });

  it('knows a profile is the viewer’s own', async () => {
    const profile = await getProfile(creatorName, creatorId);
    expect(profile?.isMe).toBe(true);
    expect(profile?.isFollowing).toBe(false);
  });

  it('has nothing to show for an unknown username', async () => {
    expect(await getProfile('nobody-by-that-name', readerId)).toBeNull();
  });

  it('gathers what followed creators published, newest first', async () => {
    const older = await createTestStory(creatorId, { title: 'Older Story' });
    await prisma.chapter.updateMany({
      where: { storyId: older.id },
      data: { publishedAt: new Date(Date.now() - 86_400_000) },
    });

    const updates = await getCreatorUpdates(readerId, 5);
    expect(updates).toHaveLength(2);
    expect(updates[0].storyTitle).toBe('Followed Story');
    expect(updates[0].creatorName).toBeTruthy();
    expect(updates[1].storyTitle).toBe('Older Story');
  });

  it('has no updates for somebody who follows nobody', async () => {
    const stranger = await createTestUser();
    expect(await getCreatorUpdates(stranger.id, 5)).toEqual([]);
    await deleteTestUsers(stranger.id);
  });
});
