import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function Dashboard({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/signup');
  const { kind } = await params;
  const creator = kind === 'creator' && user.role !== 'READER';
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <Link className="brand" href="/">
          <span className="brand-mark">R</span>
          <b>Readems</b>
        </Link>
        <span aria-label="Profile">●</span>
      </header>
      <section className="dashboard-welcome">
        <p>{creator ? 'CREATOR DASHBOARD' : 'READER DASHBOARD'}</p>
        <h1>Welcome, {user.fullName.split(' ')[0]}! 👋</h1>
        <p>
          {creator
            ? 'Your stories are ready for their next chapter.'
            : 'What story will you fall in love with today?'}
        </p>
      </section>
      <section className="dashboard-grid">
        {(creator
          ? [
              ['My stories', 'Start building a world readers remember.'],
              ['Analytics', 'See how your writing connects.'],
              ['Community', 'Grow alongside your readers.'],
            ]
          : [
              ['For you', 'Fresh recommendations from your interests.'],
              ['Reading list', 'Your saved stories, all in one place.'],
              ['Following', 'Updates from creators you love.'],
            ]
        ).map(([title, copy]) => (
          <article className="dash-card" key={title}>
            <span>✦</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
