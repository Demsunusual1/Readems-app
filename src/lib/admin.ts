import type {
  AccountStatus,
  AdminRole,
  DealStatus,
  Prisma,
  ReportPriority,
  ReportStatus,
  ReportTarget,
  User,
} from '@prisma/client';
import { prisma } from './prisma';

// Rank rather than compare enum values directly: the schema order is a
// coincidence of how the enum was written, and this is the rule the whole
// admin area is checked against.
const rank: Record<AdminRole, number> = {
  NONE: 0,
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const adminRoleLabels: Record<AdminRole, string> = {
  NONE: 'Member',
  MODERATOR: 'Moderator',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super admin',
};

export function isAdmin(
  user: { adminRole: AdminRole } | null | undefined,
  minimum: AdminRole = 'MODERATOR',
) {
  return Boolean(user) && rank[user!.adminRole] >= rank[minimum];
}

export async function requireAdmin(userId: string, minimum: AdminRole) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !isAdmin(user, minimum))
    throw new Error(`That needs ${adminRoleLabels[minimum]} access.`);
  // A suspended account keeps its role but loses the use of it, so a
  // compromised admin can be stopped without first rewriting their role.
  if (user.accountStatus === 'SUSPENDED')
    throw new Error('That account is suspended.');
  return user;
}

/**
 * The first admin. Nobody can hand out SUPER_ADMIN before one exists, so the
 * deployment does it: put the address in READEMS_ADMIN_EMAILS and the account
 * is promoted the next time it signs in. Read from the environment on every
 * call rather than from a parsed-once module, so a deployment can change the
 * list without a rebuild.
 */
export function bootstrapAdminEmails() {
  return (process.env.READEMS_ADMIN_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export async function ensureBootstrapAdmin<T extends User>(user: T) {
  const listed = bootstrapAdminEmails().includes(user.email.toLowerCase());
  if (!listed || user.adminRole === 'SUPER_ADMIN') return user;
  const promoted = await prisma.user.update({
    where: { id: user.id },
    data: { adminRole: 'SUPER_ADMIN' },
  });
  return { ...user, ...promoted };
}

export type PlatformOverview = {
  users: number;
  creators: number;
  stories: number;
  chapters: number;
  posts: number;
  comments: number;
  likes: number;
  reports: {
    open: number;
    high: number;
    medium: number;
    low: number;
    byTarget: { targetType: ReportTarget; count: number }[];
  };
  newUsers: { date: string; count: number }[];
  newUsersTotal: number;
  database: { ok: boolean; ms: number; error?: string };
  notMeasured: string[];
};

const DAYS = 30;

function utcDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function databaseRoundTrip() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, ms: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      ms: Date.now() - started,
      error: error instanceof Error ? error.message : 'Unknown error.',
    };
  }
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const since = new Date(Date.now() - (DAYS - 1) * 24 * 60 * 60 * 1000);
  since.setUTCHours(0, 0, 0, 0);

  const [
    users,
    creators,
    stories,
    chapters,
    posts,
    comments,
    likes,
    openReports,
    byTarget,
    signups,
    database,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.story
      .findMany({
        where: { status: 'PUBLISHED' },
        distinct: ['authorId'],
        select: { authorId: true },
      })
      .then((rows) => rows.length),
    prisma.story.count({ where: { status: 'PUBLISHED' } }),
    prisma.chapter.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.storyLike.count(),
    prisma.report.groupBy({
      by: ['priority'],
      where: { status: 'OPEN' },
      _count: { _all: true },
    }),
    prisma.report.groupBy({
      by: ['targetType'],
      where: { status: 'OPEN' },
      _count: { _all: true },
    }),
    // Grouped in the database and keyed in UTC on both sides, so a server in
    // one timezone and a reader in another still see the same buckets.
    prisma.$queryRaw<{ day: string; count: number }[]>`
      SELECT to_char(date_trunc('day', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
             count(*)::int AS count
      FROM "User"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1
    `,
    databaseRoundTrip(),
  ]);

  const counted = new Map(signups.map((row) => [row.day, Number(row.count)]));
  const newUsers = Array.from({ length: DAYS }, (_, index) => {
    const date = utcDayKey(
      new Date(since.getTime() + index * 24 * 60 * 60 * 1000),
    );
    return { date, count: counted.get(date) ?? 0 };
  });

  const priority = (name: ReportPriority) =>
    openReports.find((row) => row.priority === name)?._count._all ?? 0;

  return {
    users,
    creators,
    stories,
    chapters,
    posts,
    comments,
    likes,
    reports: {
      open: openReports.reduce((sum, row) => sum + row._count._all, 0),
      high: priority('HIGH'),
      medium: priority('MEDIUM'),
      low: priority('LOW'),
      byTarget: byTarget
        .map((row) => ({ targetType: row.targetType, count: row._count._all }))
        .sort((a, b) => b.count - a.count),
    },
    newUsers,
    newUsersTotal: newUsers.reduce((sum, day) => sum + day.count, 0),
    database,
    // Named here so the dashboard can say what it does not know instead of
    // printing a plausible number for it.
    notMeasured: [
      'Platform revenue',
      'Payment provider health',
      'File storage health',
    ],
  };
}

