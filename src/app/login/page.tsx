import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { ReademsLogo } from '@/components/readems-logo';
import { dashboardForRole, getCurrentUser } from '@/lib/auth';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(dashboardForRole(user.role));
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <ReademsLogo />
        <div className="auth-content">
          <h1>Welcome back to Readems</h1>
          <p>Continue the story where you left off.</p>
          <div className="oauth-group" aria-describedby="oauth-note">
            <button disabled>ⓖ Continue with Google</button>
            <button disabled>● Continue with Apple</button>
          </div>
          <p id="oauth-note" className="oauth-note">
            Social sign-in is not configured yet.
          </p>
          <div className="auth-divider">
            <span>or</span>
          </div>
          <LoginForm />
          <p className="auth-switch">
            New to Readems? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </section>
      <aside
        className="auth-art"
        aria-label="An open book beneath a sky full of stories"
      >
        <h2>
          Your next
          <br />
          chapter is waiting.
        </h2>
        <div aria-hidden="true">
          ✦<span>▱</span>✧
        </div>
      </aside>
      <nav className="auth-footer" aria-label="Legal and support">
        <Link href="/help">Help</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </main>
  );
}
