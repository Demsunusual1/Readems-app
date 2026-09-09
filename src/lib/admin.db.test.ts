import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  assignReport,
  createDeal,
  ensureBootstrapAdmin,
  fileReport,
  getPlatformOverview,
  isAdmin,
  listDeals,
  listReports,
  listUsers,
  requireAdmin,
  resolveReport,
  setAccountStatus,
  setAdminRole,
  updateDealStatus,
} from './admin';
import { addComment, getComments } from './comments';
import { getStory, listStories } from './stories';
import {
  createTestStory,
  createTestUser,
  deleteTestUsers,
  uniqueSuffix,
} from '@/test/factories';

let superId: string;
let adminId: string;
let moderatorId: string;
let readerId: string;
let authorId: string;
let storyId: string;
let chapterId: string;
const reportIds: string[] = [];
const dealIds: string[] = [];

beforeAll(async () => {
  superId = (await createTestUser({ fullName: 'Root Admin' })).id;
  adminId = (await createTestUser({ fullName: 'Desk Admin' })).id;
  moderatorId = (await createTestUser({ fullName: 'Queue Moderator' })).id;
  readerId = (await createTestUser({ fullName: 'Plain Reader' })).id;
  authorId = (await createTestUser({ fullName: 'Story Author' })).id;
  await prisma.user.update({
    where: { id: superId },
    data: { adminRole: 'SUPER_ADMIN' },
  });
  const story = await createTestStory(authorId, { title: 'Moderated Tale' });
  storyId = story.id;
  chapterId = (await prisma.chapter.findFirstOrThrow({ where: { storyId } }))
    .id;
});

afterAll(async () => {
  await prisma.report.deleteMany({ where: { id: { in: reportIds } } });
  await prisma.brandDeal.deleteMany({ where: { id: { in: dealIds } } });
  await deleteTestUsers(superId, adminId, moderatorId, readerId, authorId);
});

describe('who counts as an admin', () => {
  it('ranks moderator below admin below super admin', () => {
    expect(isAdmin({ adminRole: 'NONE' })).toBe(false);
    expect(isAdmin({ adminRole: 'MODERATOR' })).toBe(true);
    expect(isAdmin({ adminRole: 'MODERATOR' }, 'ADMIN')).toBe(false);
    expect(isAdmin({ adminRole: 'ADMIN' }, 'ADMIN')).toBe(true);
    expect(isAdmin({ adminRole: 'ADMIN' }, 'SUPER_ADMIN')).toBe(false);
    expect(isAdmin({ adminRole: 'SUPER_ADMIN' }, 'SUPER_ADMIN')).toBe(true);
    expect(isAdmin(null)).toBe(false);
  });

  it('turns away a reader and lets a super admin through', async () => {
    await expect(requireAdmin(readerId, 'MODERATOR')).rejects.toThrow();
    await expect(requireAdmin(superId, 'SUPER_ADMIN')).resolves.toMatchObject({
      id: superId,
    });
  });
});

describe('handing out roles', () => {
  it('lets only a super admin change a role', async () => {
    await expect(
      setAdminRole(readerId, moderatorId, 'MODERATOR'),
    ).rejects.toThrow();
    await setAdminRole(superId, moderatorId, 'MODERATOR');
    await setAdminRole(superId, adminId, 'ADMIN');
    await expect(setAdminRole(adminId, moderatorId, 'ADMIN')).rejects.toThrow();
    const stored = await prisma.user.findUniqueOrThrow({
      where: { id: moderatorId },
    });
    expect(stored.adminRole).toBe('MODERATOR');
  });

  it('refuses to demote the last super admin', async () => {
    await expect(setAdminRole(superId, superId, 'ADMIN')).rejects.toThrow(
      /last super admin/i,
    );
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: superId } }))
        .adminRole,
    ).toBe('SUPER_ADMIN');
  });

  it('suspends and restores an account, and blocks a moderator from doing it', async () => {
    await expect(
      setAccountStatus(moderatorId, readerId, 'SUSPENDED'),
    ).rejects.toThrow();
    await setAccountStatus(adminId, readerId, 'SUSPENDED');
    const suspended = await prisma.user.findUniqueOrThrow({
      where: { id: readerId },
    });
    expect(suspended.accountStatus).toBe('SUSPENDED');
    expect(suspended.suspendedAt).toBeInstanceOf(Date);

    await setAccountStatus(adminId, readerId, 'ACTIVE');
    const restored = await prisma.user.findUniqueOrThrow({
      where: { id: readerId },
    });
    expect(restored.accountStatus).toBe('ACTIVE');
    expect(restored.suspendedAt).toBeNull();
  });
});

