export type GoalPace = {
  books: number;
  state: 'ahead' | 'behind' | 'on track';
};

/**
 * How a reader stands against their annual goal, measured against how much of
 * the year has passed rather than against the whole year.
 */
export function goalPace(
  goal: { target: number; finished: number },
  now = new Date(),
): GoalPace {
  const year = now.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const elapsed = (now.getTime() - start) / (end - start);
  const difference = Math.round(goal.finished - goal.target * elapsed);
  return {
    books: Math.abs(difference),
    state: difference > 0 ? 'ahead' : difference < 0 ? 'behind' : 'on track',
  };
}
