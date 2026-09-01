import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { AuthShell } from '@/components/auth-shell';
import { AuthSocial } from '@/components/auth-social';
import { dashboardForRole, getCurrentUser } from '@/lib/auth';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(dashboardForRole(user.role));
  return (
    <AuthShell mode="login">
      <section className="auth-login-panel" aria-label="Log in to Readems">
        <LoginForm />
        <AuthSocial />
        <p className="auth-switch">
          Don’t have an account? <Link href="/signup">Create account</Link>
        </p>
      </section>
    </AuthShell>
  );
}