describe('the overview counts real things', () => {
  it('reports counts that match the database and a live round-trip', async () => {
    const overview = await getPlatformOverview();
    const [users, stories, chapters, comments] = await Promise.all([
      prisma.user.count(),
      prisma.story.count({ where: { status: 'PUBLISHED' } }),
      prisma.chapter.count({ where: { status: 'PUBLISHED' } }),
      prisma.comment.count(),
    ]);
    expect(overview.users).toBe(users);
    expect(overview.stories).toBe(stories);
    expect(overview.chapters).toBe(chapters);
    expect(overview.comments).toBe(comments);
    expect(overview.creators).toBeGreaterThan(0);
    expect(overview.creators).toBeLessThanOrEqual(overview.users);
    expect(overview.database.ok).toBe(true);
    expect(overview.database.ms).toBeGreaterThanOrEqual(0);
    expect(overview.notMeasured).toContain('Platform revenue');
  });

  it('counts new sign-ups as a daily series covering thirty days', async () => {
    const overview = await getPlatformOverview();
    expect(overview.newUsers).toHaveLength(30);
    const today = overview.newUsers.at(-1);
    expect(today?.count).toBeGreaterThanOrEqual(5);
    expect(overview.newUsersTotal).toBe(
      overview.newUsers.reduce((sum, day) => sum + day.count, 0),
    );
  });
});

describe('the user list', () => {
  it('finds a person by name and pages through the rest', async () => {
    const found = await listUsers({ query: 'Queue Moderator' });
    expect(found.total).toBe(1);
    expect(found.rows[0]?.id).toBe(moderatorId);
    expect(found.rows[0]?.adminRole).toBe('MODERATOR');

    const page = await listUsers({ page: 1, pageSize: 5 });
    expect(page.rows).toHaveLength(5);
    expect(page.total).toBe(await prisma.user.count());
    expect(page.pageCount).toBe(Math.ceil(page.total / 5));

    const second = await listUsers({ page: 2, pageSize: 5 });
    expect(second.rows.map((row) => row.id)).not.toEqual(
      page.rows.map((row) => row.id),
    );
  });

  it('filters by admin role and account status', async () => {
    const admins = await listUsers({ adminRole: 'ADMIN' });
    expect(admins.rows.map((row) => row.id)).toContain(adminId);
    expect(admins.rows.every((row) => row.adminRole === 'ADMIN')).toBe(true);

    await setAccountStatus(adminId, readerId, 'SUSPENDED');
    const suspended = await listUsers({ status: 'SUSPENDED' });
    expect(suspended.rows.map((row) => row.id)).toContain(readerId);
    await setAccountStatus(adminId, readerId, 'ACTIVE');
  });
});

describe('reporting content', () => {
  it('lets a signed-in reader file one open report per target', async () => {
    const report = await fileReport(readerId, {
      targetType: 'STORY',
      targetId: storyId,
      reason: 'Spam',
      details: 'The chapters are advertising.',
    });
    reportIds.push(report.id);
    expect(report.status).toBe('OPEN');

    await expect(
      fileReport(readerId, {
        targetType: 'STORY',
        targetId: storyId,
        reason: 'Spam',
      }),
    ).rejects.toThrow(/already/i);

    const other = await fileReport(authorId, {
      targetType: 'STORY',
      targetId: storyId,
      reason: 'Harassment',
    });
    reportIds.push(other.id);
    expect(other.id).not.toBe(report.id);
  });

  it('refuses a report with no reason', async () => {
    await expect(
      fileReport(readerId, {
        targetType: 'STORY',
        targetId: storyId,
        reason: '   ',
      }),
    ).rejects.toThrow();
  });

  it('shows the queue with the target text resolved', async () => {
    const queue = await listReports({ status: 'OPEN' });
    const row = queue.rows.find((item) => item.id === reportIds[0]);
    expect(row?.title).toBe('Moderated Tale');
    expect(row?.reporterName).toBe('Plain Reader');
    expect(row?.href).toBe(`/stories/${storyId}`);
    expect(queue.total).toBeGreaterThanOrEqual(2);
  });

  it('assigns a report to a moderator', async () => {
    const [first] = reportIds;
    await expect(assignReport(readerId, first, moderatorId)).rejects.toThrow();
    await assignReport(moderatorId, first, moderatorId);
    expect(
      (await prisma.report.findUniqueOrThrow({ where: { id: first } }))
        .assignedToId,
    ).toBe(moderatorId);
  });

  it('approves a report without touching the content', async () => {
    const [first] = reportIds;
    await resolveReport(moderatorId, first, 'APPROVE');
    const stored = await prisma.report.findUniqueOrThrow({
      where: { id: first },
    });
    expect(stored.status).toBe('APPROVED');
    expect(stored.resolvedById).toBe(moderatorId);
    expect(stored.resolvedAt).toBeInstanceOf(Date);
    expect(await getStory(storyId)).not.toBeNull();
  });

  it('closes the other open reports about the same thing', async () => {
    const [, second] = reportIds;
    const stored = await prisma.report.findUniqueOrThrow({
      where: { id: second },
    });
    expect(stored.status).toBe('APPROVED');
    expect(stored.resolvedById).toBe(moderatorId);
  });

  it('restricts a comment so readers stop seeing it', async () => {
    const comment = await addComment(readerId, chapterId, 'Rude words here.');
    const report = await fileReport(authorId, {
      targetType: 'COMMENT',
      targetId: comment.id,
      reason: 'Harassment',
    });
    reportIds.push(report.id);

    const before = await getComments(chapterId, null);
    expect(before.map((item) => item.id)).toContain(comment.id);

    await resolveReport(moderatorId, report.id, 'RESTRICT');
    expect(
      (await prisma.comment.findUniqueOrThrow({ where: { id: comment.id } }))
        .hiddenAt,
    ).toBeInstanceOf(Date);
    const after = await getComments(chapterId, null);
    expect(after.map((item) => item.id)).not.toContain(comment.id);
  });

  it('restricts a story so it leaves the catalogue', async () => {
    const hidden = await createTestStory(authorId, { title: 'Hidden Tale' });
    const report = await fileReport(readerId, {
      targetType: 'STORY',
      targetId: hidden.id,
      reason: 'Spam',
    });
    reportIds.push(report.id);
    await resolveReport(moderatorId, report.id, 'RESTRICT');

    expect(await getStory(hidden.id)).toBeNull();
    const catalogue = await listStories({ query: 'Hidden Tale' });
    expect(catalogue.map((item) => item.id)).not.toContain(hidden.id);
  });

  it('removes the content outright when asked to', async () => {
    const comment = await addComment(readerId, chapterId, 'Delete me.');
    const report = await fileReport(authorId, {
      targetType: 'COMMENT',
      targetId: comment.id,
      reason: 'Spam',
    });
    reportIds.push(report.id);
    await resolveReport(moderatorId, report.id, 'REMOVE');
    expect(
      await prisma.comment.findUnique({ where: { id: comment.id } }),
    ).toBeNull();
    expect(
      (await prisma.report.findUniqueOrThrow({ where: { id: report.id } }))
        .status,
    ).toBe('REMOVED');
  });

  it('filters the queue by priority and status', async () => {
    const open = await listReports({ status: 'OPEN', priority: 'HIGH' });
    expect(open.rows.every((row) => row.priority === 'HIGH')).toBe(true);
    const removed = await listReports({ status: 'REMOVED' });
    expect(removed.rows.every((row) => row.status === 'REMOVED')).toBe(true);
  });
});

