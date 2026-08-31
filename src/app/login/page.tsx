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
          <div className="oauth-group" aria-label="Social sign-in unavailable">
            <button disabled>
              <b className="google">G</b> Continue with Google
            </button>
            <button disabled>
              <b className="apple">●</b> Continue with Apple
            </button>
          </div>
          <div className="auth-divider">
            <span>or</span>
          </div>
          <LoginForm />
          <p className="auth-switch">
            New to Readems? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </section>
      <aside className="auth-art login-art">
        <h2>
          Your next
          <br />
          chapter is waiting.
        </h2>
        <div className="open-book" aria-hidden="true">
          ⌁
        </div>
      </aside>
      <nav className="auth-footer" aria-label="Legal and support">
        <Link href="/help">Help</Link>
        <span>•</span>
        <Link href="/privacy">Privacy</Link>
        <span>•</span>
        <Link href="/terms">Terms</Link>
      </nav>
    </main>
  );
}
