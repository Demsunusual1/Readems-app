import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Features | Readems',
  description: 'Everything your story needs: discover, read, write, publish.',
};

const features = [
  {
    title: 'Discover',
    body: 'Browse by genre, region and mood, or search stories, writers, groups and posts.',
    href: '/discover',
  },
  {
    title: 'Read',
    body: 'A reader that keeps your place as you scroll, with text size and theme that follow you.',
    href: '/stories/baobab',
  },
  {
    title: 'Write',
    body: 'An editor that saves as you type, with word counts and a chapter you can publish or schedule.',
    href: '/creator/stories',
  },
  {
    title: 'Publish',
    body: 'Publish a chapter and the people following you hear about it the same moment readers can open it.',
    href: '/creator/stories',
  },
  {
    title: 'Library',
    body: 'Save stories, build reading lists, and set a goal for the year that counts what you finish.',
    href: '/library',
  },
  {
    title: 'Community',
    body: 'Post a thought, answer the weekly prompt, follow writers, and reply where the conversation is.',
    href: '/community',
  },
  {
    title: 'Groups',
    body: 'Join a group, post inside it, and RSVP to what it plans.',
    href: '/groups',
  },
  {
    title: 'Analytics',
    body: 'Reads, followers, engagement and what readers finished — counted, not estimated.',
    href: '/creator/analytics',
  },
];

export default function FeaturesPage() {
  return (
    <PageShell
      eyebrow="The Readems experience"
      title="Everything your story needs."
      intro="Discover readers. Write with purpose. Publish with pride. Belong to a community that celebrates stories and the people behind them."
    >
      <div className="written-cards">
        {features.map((feature) => (
          <article key={feature.title}>
            <h3>
              <Link href={feature.href}>{feature.title}</Link>
            </h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </div>

      <section>
        <h2>Not built yet</h2>
        <p>
          Offline reading, payouts to writers, live audio rooms and email
          notifications are not available. They are named here rather than shown
          as features that quietly do nothing.
        </p>
      </section>

      <section>
        <h2>Who Readems is for</h2>
        <h3>Readers</h3>
        <p>
          Find stories you will love, keep a shelf, and talk to the people who
          wrote them.
        </p>
        <h3>Writers</h3>
        <p>
          Write, publish, and reach readers without asking anybody’s permission.
        </p>
        <h3>Communities</h3>
        <p>
          Groups with their own feed, their own events, and their own
          moderators.
        </p>
      </section>
    </PageShell>
  );
}
