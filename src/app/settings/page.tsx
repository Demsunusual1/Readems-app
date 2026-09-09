import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserCircle } from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import {
  getBlockedPeople,
  getSettings,
  languages,
  listSessions,
} from '@/lib/settings';
import { SettingsSections } from '@/components/settings-sections';
import { Logo } from '@/components/ui/logo';
import '@/components/settings.css';

export const metadata: Metadata = {
  title: 'Profile & Settings | Readems',
  description:
    'Manage your account, preferences and reading experience on Readems.',
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [settings, sessions, blocked] = await Promise.all([
    getSettings(user.id),
    listSessions(user.id),
    getBlockedPeople(user.id),
  ]);

  return (
    <div className="settings-page">
      <header className="settings-hero">
        <Logo tone="light" />
        <h1>Profile &amp; Settings</h1>
        <p>Manage your account, preferences, and reading experience</p>
      </header>

      <main className="settings-main">
        <section className="settings-identity">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              width={72}
              height={72}
              className="settings-avatar"
            />
          ) : (
            <UserCircle size={72} className="settings-avatar" />
          )}
          <div>
            <strong>{user.fullName}</strong>
            <small>{user.email}</small>
            <span className="settings-role">
              {user.role === 'BOTH'
                ? 'Reader and creator'
                : user.role === 'CREATOR'
                  ? 'Creator'
                  : 'Reader'}
            </span>
          </div>
          <Link href={`/u/${user.username}`}>View public profile</Link>
        </section>

        <SettingsSections
          profile={{
            fullName: user.fullName,
            bio: user.bio ?? '',
            username: user.username,
          }}
          settings={settings}
          languages={[...languages]}
          sessions={sessions.map((session) => ({
            id: session.id,
            createdAt: session.createdAt.toISOString(),
            expiresAt: session.expiresAt.toISOString(),
          }))}
          blocked={blocked}
        />

        <section className="settings-card">
          <h2>Help &amp; Support</h2>
          <p>Find answers, guides and a way to reach us.</p>
          <Link href="/help">Open help and support</Link>
        </section>

        <form className="settings-logout" method="post" action="/api/logout">
          <button type="submit">Log out</button>
        </form>
      </main>
    </div>
  );
}
