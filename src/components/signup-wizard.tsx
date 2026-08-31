'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { interests, type SignupInput } from '@/lib/signup';
import { PasswordField } from './password-field';
import { ReademsLogo } from './readems-logo';
type Draft = SignupInput;
const initial: Draft = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  role: 'READER',
  interests: [],
  bio: '',
  avatarUrl: '',
};
export function SignupWizard() {
  const [step, setStep] = useState(0),
    [data, setData] = useState(initial),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false),
    [agreed, setAgreed] = useState(false),
    [destination, setDestination] = useState('/reader/dashboard');
  const router = useRouter();
  const update = (field: keyof Draft, value: string | string[]) =>
    setData((c) => ({ ...c, [field]: value }));
  const accountNext = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!data.fullName.trim() || !data.email.trim())
      return setError('Enter your full name and email address.');
    if (data.password.length < 8)
      return setError('Password must be at least 8 characters.');
    if (!agreed)
      return setError('Agree to the Terms and Privacy Policy to continue.');
    setData((c) => ({ ...c, username: c.username || c.email.split('@')[0] }));
    setStep(1);
  };
  async function submit() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as {
        error?: string;
        dashboard?: string;
      };
      if (!response.ok || !result.dashboard)
        throw new Error(result.error ?? 'Unable to create account.');
      setDestination(result.dashboard);
      setStep(4);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to create account.',
      );
    } finally {
      setLoading(false);
    }
  }
  if (step > 0)
    return (
      <main className="onboarding">
        <ReademsLogo />
        <section className="onboarding-card">
          <p className="eyebrow">Almost there · {step} of 3</p>
          {step === 1 && (
            <>
              <h1>How will you use Readems?</h1>
              <p>Choose the experience that fits you best.</p>
              <div className="choice-grid">
                {(
                  [
                    [
                      'READER',
                      'Reader',
                      'Discover stories and build your library.',
                    ],
                    [
                      'CREATOR',
                      'Creator',
                      'Publish stories and grow an audience.',
                    ],
                    ['BOTH', 'Both', 'Read, write, and do it all.'],
                  ] as const
                ).map(([v, t, c]) => (
                  <button
                    key={v}
                    className={`choice ${data.role === v ? 'selected' : ''}`}
                    onClick={() => update('role', v)}
                  >
                    <b>{t}</b>
                    <small>{c}</small>
                  </button>
                ))}
              </div>
              <Nav back={() => setStep(0)} next={() => setStep(2)} />
            </>
          )}
          {step === 2 && (
            <>
              <h1>What stories move you?</h1>
              <p>Choose at least three interests.</p>
              <div className="interest-grid">
                {interests.map((x) => (
                  <button
                    key={x}
                    className={data.interests.includes(x) ? 'selected' : ''}
                    onClick={() =>
                      update(
                        'interests',
                        data.interests.includes(x)
                          ? data.interests.filter((i) => i !== x)
                          : [...data.interests, x],
                      )
                    }
                  >
                    {data.interests.includes(x) ? '✓ ' : ''}
                    {x}
                  </button>
                ))}
              </div>
              {error && <p className="auth-error">{error}</p>}
              <Nav
                back={() => setStep(1)}
                next={() =>
                  data.interests.length >= 3
                    ? setStep(3)
                    : setError('Choose at least 3 interests.')
                }
              />
            </>
          )}
          {step === 3 && (
            <>
              <h1>Set up your profile</h1>
              <p>These details are optional.</p>
              <label>
                Profile photo URL
                <input
                  value={data.avatarUrl ?? ''}
                  onChange={(e) => update('avatarUrl', e.target.value)}
                />
              </label>
              <label>
                Short bio
                <textarea
                  value={data.bio ?? ''}
                  onChange={(e) => update('bio', e.target.value)}
                />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <Nav
                back={() => setStep(2)}
                next={submit}
                label={loading ? 'Creating account…' : 'Finish signup'}
              />
            </>
          )}
          {step === 4 && (
            <>
              <h1>Welcome to Readems, {data.fullName.split(' ')[0]}!</h1>
              <p>Your recommendations are waiting.</p>
              <button
                className="auth-submit"
                onClick={() => router.push(destination)}
              >
                Go to my dashboard →
              </button>
            </>
          )}
        </section>
      </main>
    );
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <ReademsLogo />
        <div className="auth-content">
          <h1>Join the Readems community</h1>
          <p>Discover stories, share your voice, and find your people.</p>
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
          <form className="auth-form" onSubmit={accountNext}>
            <label>
              Full name
              <span className="input-wrap">
                <span className="field-icon">♙</span>
                <input
                  value={data.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </span>
            </label>
            <label>
              Email address
              <span className="input-wrap">
                <span className="field-icon">✉</span>
                <input
                  value={data.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="name@example.com"
                  type="email"
                  autoComplete="email"
                />
              </span>
            </label>
            <label>
              Create password
              <PasswordField
                name="password"
                value={data.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Enter your password"
                autoComplete="new-password"
              />
            </label>
            <p className="password-guide">Use at least 8 characters.</p>
            <label className="agreement">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the <Link href="/terms">Terms of Service</Link> and{' '}
                <Link href="/privacy">Privacy Policy</Link>.
              </span>
            </label>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button className="auth-submit">Create account</button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>
      </section>
      <aside className="auth-art signup-art">
        <h2>
          Read. Write.
          <br />
          Belong.
        </h2>
        <div className="art-people" aria-hidden="true">
          ♟　♟　♟　♟
        </div>
      </aside>
      <AuthFooter />
    </main>
  );
}
function Nav({
  back,
  next,
  label = 'Continue',
}: {
  back: () => void;
  next: () => void | Promise<void>;
  label?: string;
}) {
  return (
    <div className="nav-buttons">
      <button className="secondary" onClick={back}>
        ← Back
      </button>
      <button onClick={next}>{label} →</button>
    </div>
  );
}
function AuthFooter() {
  return (
    <nav className="auth-footer">
      <Link href="/help">Help</Link>
      <span>•</span>
      <Link href="/privacy">Privacy</Link>
      <span>•</span>
      <Link href="/terms">Terms</Link>
    </nav>
  );
}
