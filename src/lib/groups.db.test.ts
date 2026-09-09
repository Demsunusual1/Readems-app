import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createGroup,
  createGroupEvent,
  getGroup,
  getGroups,
  joinGroup,
  leaveGroup,
  toggleRsvp,
} from './groups';
import { createPost, getFeed } from './community';
import { createTestUser, deleteTestUsers } from '@/test/factories';

let founderId: string;
let memberId: string;
let outsiderId: string;
let groupId: string;

beforeAll(async () => {
  founderId = (await createTestUser({ fullName: 'Amina Founder' })).id;
  memberId = (await createTestUser({ fullName: 'Kwame Member' })).id;
  outsiderId = (await createTestUser({ fullName: 'Passing Stranger' })).id;
});

afterAll(async () => {
  await deleteTestUsers(founderId, memberId, outsiderId);
});

describe('groups', () => {
  it('creates a group whose founder is already a member', async () => {
    const group = await createGroup(founderId, {
      name: 'African Voices Collective',
      tagline: 'A global home for African storytellers.',
      description: 'Share your voice. Discover powerful stories.',
      topic: 'Culture',
    });
    groupId = group.id;
    expect(groupId).toMatch(/^african-voices-collective/);

    const detail = await getGroup(groupId, founderId);
    expect(detail?.members).toBe(1);
    expect(detail?.role).toBe('FOUNDER');
    expect(detail?.isMember).toBe(true);
  });

  it('refuses a group without a usable name', async () => {
    await expect(
      createGroup(founderId, {
        name: 'x',
        tagline: 'Too short',
        description: 'Too short',
        topic: 'Craft',
      }),
    ).rejects.toThrow();
  });

  it('lets somebody join once and leave again', async () => {
    await joinGroup(memberId, groupId);
    await joinGroup(memberId, groupId);
    expect((await getGroup(groupId, memberId))?.members).toBe(2);

    await leaveGroup(memberId, groupId);
    expect((await getGroup(groupId, memberId))?.isMember).toBe(false);
    await joinGroup(memberId, groupId);
  });

  it('will not let the founder abandon the group', async () => {
    await expect(leaveGroup(founderId, groupId)).rejects.toThrow();
  });

  it('separates the groups a person has joined from the rest', async () => {
    const other = await createGroup(outsiderId, {
      name: 'Sci-Fi And Beyond',
      tagline: 'Explore worlds. Question everything.',
      description: 'Speculative fiction of every kind.',
      topic: 'Genres',
    });

    const joined = await getGroups({ viewerId: memberId, joined: true });
    expect(joined.map((group) => group.id)).toEqual([groupId]);

    const all = await getGroups({ viewerId: memberId });
    expect(all.map((group) => group.id)).toContain(other.id);
    expect(all.find((group) => group.id === groupId)?.isMember).toBe(true);
  });

  it('puts the groups people have joined at the top of the list', async () => {
    // A database that has been running a while has plenty of quiet groups in
    // it; the ones worth showing first are the ones people are in.
    const quiet = await createGroup(outsiderId, {
      name: `Quiet Corner ${Date.now()}`,
      tagline: 'Nobody has joined this one.',
      description: 'A group with only its founder.',
      topic: 'Community',
    });

    const listed = await getGroups({ viewerId: memberId });
    const busy = listed.findIndex((group) => group.id === groupId);
    const empty = listed.findIndex((group) => group.id === quiet.id);
    expect(busy).toBeGreaterThanOrEqual(0);
    expect(empty).toBeGreaterThan(busy);
  });

  it('keeps group posts out of the public feed', async () => {
    const post = await createPost(memberId, {
      body: 'A note for the group only.',
      groupId,
    });

    const groupFeed = await getFeed({ viewerId: memberId, groupId });
    expect(groupFeed.map((item) => item.id)).toContain(post.id);

    const publicFeed = await getFeed({ viewerId: memberId });
    expect(publicFeed.map((item) => item.id)).not.toContain(post.id);
  });

  it('refuses a post from somebody who has not joined', async () => {
    await expect(
      createPost(outsiderId, { body: 'Let me in.', groupId }),
    ).rejects.toThrow();
  });

  it('schedules an event that members can answer', async () => {
    const event = await createGroupEvent(founderId, groupId, {
      title: 'Voices Across Borders',
      description: 'Come listen, share and celebrate stories.',
      startsAt: new Date(Date.now() + 7 * 86_400_000),
    });

    expect(await toggleRsvp(memberId, event.id)).toBe(true);
    const detail = await getGroup(groupId, memberId);
    expect(detail?.events[0].title).toBe('Voices Across Borders');
    expect(detail?.events[0].going).toBe(1);
    expect(detail?.events[0].attending).toBe(true);

    expect(await toggleRsvp(memberId, event.id)).toBe(false);
    expect((await getGroup(groupId, memberId))?.events[0].going).toBe(0);
  });

  it('only lets a moderator schedule an event', async () => {
    await expect(
      createGroupEvent(memberId, groupId, {
        title: 'Unofficial meetup',
        description: 'Not my call to make.',
        startsAt: new Date(Date.now() + 86_400_000),
      }),
    ).rejects.toThrow();
  });
});