export type AdminUserRow = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: User['role'];
  adminRole: AdminRole;
  accountStatus: AccountStatus;
  suspendedAt: Date | null;
  createdAt: Date;
  stories: number;
};

export type UserQuery = {
  query?: string;
  role?: User['role'];
  status?: AccountStatus;
  adminRole?: AdminRole;
  page?: number;
  pageSize?: number;
};

export async function listUsers(options: UserQuery = {}) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 100);
  const page = Math.max(options.page ?? 1, 1);
  const term = options.query?.trim();
  const where: Prisma.UserWhereInput = {
    ...(options.role ? { role: options.role } : {}),
    ...(options.status ? { accountStatus: options.status } : {}),
    ...(options.adminRole ? { adminRole: options.adminRole } : {}),
    ...(term
      ? {
          OR: [
            { fullName: { contains: term, mode: 'insensitive' } },
            { username: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatarUrl: true,
        role: true,
        adminRole: true,
        accountStatus: true,
        suspendedAt: true,
        createdAt: true,
        _count: { select: { stories: true } },
      },
    }),
  ]);

  return {
    rows: rows.map(({ _count, ...row }) => ({
      ...row,
      stories: _count.stories,
    })) satisfies AdminUserRow[],
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function setAdminRole(
  actorId: string,
  userId: string,
  role: AdminRole,
) {
  await requireAdmin(actorId, 'SUPER_ADMIN');
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error('That account no longer exists.');
  if (target.adminRole === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
    const others = await prisma.user.count({
      where: { adminRole: 'SUPER_ADMIN', id: { not: userId } },
    });
    if (others === 0)
      throw new Error(
        'That is the last super admin. Promote somebody else first.',
      );
  }
  return prisma.user.update({
    where: { id: userId },
    data: { adminRole: role },
  });
}

export async function setAccountStatus(
  actorId: string,
  userId: string,
  status: AccountStatus,
) {
  await requireAdmin(actorId, 'ADMIN');
  if (actorId === userId && status === 'SUSPENDED')
    throw new Error('You cannot suspend your own account.');
  return prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: status,
      suspendedAt: status === 'SUSPENDED' ? new Date() : null,
    },
  });
}

export const reportReasons = [
  'Spam',
  'Harassment',
  'Hate speech',
  'Misinformation',
  'Sexual content',
  'Violence',
  'Copyright',
  'Other',
] as const;

export async function fileReport(
  reporterId: string,
  input: {
    targetType: ReportTarget;
    targetId: string;
    reason: string;
    details?: string;
    priority?: ReportPriority;
  },
) {
  const reason = input.reason.trim();
  if (!reason) throw new Error('Choose a reason for the report.');
  const details = input.details?.trim() ?? '';
  if (details.length > 2000)
    throw new Error('Keep the extra detail under 2000 characters.');

  const existing = await prisma.report.findFirst({
    where: {
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      status: 'OPEN',
    },
    select: { id: true },
  });
  if (existing) throw new Error('You have already reported this.');

  return prisma.report.create({
    data: {
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      reason,
      details: details || null,
      priority: input.priority ?? 'MEDIUM',
    },
  });
}

