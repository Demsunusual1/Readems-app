import { PrismaClient } from '@prisma/client';
import {
  editorialAuthor,
  seedGroups,
  seedPrompt,
  seedStories,
} from '../src/lib/seed-data.ts';

const prisma = new PrismaClient();
const day = 24 * 60 * 60 * 1000;

async function main() {
  await prisma.user.upsert({
    where: { id: editorialAuthor.id },
    create: editorialAuthor,
    update: {
      fullName: editorialAuthor.fullName,
      bio: editorialAuthor.bio,
    },
  });

  for (const story of seedStories) {
    const publishedAt = new Date(Date.now() - story.publishedDaysAgo * day);
    const fields = {
      title: story.title,
      synopsis: story.synopsis,
      coverUrl: story.coverUrl,
      genre: story.genre,
      audience: story.audience,
      tags: story.tags,
      featured: story.featured,
      status: 'PUBLISHED' as const,
      authorId: editorialAuthor.id,
    };
    await prisma.story.upsert({
      where: { id: story.id },
      create: { id: story.id, ...fields, publishedAt },
      update: fields,
    });

    for (const chapter of story.chapters) {
      const body = chapter.paragraphs.join('\n\n');
      const chapterFields = {
        title: chapter.title,
        body,
        authorNote: chapter.authorNote ?? null,
        status: 'PUBLISHED' as const,
      };
      await prisma.chapter.upsert({
        where: {
          storyId_number: { storyId: story.id, number: chapter.number },
        },
        create: {
          storyId: story.id,
          number: chapter.number,
          ...chapterFields,
          publishedAt,
        },
        update: chapterFields,
      });
    }
  }

  for (const group of seedGroups) {
    await prisma.group.upsert({
      where: { id: group.id },
      create: {
        ...group,
        createdById: editorialAuthor.id,
        members: { create: { userId: editorialAuthor.id, role: 'FOUNDER' } },
      },
      update: {
        name: group.name,
        tagline: group.tagline,
        description: group.description,
        topic: group.topic,
      },
    });
  }

  // The prompt belongs to the current week, starting on Monday.
  const now = new Date();
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  await prisma.prompt.upsert({
    where: { weekOf: monday },
    create: { ...seedPrompt, weekOf: monday },
    update: seedPrompt,
  });

  const stories = await prisma.story.count();
  const chapters = await prisma.chapter.count();
  const groups = await prisma.group.count();
  console.log(
    `Seeded editorial catalogue: ${stories} stories, ${chapters} chapters, ${groups} groups.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
