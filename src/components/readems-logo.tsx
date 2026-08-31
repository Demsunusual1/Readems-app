import Image from 'next/image';
import Link from 'next/link';

export function ReademsLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="readems-logo" aria-label="Readems home">
      <Image src="/readems-logo.svg" width={48} height={48} alt="" priority />
      {!compact && <strong>Readems</strong>}
    </Link>
  );
}
