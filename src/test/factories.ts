import { prisma } from '@/lib/prisma';

export function uniqueSuffix() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function createTestUser(
  overrides: Partial<{
    fullName: string;
    username: string;
    email: string;
    role: 'READER' | 'CREATOR' | 'BOTH';
    interests: string[];
  }> = {},
) {
  const suffix = uniqueSuffix();
  return prisma.user.create({
    data: {
      fullName: overrides.fullName ?? 'Test Reader',
      username: overrides.username ?? `reader_${suffix}`,
      email: overrides.email ?? `reader_${suffix}@example.com`,
      passwordHash: 'disabled',
      role: overrides.role ?? 'READER',
      interests: overrides.interests ?? [],
    },
  });
}

export async function createTestStory(
  authorId: string,
  overrides: Partial<{
    id: string;
    title: string;
    genre: string;
    tags: string[];
    featured: boolean;
    chapters: { title: string; body: string }[];
  }> = {},
) {
  const suffix = uniqueSuffix();
  const chapters = overrides.chapters ?? [
    { title: 'Chapter one', body: 'First.\n\nSecond.' },
  ];
  return prisma.story.create({
    data: {
      id: overrides.id ?? `story-${suffix}`,
      title: overrides.title ?? `Test Story ${suffix}`,
      synopsis: 'A story created by the test suite.',
      coverUrl: '/readems/story-baobab-cover.png',
      genre: overrides.genre ?? 'Drama',
      tags: overrides.tags ?? [],
      featured: overrides.featured ?? false,
      authorId,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1000),
      chapters: {
        create: chapters.map((chapter, index) => ({
          number: index + 1,
          title: chapter.title,
          body: chapter.body,
          status: 'PUBLISHED' as const,
          publishedAt: new Date(Date.now() - 1000),
        })),
      },
    },
  });
}

/** Removes a test user and everything that cascades from them. */
export async function deleteTestUsers(...userIds: string[]) {
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}
