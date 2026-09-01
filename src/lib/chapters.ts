import { z } from 'zod';

export type Chapter = { number: number; title: string; paragraphs: string[] };
// Original demonstration text for testing the reading experience, not a published work.
const baobab: Chapter[] = [
  {
    number: 1,
    title: 'Roots of Our Past',
    paragraphs: [
      'The first thing Nene noticed was the silence. Every evening, the children gathered beneath the baobab to trade stories while their parents called them home. Tonight, the space beneath its branches was empty. Even the little wooden bench where her grandmother sat had been turned towards the trunk.',
      'She set down the basket she had brought from the market. In the last light, the tree looked less like something growing out of the earth than something holding it together. Its roots crossed the path in thick, patient lines. Nene had stepped over them all her life without once wondering where they ended.',
      'A folded piece of cloth lay on the bench. She recognised the blue stitching immediately. Her mother had made that pattern on every school uniform she repaired: three small waves, so Nene could always find her own shirt among the washing. Her mother had been gone for seven rainy seasons.',
      'Inside the cloth was a key. Not a grand brass key from one of the houses near the road, but a small iron one with a bent tooth. Beneath it, in handwriting she did not recognise, someone had written: Ask what was kept, not what was lost.',
      'Nene read the sentence twice. Behind her, footsteps stopped at the edge of the path. Her grandmother stood there with an empty water pot against her hip. She looked at the cloth first, and then at the tree. For a long moment, neither of them spoke.',
      '“I thought we had more time,” her grandmother said. Nene closed her fingers around the key. The metal was warm from the evening air. “Time for what?” she asked. Her grandmother lowered the pot carefully to the ground. “For you to decide whether you wanted the whole story.”',
    ],
  },
  {
    number: 2,
    title: 'The House Beyond the Path',
    paragraphs: [
      'They took the narrow path behind the old school. Nene had expected her grandmother to hurry, but she walked at the pace she always did, stopping once to move a fallen branch away from the drainage channel. It was an ordinary kindness on a night when nothing felt ordinary.',
      'At the last house, her grandmother held out her hand for the key, then changed her mind. “You should open it.” The door resisted before giving way with a scrape. Inside, a table stood beneath a shuttered window. There was no treasure, no hidden room. Just a wooden box and a chair with one repaired leg.',
      'The box contained letters, tied in bundles with strips of faded fabric. Some were addressed to people Nene knew. Others carried names she had only heard in stories. Her mother had copied each letter into a notebook, keeping a record for neighbours who could not read the words sent home to them.',
      '“She wanted nobody to be forgotten,” her grandmother said. Nene opened the notebook. Between lists of names and dates were small observations: a child had started school; a brother had returned; somebody needed help repairing a roof before the rains. The pages held a village remembering itself.',
      'Near the back, Nene found a page with her own name at the top. Underneath it was a single sentence: When she is ready, let her add what she sees. She ran a finger beside the handwriting without touching the ink. For the first time in years, remembering her mother felt like an invitation rather than a closed door.',
      'In the morning, Nene carried the notebook to the baobab. She turned the bench towards the path again. When the first child arrived, she moved over to make room. “Tell me something that happened today,” she said. Then she opened to a clean page.',
    ],
  },
];
export function getChapters(storyId: string): Chapter[] {
  return storyId === 'baobab' ? baobab : [];
}
export function getChapter(storyId: string, number: number) {
  return getChapters(storyId).find((chapter) => chapter.number === number);
}
export function readingMinutes(chapter: Chapter) {
  return Math.max(
    1,
    Math.ceil(chapter.paragraphs.join(' ').split(/\s+/).length / 200),
  );
}
export const progressSchema = z
  .object({
    storyId: z.string().max(80),
    chapter: z.number().int().positive(),
    paragraph: z.number().int().nonnegative(),
    completed: z.boolean(),
  })
  .strict()
  .superRefine((value, context) => {
    const chapter = getChapter(value.storyId, value.chapter);
    if (
      !chapter ||
      value.paragraph >= chapter.paragraphs.length ||
      (value.completed && value.paragraph !== chapter.paragraphs.length - 1)
    )
      context.addIssue({
        code: 'custom',
        message: 'Choose a valid chapter and reading position.',
      });
  });
