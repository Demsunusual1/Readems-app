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

/**
 * How far through a whole story a reader is, as a percentage: the chapters
 * behind them plus how far into the current one they have read.
 */
export function storyPercent(
  chapterNumbers: number[],
  position: Pick<ReadingPosition, 'chapter' | 'paragraph' | 'completed'>,
  paragraphCount: number,
) {
  const index = chapterNumbers.indexOf(position.chapter);
  if (index < 0) return 0;
  const through = position.completed
    ? 1
    : (position.paragraph + 1) / Math.max(1, paragraphCount);
  return Math.min(
    100,
    Math.round(((index + through) / chapterNumbers.length) * 100),
  );
}

export function isStoryFinished(
  chapterNumbers: number[],
  position: Pick<ReadingPosition, 'chapter' | 'completed'>,
) {
  return position.completed && chapterNumbers.at(-1) === position.chapter;
}
