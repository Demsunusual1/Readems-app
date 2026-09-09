import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Terms of Service | Readems',
  description: 'The terms you agree to when you use Readems.',
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms of Service"
      title="What we agree on."
      intro="Plain terms for using Readems. They apply to this deployment of the software."
    >
      <section>
        <h2>Your account</h2>
        <p>
          You are responsible for what happens under your account, and for
          keeping your password to yourself. You can end any session, and change
          your password, from Profile &amp; Settings.
        </p>
      </section>

      <section>
        <h2>What you write</h2>
        <p>
          Your stories, chapters, posts, reviews and comments stay yours. By
          publishing them here you allow Readems to store them and show them to
          the readers you have published them to. Deleting a story removes it,
          its chapters, and the comments left on them.
        </p>
      </section>

      <section>
        <h2>What is not allowed</h2>
        <ul>
          <li>Publishing work that is not yours to publish.</li>
          <li>Harassment, threats, or targeting a person or group.</li>
          <li>Impersonating somebody else.</li>
          <li>
            Attempting to break, overload, or extract data from the service.
          </li>
        </ul>
        <p>
          A story’s author can remove comments on their own chapters, and any
          account can be blocked from Profile &amp; Settings.
        </p>
      </section>

      <section>
        <h2>Payments</h2>
        <p>
          There are none. No payment provider is configured, nothing is charged,
          and nothing is paid out. If that changes, these terms change with it.
        </p>
      </section>

      <section>
        <h2>Ending things</h2>
        <p>
          You may stop using Readems at any time. Whoever operates this
          deployment may suspend an account that breaks these terms.
        </p>
        <p>
          <Link href="/privacy">Read the privacy policy</Link>
        </p>
      </section>
    </PageShell>
  );
}
