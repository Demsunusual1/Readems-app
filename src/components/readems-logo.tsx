import Link from 'next/link';

export function ReademsLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="readems-logo" aria-label="Readems home">
      <span aria-hidden="true">▰</span>
      {!compact && <strong>Readems</strong>}
    </Link>
  );
}
