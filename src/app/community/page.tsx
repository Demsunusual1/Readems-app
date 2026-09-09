import Link from 'next/link';
import { ChatCircle, UsersThree } from '@phosphor-icons/react/dist/ssr';
import { CreatorPlatformNavigation } from '@/components/creator-platform-navigation';
import { getCurrentUser } from '@/lib/auth';
export default async function Page() {
  const user = await getCurrentUser();
  return (
    <main className="studio-page">
      <section className="studio-hero">
        <small>READEMS COMMUNITY</small>
        <h1>Connect through stories</h1>
        <p>Join groups, discussions and reading circles.</p>
      </section>
      <section className="studio-tools">
        <Link href="/messages">
          <span>
            <ChatCircle />
          </span>
          <div>
            <strong>Community conversations</strong>
            <small>Talk with readers and creators</small>
          </div>
        </Link>
        <Link href="/messages">
          <span>
            <UsersThree />
          </span>
          <div>
            <strong>Groups</strong>
            <small>Reading circles and writing communities</small>
          </div>
        </Link>
      </section>
      {user?.role === 'CREATOR' ? (
        <CreatorPlatformNavigation active="community" />
      ) : null}
    </main>
  );
}