describe('brand deals', () => {
  it('creates a deal, totals the real value and moves it through statuses', async () => {
    await expect(
      createDeal(moderatorId, {
        name: 'Blocked',
        sponsor: 'Nobody',
        category: 'Tech',
        region: 'Global',
        valueCents: 1,
        creatorSlots: 1,
      }),
    ).rejects.toThrow();

    const deal = await createDeal(adminId, {
      name: `Sunrise Mobile ${uniqueSuffix()}`,
      sponsor: 'Sunrise Mobile',
      category: 'Tech & Innovation',
      region: 'Global',
      valueCents: 12_000_000,
      creatorSlots: 12,
      status: 'LIVE',
    });
    dealIds.push(deal.id);
    expect(deal.valueCents).toBe(12_000_000);
    expect(deal.createdById).toBe(adminId);

    const live = await listDeals({ status: 'LIVE' });
    expect(live.rows.map((row) => row.id)).toContain(deal.id);
    expect(live.totalValueCents).toBe(
      live.rows.reduce((sum, row) => sum + row.valueCents, 0),
    );

    await updateDealStatus(adminId, deal.id, 'COMPLETED');
    expect(
      (await prisma.brandDeal.findUniqueOrThrow({ where: { id: deal.id } }))
        .status,
    ).toBe('COMPLETED');
  });

  it('refuses a deal with no name or a negative value', async () => {
    await expect(
      createDeal(adminId, {
        name: ' ',
        sponsor: 'Sunrise',
        category: 'Tech',
        region: 'Global',
        valueCents: 100,
        creatorSlots: 1,
      }),
    ).rejects.toThrow();
    await expect(
      createDeal(adminId, {
        name: 'Negative',
        sponsor: 'Sunrise',
        category: 'Tech',
        region: 'Global',
        valueCents: -1,
        creatorSlots: 1,
      }),
    ).rejects.toThrow();
  });
});

describe('bootstrapping the first admin', () => {
  it('promotes a listed email once and leaves everybody else alone', async () => {
    const email = `bootstrap_${uniqueSuffix()}@example.com`;
    const candidate = await createTestUser({ email });
    try {
      process.env.READEMS_ADMIN_EMAILS = ` ${email.toUpperCase()} , other@example.com `;
      const promoted = await ensureBootstrapAdmin(candidate);
      expect(promoted.adminRole).toBe('SUPER_ADMIN');
      expect(
        (await prisma.user.findUniqueOrThrow({ where: { id: candidate.id } }))
          .adminRole,
      ).toBe('SUPER_ADMIN');

      const untouched = await ensureBootstrapAdmin(
        await prisma.user.findUniqueOrThrow({ where: { id: readerId } }),
      );
      expect(untouched.adminRole).toBe('NONE');
    } finally {
      delete process.env.READEMS_ADMIN_EMAILS;
      await deleteTestUsers(candidate.id);
    }
  });
});
