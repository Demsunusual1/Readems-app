import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { adminRoleLabels, ensureBootstrapAdmin, isAdmin } from '@/lib/admin';
import { AdminNav } from '@/components/admin-nav';
import { Logo } from '@/components/ui/logo';
import '@/components/admin.css';

export const metadata = { title: 'Readems Admin' };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const signedIn = await getCurrentUser();
  // The bootstrap list is checked here as well as at sign-in, so the first
  // admin does not have to sign out and back in after the address is added.
  const user = signedIn ? await ensureBootstrapAdmin(signedIn) : null;
  // Not a redirect: an address that is not yours should not confirm that it
  // exists.
  if (!isAdmin(user)) notFound();

  return (
    <div className="admin-page">
      <header className="admin-top">
        <div className="admin-top-brand">
          <Logo tone="light" />
          <span>Admin</span>
        </div>
        <div className="admin-top-who">
          <b>{user!.fullName}</b>
          <small>{adminRoleLabels[user!.adminRole]}</small>
        </div>
      </header>
      {children}
      <AdminNav />
    </div>
  );
}