export type ReportRow = {
  id: string;
  targetType: ReportTarget;
  targetId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: Date;
  reporterName: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  resolvedByName: string | null;
  title: string;
  context: string | null;
  authorName: string | null;
  href: string | null;
};

const excerpt = (text: string, length = 120) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

type Resolved = {
  title: string;
  context: string | null;
  authorName: string | null;
  href: string | null;
};

/**
 * A report stores only a target type and an id, because the six things people
 * can report have no shared table. Resolving the text for a whole page of
 * reports is one query per type present rather than one per report.
 */
async function resolveTargets(
  reports: { targetType: ReportTarget; targetId: string }[],
) {
  const idsFor = (type: ReportTarget) =>
    reports.filter((row) => row.targetType === type).map((row) => row.targetId);
  const resolved = new Map<string, Resolved>();
  const key = (type: ReportTarget, id: string) => `${type}:${id}`;

  const [stories, chapters, comments, posts, postComments, reviews, users] =
    await Promise.all([
      prisma.story.findMany({
        where: { id: { in: idsFor('STORY') } },
        select: {
          id: true,
          title: true,
          author: { select: { fullName: true } },
        },
      }),
      prisma.chapter.findMany({
        where: { id: { in: idsFor('CHAPTER') } },
        select: {
          id: true,
          title: true,
          number: true,
          story: {
            select: {
              id: true,
              title: true,
              author: { select: { fullName: true } },
            },
          },
        },
      }),
      prisma.comment.findMany({
        where: { id: { in: idsFor('COMMENT') } },
        select: {
          id: true,
          body: true,
          user: { select: { fullName: true } },
          chapter: {
            select: {
              number: true,
              story: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.post.findMany({
        where: { id: { in: idsFor('POST') } },
        select: {
          id: true,
          title: true,
          body: true,
          author: { select: { fullName: true } },
        },
      }),
      prisma.postComment.findMany({
        where: { id: { in: idsFor('POST_COMMENT') } },
        select: {
          id: true,
          body: true,
          user: { select: { fullName: true } },
          post: { select: { id: true, title: true } },
        },
      }),
      prisma.review.findMany({
        where: { id: { in: idsFor('REVIEW') } },
        select: {
          id: true,
          body: true,
          rating: true,
          user: { select: { fullName: true } },
          story: { select: { id: true, title: true } },
        },
      }),
      prisma.user.findMany({
        where: { id: { in: idsFor('USER') } },
        select: { id: true, fullName: true, username: true, email: true },
      }),
    ]);

  for (const story of stories)
    resolved.set(key('STORY', story.id), {
      title: story.title,
      context: null,
      authorName: story.author.fullName,
      href: `/stories/${story.id}`,
    });
  for (const chapter of chapters)
    resolved.set(key('CHAPTER', chapter.id), {
      title: `${chapter.number}. ${chapter.title}`,
      context: `in “${chapter.story.title}”`,
      authorName: chapter.story.author.fullName,
      href: `/stories/${chapter.story.id}/chapters/${chapter.number}`,
    });
  for (const comment of comments)
    resolved.set(key('COMMENT', comment.id), {
      title: excerpt(comment.body),
      context: `on “${comment.chapter.story.title}”`,
      authorName: comment.user.fullName,
      href: `/stories/${comment.chapter.story.id}/chapters/${comment.chapter.number}#comments`,
    });
  for (const post of posts)
    resolved.set(key('POST', post.id), {
      title: post.title ?? excerpt(post.body),
      context: null,
      authorName: post.author.fullName,
      href: '/community',
    });
  for (const comment of postComments)
    resolved.set(key('POST_COMMENT', comment.id), {
      title: excerpt(comment.body),
      context: comment.post.title ? `on “${comment.post.title}”` : 'on a post',
      authorName: comment.user.fullName,
      href: '/community',
    });
  for (const review of reviews)
    resolved.set(key('REVIEW', review.id), {
      title: review.body
        ? excerpt(review.body)
        : `${review.rating}-star rating`,
      context: `on “${review.story.title}”`,
      authorName: review.user.fullName,
      href: `/stories/${review.story.id}`,
    });
  for (const user of users)
    resolved.set(key('USER', user.id), {
      title: user.fullName,
      context: user.email,
      authorName: null,
      href: `/u/${user.username}`,
    });

  return resolved;
}

export async function listReports(
  options: {
    status?: ReportStatus;
    priority?: ReportPriority;
    targetType?: ReportTarget;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 100);
  const page = Math.max(options.page ?? 1, 1);
  const where: Prisma.ReportWhereInput = {
    ...(options.status ? { status: options.status } : {}),
    ...(options.priority ? { priority: options.priority } : {}),
    ...(options.targetType ? { targetType: options.targetType } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        reporter: { select: { fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
        resolvedBy: { select: { fullName: true } },
      },
    }),
  ]);

  const targets = await resolveTargets(rows);
  return {
    rows: rows.map((row): ReportRow => {
      const target = targets.get(`${row.targetType}:${row.targetId}`);
      return {
        id: row.id,
        targetType: row.targetType,
        targetId: row.targetId,
        reason: row.reason,
        details: row.details,
        status: row.status,
        priority: row.priority,
        createdAt: row.createdAt,
        reporterName: row.reporter?.fullName ?? null,
        assignedToId: row.assignedTo?.id ?? null,
        assignedToName: row.assignedTo?.fullName ?? null,
        resolvedByName: row.resolvedBy?.fullName ?? null,
        // A removed target leaves the report behind on purpose: the record of
        // the decision outlives the thing it was about.
        title: target?.title ?? 'Content no longer available',
        context: target?.context ?? null,
        authorName: target?.authorName ?? null,
        href: target?.href ?? null,
      };
    }),
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function listModerators() {
  return prisma.user.findMany({
    where: { adminRole: { in: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] } },
    orderBy: { fullName: 'asc' },
    select: { id: true, fullName: true, avatarUrl: true, adminRole: true },
  });
}

export async function assignReport(
  actorId: string,
  reportId: string,
  assigneeId: string | null,
) {
  await requireAdmin(actorId, 'MODERATOR');
  if (assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      select: { adminRole: true },
    });
    if (!assignee || !isAdmin(assignee))
      throw new Error('Only a moderator can take a report.');
  }
  return prisma.report.update({
    where: { id: reportId },
    data: { assignedToId: assigneeId },
  });
}

export type ResolveAction = 'APPROVE' | 'RESTRICT' | 'REMOVE';

const outcomes: Record<ResolveAction, ReportStatus> = {
  APPROVE: 'APPROVED',
  RESTRICT: 'RESTRICTED',
  REMOVE: 'REMOVED',
};

async function restrictTarget(targetType: ReportTarget, targetId: string) {
  const hiddenAt = new Date();
  switch (targetType) {
    case 'STORY':
      await prisma.story.update({
        where: { id: targetId },
        data: { hiddenAt },
      });
      return;
    case 'CHAPTER':
      await prisma.chapter.update({
        where: { id: targetId },
        data: { hiddenAt },
      });
      return;
    case 'COMMENT':
      await prisma.comment.update({
        where: { id: targetId },
        data: { hiddenAt },
      });
      return;
    case 'POST':
      await prisma.post.update({ where: { id: targetId }, data: { hiddenAt } });
      return;
    case 'POST_COMMENT':
      await prisma.postComment.update({
        where: { id: targetId },
        data: { hiddenAt },
      });
      return;
    case 'REVIEW':
      await prisma.review.update({
        where: { id: targetId },
        data: { hiddenAt },
      });
      return;
    case 'USER':
      // People are not hidden, they are suspended: there is no `hiddenAt` on a
      // user, and a suspension is the reversible measure that matches.
      await prisma.user.update({
        where: { id: targetId },
        data: { accountStatus: 'SUSPENDED', suspendedAt: hiddenAt },
      });
  }
}

async function removeTarget(targetType: ReportTarget, targetId: string) {
  switch (targetType) {
    case 'STORY':
      await prisma.story.delete({ where: { id: targetId } });
      return;
    case 'CHAPTER':
      await prisma.chapter.delete({ where: { id: targetId } });
      return;
    case 'COMMENT':
      await prisma.comment.delete({ where: { id: targetId } });
      return;
    case 'POST':
      await prisma.post.delete({ where: { id: targetId } });
      return;
    case 'POST_COMMENT':
      await prisma.postComment.delete({ where: { id: targetId } });
      return;
    case 'REVIEW':
      await prisma.review.delete({ where: { id: targetId } });
      return;
    case 'USER':
      // Deleting an account would take every story, comment and review with
      // it. A moderation decision suspends instead; deletion is the person's
      // own to ask for.
      await prisma.user.update({
        where: { id: targetId },
        data: { accountStatus: 'SUSPENDED', suspendedAt: new Date() },
      });
  }
}

export async function resolveReport(
  actorId: string,
  reportId: string,
  action: ResolveAction,
) {
  await requireAdmin(actorId, 'MODERATOR');
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new Error('That report no longer exists.');

  if (action === 'RESTRICT')
    await restrictTarget(report.targetType, report.targetId);
  if (action === 'REMOVE')
    await removeTarget(report.targetType, report.targetId);

  const resolved = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: outcomes[action],
      resolvedById: actorId,
      resolvedAt: new Date(),
    },
  });

  // Every other open report about the same thing has just been decided too.
  await prisma.report.updateMany({
    where: {
      status: 'OPEN',
      targetType: report.targetType,
      targetId: report.targetId,
      id: { not: reportId },
    },
    data: {
      status: outcomes[action],
      resolvedById: actorId,
      resolvedAt: new Date(),
    },
  });

  return resolved;
}

