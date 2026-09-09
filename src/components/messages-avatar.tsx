import Image from 'next/image';
import { UsersThree } from '@phosphor-icons/react/dist/ssr';

/** A person's picture, or their initials while they have none. */
export function MessagesAvatar({
  name,
  avatarUrl,
  isGroup = false,
  size = 52,
}: {
  name: string;
  avatarUrl?: string | null;
  isGroup?: boolean;
  size?: number;
}) {
  if (avatarUrl)
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        className="messages-avatar"
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
      className="messages-avatar messages-avatar-fallback"
      style={{ width: size, height: size, fontSize: Math.round(size / 2.6) }}
    >
      {isGroup ? <UsersThree weight="fill" /> : initials || '?'}
    </span>
  );
}
