import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { prisma } from '@/lib/prisma';

// The figures on this page are counted when somebody asks for it, so it is
// not prerendered at build time — a build has no database to count from.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Readems',
  description: 'Every voice deserves a reader.',
};

export default async function AboutPage() {
  const [readers, stories, chapters, groups] = await Promise.all([
    prisma.user.count(),
    prisma.story.count({ where: { status: 'PUBLISHED' } }),
    prisma.chapter.count({ where: { status: 'PUBLISHED' } }),
    prisma.group.count(),
  ]);

  return (
    <PageShell
      eyebrow="Our mission"
      title="Every voice deserves a reader."
      intro="Readems is where stories find their people — across every culture, language and horizon."
    >
      <section>
        <h2>Where we are today</h2>
        <p>
          These are the real numbers on this deployment, not a target and not a
          projection.
        </p>
        <ul>
          <li>
            {readers} {readers === 1 ? 'account' : 'accounts'}
          </li>
          <li>
            {stories} published {stories === 1 ? 'story' : 'stories'}
          </li>
          <li>
            {chapters} published {chapters === 1 ? 'chapter' : 'chapters'}
          </li>
          <li>
            {groups} {groups === 1 ? 'group' : 'groups'}
          </li>
        </ul>
      </section>

      <section>
        <h2>What we believe</h2>
        <h3>Inclusion</h3>
        <p>Every voice and perspective belongs here, not only the loudest.</p>
        <h3>Creativity</h3>
        <p>
          Bold ideas and original work, championed rather than smoothed out.
        </p>
        <h3>Integrity</h3>
        <p>
          Numbers on this site are counted, not invented. Where something is not
          built, the page says so.
        </p>
        <h3>Community</h3>
        <p>We rise together: readers, writers, and the people between.</p>
      </section>

      <section>
        <h2>Trust and safety</h2>
        <p>
          Sessions are stored as hashes, passwords with scrypt, and
          state-changing requests are checked against the host they came from.
          Writers can remove comments on their own chapters and anyone can block
          another account.
        </p>
        <p>
          <Link href="/privacy">How we handle your data</Link> ·{' '}
          <Link href="/terms">Terms</Link>
        </p>
      </section>
    </PageShell>
  );
}
