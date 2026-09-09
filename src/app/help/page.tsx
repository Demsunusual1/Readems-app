import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Help & Support | Readems',
  description: 'Find answers, learn best practices, and get the help you need.',
};

const guides = [
  {
    title: 'Getting started',
    body: 'Make an account, choose what you like reading, and open your first story. Your place is kept as you read, so you can stop anywhere.',
  },
  {
    title: 'Write and publish',
    body: 'Start a story from My Stories, write chapters in the editor — it saves as you type — then publish a chapter or schedule it for later.',
  },
  {
    title: 'Your library',
    body: 'Save a story to read later, keep reading lists, and set a reading goal for the year. Everything on your shelf is yours alone.',
  },
  {
    title: 'Community',
    body: 'Post, reply, follow writers, and join groups. A group’s posts stay inside the group.',
  },
];

const faqs = [
  {
    question: 'How do I publish my story on Readems?',
    answer:
      'Open My Stories, create a story, add a chapter, and press Publish chapter. A story stays a draft, visible only to you, until a chapter is published.',
  },
  {
    question: 'How does the payout process work?',
    answer:
      'It does not yet. Readems has no payment provider configured, so no money moves and no balance is shown. When payouts are switched on, they will be described here.',
  },
  {
    question: 'Can I read offline?',
    answer:
      'Not yet. Nothing is stored on your device for offline reading, so the Downloads tab in your library is empty by design rather than by accident.',
  },
  {
    question: 'How do I stop somebody contacting me?',
    answer:
      'Block them from Profile & Settings. Blocking ends any following between you and stops them following you again.',
  },
  {
    question: 'How do I delete a story?',
    answer:
      'Open the story from My Stories and use Delete story. It removes the chapters and everything readers wrote on them, and cannot be undone.',
  },
];

export default function HelpPage() {
  return (
    <PageShell
      eyebrow="Help & Support"
      title="Find answers, and a way to reach us."
      intro="Guides for reading, writing and publishing on Readems, and an honest account of what is not built yet."
    >
      <div className="written-cards">
        {guides.map((guide) => (
          <article key={guide.title}>
            <h3>{guide.title}</h3>
            <p>{guide.body}</p>
          </article>
        ))}
      </div>

      <section>
        <h2>Frequently asked questions</h2>
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </section>

      <section>
        <h2>Contact support</h2>
        <p>
          Readems has no support inbox wired up yet, so there is no form here
          that would quietly go nowhere. Until there is, raise anything urgent
          with whoever runs your deployment.
        </p>
        <h3>Safety</h3>
        <p>
          A story’s author can remove comments on their own chapters, and anyone
          can block another account from{' '}
          <Link href="/settings">Profile &amp; Settings</Link>.
        </p>
      </section>
    </PageShell>
  );
}
