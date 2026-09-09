import { prisma } from './prisma';
import { hashPassword, verifyPassword } from './auth';

export const themes = ['system', 'light', 'dark'] as const;
export type Theme = (typeof themes)[number];

export const languages = [
  'English',
  'French',
  'Portuguese',
  'Swahili',
  'Yoruba',
  'Hausa',
  'Igbo',
  'Arabic',
] as const;

export type Settings = {
  theme: Theme;
  language: string;
  country: string | null;
  emailNotifications: boolean;
  profilePublic: boolean;
  showReadingActivity: boolean;
};

const defaults: Settings = {
  theme: 'system',
  language: 'English',
  country: null,
  emailNotifications: true,
  profilePublic: true,
  showReadingActivity: false,
};

export async function getSettings(userId: string): Promise<Settings> {
  const stored = await prisma.userSettings.findUnique({ where: { userId } });
  if (!stored) return defaults;
  return {
    theme: (themes as readonly string[]).includes(stored.theme)
      ? (stored.theme as Theme)
      : 'system',
    language: stored.language,
    country: stored.country,
    emailNotifications: stored.emailNotifications,
    profilePublic: stored.profilePublic,
    showReadingActivity: stored.showReadingActivity,
  };
}

export async function saveSettings(
  userId: string,
  input: Partial<Settings>,
): Promise<Settings> {
  if (input.theme && !(themes as readonly string[]).includes(input.theme))
    throw new Error('Choose one of the available themes.');
  if (input.language && !languages.includes(input.language as never))
    throw new Error('Choose one of the available languages.');
  const data = {
    ...(input.theme ? { theme: input.theme } : {}),
    ...(input.language ? { language: input.language } : {}),
    ...(input.country !== undefined ? { country: input.country } : {}),
    ...(input.emailNotifications !== undefined
      ? { emailNotifications: input.emailNotifications }
      : {}),
    ...(input.profilePublic !== undefined
      ? { profilePublic: input.profilePublic }
      : {}),
    ...(input.showReadingActivity !== undefined
      ? { showReadingActivity: input.showReadingActivity }
      : {}),
  };
  await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  return getSettings(userId);
}

export async function saveProfile(
  userId: string,
  input: { fullName?: string; bio?: string; avatarUrl?: string | null },
) {
  const fullName = input.fullName?.trim();
  if (fullName !== undefined && (fullName.length < 2 || fullName.length > 80))
    throw new Error('A name needs between 2 and 80 characters.');
  const bio = input.bio?.trim();
  if (bio !== undefined && bio.length > 240)
    throw new Error('A bio can be up to 240 characters.');
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(bio !== undefined ? { bio: bio || null } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
  });
}

export async function changePassword(
  userId: string,
  current: string,
  next: string,
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(current, user.passwordHash)))
    throw new Error('That is not your current password.');
  if (next.length < 12)
    throw new Error('Use at least 12 characters for a new password.');
  if (!/[a-z]/.test(next) || !/[A-Z]/.test(next) || !/[0-9]/.test(next))
    throw new Error(
      'A new password needs a lowercase letter, an uppercase letter and a number.',
    );
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(next) },
  });
}

export async function listSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, expiresAt: true },
  });
}

export async function revokeSession(userId: string, sessionId: string) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId)
    throw new Error('That session is not yours.');
  await prisma.session.delete({ where: { id: sessionId } });
}

export async function blockPerson(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) throw new Error('You cannot block yourself.');
  await prisma.$transaction([
    prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      create: { blockerId, blockedId },
      update: {},
    }),
    // A block ends whatever following there was, in both directions.
    prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: blockerId, followingId: blockedId },
          { followerId: blockedId, followingId: blockerId },
        ],
      },
    }),
  ]);
}

export async function unblockPerson(blockerId: string, blockedId: string) {
  await prisma.block.deleteMany({ where: { blockerId, blockedId } });
}

export async function getBlockedPeople(userId: string) {
  const rows = await prisma.block.findMany({
    where: { blockerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      blocked: {
        select: { id: true, fullName: true, username: true, avatarUrl: true },
      },
    },
  });
  return rows.map((row) => ({
    id: row.blocked.id,
    name: row.blocked.fullName,
    username: row.blocked.username,
    avatarUrl: row.blocked.avatarUrl,
  }));
}

export async function isBlockedBetween(a: string, b: string) {
  return (
    (await prisma.block.count({
      where: {
        OR: [
          { blockerId: a, blockedId: b },
          { blockerId: b, blockedId: a },
        ],
      },
    })) > 0
  );
}
