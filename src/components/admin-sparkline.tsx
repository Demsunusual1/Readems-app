export type Point = { date: string; count: number };

/**
 * An area chart drawn straight from the daily counts, with no smoothing: the
 * design shows a decorative curve, but a line an admin might act on should be
 * the numbers and nothing else.
 */
export function AdminSparkline({
  points,
  label,
  height = 140,
  showAxis = false,
}: {
  points: Point[];
  label: string;
  height?: number;
  showAxis?: boolean;
}) {
  const width = 600;
  const peak = Math.max(...points.map((point) => point.count), 1);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const y = (count: number) => height - (count / peak) * (height - 12) - 6;
  const path = points
    .map(
      (point, index) => `${index ? 'L' : 'M'}${index * step} ${y(point.count)}`,
    )
    .join(' ');

  return (
    <figure className="admin-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}. Highest day: ${peak}.`}
      >
        <path
          className="admin-chart-fill"
          d={`${path} L${width} ${height} L0 ${height} Z`}
        />
        <path className="admin-chart-line" d={path} />
      </svg>
      {showAxis && (
        <figcaption>
          <span>{points.at(0)?.date}</span>
          <span>Highest day: {peak}</span>
          <span>{points.at(-1)?.date}</span>
        </figcaption>
      )}
    </figure>
  );
}
