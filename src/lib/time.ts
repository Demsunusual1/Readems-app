const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;
const month = 30 * day;
const year = 365 * day;

/** Short, readable age of something, as the community screens show it. */
export function relativeTime(value: Date, now = new Date()) {
  const elapsed = now.getTime() - value.getTime();
  if (elapsed < minute) return 'just now';
  if (elapsed < hour) return `${Math.floor(elapsed / minute)}m ago`;
  if (elapsed < day) return `${Math.floor(elapsed / hour)}h ago`;
  if (elapsed < month) return `${Math.floor(elapsed / day)}d ago`;
  if (elapsed < year) return `${Math.floor(elapsed / month)}mo ago`;
  return `${Math.floor(elapsed / year)}y ago`;
}
