import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Privacy Policy | Readems',
  description: 'What Readems stores, and what it does not.',
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="What we keep, and what we do not."
      intro="Written from the database schema rather than from a template."
    >
      <section>
        <h2>What is stored</h2>
        <ul>
          <li>
            Your name, username, email, and a scrypt hash of your password.
          </li>
          <li>Your bio, avatar, chosen interests and settings.</li>
          <li>
            Sessions, as a hash of the session token, with the date they start
            and expire.
          </li>
          <li>
            What you read: the story, chapter and paragraph you reached, and
            when you finished.
          </li>
          <li>
            What you write and do: stories, chapters, posts, comments, reviews,
            likes, follows, group memberships and RSVPs.
          </li>
        </ul>
      </section>

      <section>
        <h2>What is not collected</h2>
        <p>
          Readems does not track where you came from, where you are, or what you
          do elsewhere. There is no analytics script, no advertising identifier
          and no third-party tracker on these pages. Creator analytics are
          counted from the rows above and nothing else.
        </p>
      </section>

      <section>
        <h2>What stays on your device</h2>
        <p>
          Your recent searches and your per-device reading preferences are kept
          in your browser, not on the server.
        </p>
      </section>

      <section>
        <h2>Who can see what</h2>
        <p>
          Your reading progress and your library are yours alone. Your profile
          can be made private, and what you are reading is only shown on it if
          you ask for that. Blocking somebody ends any following between you.
        </p>
        <p>
          <Link href="/settings">Change these in Profile &amp; Settings</Link>
        </p>
      </section>

      <section>
        <h2>Email</h2>
        <p>
          No email provider is configured, so Readems does not send email —
          including for password resets. The preference is stored for when it
          does.
        </p>
      </section>
    </PageShell>
  );
}
