import { PrismaClient } from '@prisma/client';
import { editorialAuthor, seedStories } from '../src/lib/seed-data.ts';

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

  const stories = await prisma.story.count();
  const chapters = await prisma.chapter.count();
  console.log(
    `Seeded editorial catalogue: ${stories} stories, ${chapters} chapters.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
