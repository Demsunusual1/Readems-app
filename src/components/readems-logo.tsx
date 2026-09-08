import { Logo } from './ui/logo';

export function ReademsLogo({
  compact = false,
  href = '/',
  tone = 'dark',
}: {
  compact?: boolean;
  href?: string;
  tone?: 'dark' | 'light';
}) {
  return <Logo compact={compact} href={href} tone={tone} />;
}