export const dealCategories = [
  'Tech & Innovation',
  'Finance',
  'Culture',
  'Education',
  'Health',
  'Retail',
] as const;

export const dealRegions = [
  'Global',
  'Africa',
  'North America',
  'Europe',
  'Asia',
] as const;

export async function listDeals(
  options: { status?: DealStatus; page?: number; pageSize?: number } = {},
) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 100);
  const page = Math.max(options.page ?? 1, 1);
  const where: Prisma.BrandDealWhereInput = options.status
    ? { status: options.status }
    : {};

  const [total, rows, totals, byStatus] = await Promise.all([
    prisma.brandDeal.count({ where }),
    prisma.brandDeal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { createdBy: { select: { fullName: true } } },
    }),
    prisma.brandDeal.aggregate({
      where,
      _sum: { valueCents: true, creatorSlots: true },
    }),
    prisma.brandDeal.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
    totalValueCents: totals._sum.valueCents ?? 0,
    creatorSlots: totals._sum.creatorSlots ?? 0,
    counts: Object.fromEntries(
      byStatus.map((row) => [row.status, row._count._all]),
    ) as Partial<Record<DealStatus, number>>,
  };
}

export type DealInput = {
  name: string;
  sponsor: string;
  category: string;
  region: string;
  valueCents: number;
  creatorSlots: number;
  status?: DealStatus;
  startsAt?: Date | null;
  endsAt?: Date | null;
};

