import { z } from 'zod';

export type Chapter = {
  number: number;
  title: string;
  paragraphs: string[];
  authorNote?: string | null;
};

export function readingMinutes(chapter: Pick<Chapter, 'paragraphs'>) {
  return Math.max(
    1,
    Math.ceil(chapter.paragraphs.join(' ').split(/\s+/).length / 200),
  );
}

// Shape only. Which chapters exist, and how many paragraphs each one has, is
// a database question, so the position is checked against the stored chapter
// in `isReadingPositionValid` rather than against a compiled-in table.
export const progressSchema = z
  .object({
    storyId: z.string().trim().min(1).max(80),
    chapter: z.number().int().positive(),
    paragraph: z.number().int().nonnegative(),
    completed: z.boolean(),
  })
  .strict();

export type ReadingPosition = z.infer<typeof progressSchema>;

export function isReadingPositionValid(
  paragraphCount: number,
  position: Pick<ReadingPosition, 'paragraph' | 'completed'>,
) {
  if (paragraphCount < 1) return false;
  if (position.paragraph >= paragraphCount) return false;
  return !position.completed || position.paragraph === paragraphCount - 1;
}
