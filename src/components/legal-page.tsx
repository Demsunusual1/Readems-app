import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { Logo } from './ui/logo';
import './legal-page.css';

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: readonly (readonly [string, string])[];
}) {
  return (
    <main className="legal-page">
      <header>
        <Logo tone="light" />
        <Link href="/signup">
          <ArrowLeft /> Back to signup
        </Link>
      </header>
      <article>
        <p>Readems</p>
        <h1>{title}</h1>
        <span>{intro}</span>
        {sections.map(([heading, copy]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{copy}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
