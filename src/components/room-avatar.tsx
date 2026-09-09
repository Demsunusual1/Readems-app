import Image from 'next/image';

/** Initials stand in for a missing picture, in both server and client trees. */
export function RoomAvatar({
  name,
  url,
  size = 44,
}: {
  name: string;
  url: string | null;
  size?: number;
}) {
  if (url)
    return (
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        className="room-avatar"
      />
    );
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span
      aria-hidden="true"
      className="room-avatar room-avatar-initials"
      style={{ width: size, height: size, fontSize: Math.round(size / 2.6) }}
    >
      {initials || '?'}
    </span>
  );
}
