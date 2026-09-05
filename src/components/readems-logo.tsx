import { Logo } from './ui/logo';

export function ReademsLogo({
  compact = false,
  tone = 'dark',
}: {
  compact?: boolean;
  tone?: 'dark' | 'light';
}) {
  return <Logo compact={compact} tone={tone} />;
}