export async function createDeal(actorId: string, input: DealInput) {
  await requireAdmin(actorId, 'ADMIN');
  const name = input.name.trim();
  const sponsor = input.sponsor.trim();
  if (!name || !sponsor) throw new Error('A deal needs a name and a sponsor.');
  if (!Number.isInteger(input.valueCents) || input.valueCents < 0)
    throw new Error('The deal value must be a whole number of cents.');
  if (!Number.isInteger(input.creatorSlots) || input.creatorSlots < 0)
    throw new Error('The number of creator slots must be zero or more.');
  if (input.startsAt && input.endsAt && input.endsAt < input.startsAt)
    throw new Error('The end date comes before the start date.');

  return prisma.brandDeal.create({
    data: {
      name,
      sponsor,
      category: input.category.trim() || 'General',
      region: input.region.trim() || 'Global',
      status: input.status ?? 'DRAFT',
      valueCents: input.valueCents,
      creatorSlots: input.creatorSlots,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      createdById: actorId,
    },
  });
}

export async function updateDealStatus(
  actorId: string,
  dealId: string,
  status: DealStatus,
) {
  await requireAdmin(actorId, 'ADMIN');
  return prisma.brandDeal.update({ where: { id: dealId }, data: { status } });
}

/** Cents to the money the designs show, without inventing a currency rate. */
export function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
