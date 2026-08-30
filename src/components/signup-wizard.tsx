'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { interests, type SignupInput } from '@/lib/signup';

type Draft = SignupInput & { confirmPassword: string };
const initial: Draft = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'READER',
  interests: [],
  bio: '',
  avatarUrl: '',
};
const steps = [
  'Welcome',
  'Account',
  'Your path',
  'Interests',
  'Profile',
  'Complete',
];

export function SignupWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState('/dashboard/reader');
  const router = useRouter();
  const update = (field: keyof Draft, value: string | string[]) =>
    setData((current) => ({ ...current, [field]: value }));
  const next = () => {
    setError('');
    if (step === 1) {
      if (!data.fullName.trim() || !data.username.trim() || !data.email.trim())
        return setError('Complete every account field.');
      if (data.password.length < 12)
        return setError('Password must be at least 12 characters.');
      if (data.password !== data.confirmPassword)
        return setError('Passwords do not match.');
    }
    if (step === 3 && data.interests.length < 3)
      return setError('Choose at least 3 interests.');
    setStep((value) => value + 1);
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { confirmPassword: _, ...payload } = data;
    void _;
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        error?: string;
        dashboard?: string;
      };
      if (!response.ok || !result.dashboard)
        throw new Error(result.error ?? 'Unable to create account.');
      setDestination(result.dashboard);
      setStep(5);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to create account.',
      );
    } finally {
      setLoading(false);
    }
  }
  const field = (
    label: string,
    name: keyof Draft,
    type = 'text',
    autoComplete?: string,
    required = true,
  ) => (
    <label>
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={String(data[name])}
        onChange={(e) => update(name, e.target.value)}
      />
    </label>
  );
  return (
    <main className="signup-shell">
      <header className="signup-header">
        <Link href="/" className="brand">
          <span className="brand-mark">R</span>
          <b>Readems</b>
        </Link>
        <span>Step {Math.min(step + 1, 6)} of 6</span>
      </header>
      <div className="progress" aria-label={`Signup progress: ${steps[step]}`}>
        <i style={{ width: `${((step + 1) / 6) * 100}%` }} />
      </div>
      <section className="signup-card" aria-live="polite">
        {step === 0 && (
          <>
            <div className="welcome-icon">✦</div>
            <p className="eyebrow">Welcome to Readems</p>
            <h1>Your next chapter starts here.</h1>
            <p>
              Join a global community where readers discover unforgettable
              stories and creators bring new worlds to life.
            </p>
            <button onClick={next}>
              Create my account <span>→</span>
            </button>
            <small>Free to join. Your stories, your community.</small>
          </>
        )}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            <p className="eyebrow">Account details</p>
            <h1>Let’s get to know you</h1>
            <div className="form-grid">
              {field('Full name', 'fullName', 'text', 'name')}
              {field('Username', 'username', 'text', 'username')}
              {field('Email address', 'email', 'email', 'email')}
              {field('Password', 'password', 'password', 'new-password')}
              {field(
                'Confirm password',
                'confirmPassword',
                'password',
                'new-password',
              )}
            </div>
            <p className="hint">
              Use 12+ characters with uppercase, lowercase, and a number.
            </p>
            <Nav back={() => setStep(0)} />
          </form>
        )}
        {step === 2 && (
          <>
            <p className="eyebrow">Choose your path</p>
            <h1>How will you use Readems?</h1>
            <p>You can change this later in settings.</p>
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
              ).map(([value, title, copy]) => (
                <button
                  key={value}
                  className={`choice ${data.role === value ? 'selected' : ''}`}
                  aria-pressed={data.role === value}
                  onClick={() => update('role', value)}
                >
                  <span>
                    {value === 'READER' ? '◉' : value === 'CREATOR' ? '✎' : '∞'}
                  </span>
                  <b>{title}</b>
                  <small>{copy}</small>
                </button>
              ))}
            </div>
            <Nav back={() => setStep(1)} onNext={next} />
          </>
        )}
        {step === 3 && (
          <>
            <p className="eyebrow">Make it yours</p>
            <h1>What stories move you?</h1>
            <p>
              Choose at least 3 so we can personalize your experience.{' '}
              <b>{data.interests.length} selected</b>
            </p>
            <div className="interest-grid">
              {interests.map((item) => {
                const active = data.interests.includes(item);
                return (
                  <button
                    key={item}
                    className={active ? 'selected' : ''}
                    aria-pressed={active}
                    onClick={() =>
                      update(
                        'interests',
                        active
                          ? data.interests.filter((x) => x !== item)
                          : [...data.interests, item],
                      )
                    }
                  >
                    {active ? '✓ ' : ''}
                    {item}
                  </button>
                );
              })}
            </div>
            <Nav back={() => setStep(2)} onNext={next} />
          </>
        )}
        {step === 4 && (
          <form onSubmit={submit}>
            <p className="eyebrow">One last touch</p>
            <h1>Set up your profile</h1>
            <p>Help the community recognize you. Both fields are optional.</p>
            {field('Profile photo URL', 'avatarUrl', 'url', undefined, false)}
            <label>
              Short bio
              <textarea
                value={data.bio}
                maxLength={240}
                onChange={(e) => update('bio', e.target.value)}
                placeholder="Tell readers a little about yourself…"
              />
              <small>{data.bio?.length ?? 0}/240</small>
            </label>
            <Nav
              back={() => setStep(3)}
              label={loading ? 'Creating account…' : 'Finish signup'}
              disabled={loading}
            />
          </form>
        )}
        {step === 5 && (
          <>
            <div className="welcome-icon">✓</div>
            <p className="eyebrow">You’re all set</p>
            <h1>Welcome to Readems, {data.fullName.split(' ')[0]}!</h1>
            <p>Your profile is ready and your recommendations are waiting.</p>
            <button onClick={() => router.push(destination)}>
              Go to my dashboard <span>→</span>
            </button>
          </>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}

function Nav({
  back,
  onNext,
  label = 'Continue',
  disabled = false,
}: {
  back: () => void;
  onNext?: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="nav-buttons">
      <button type="button" className="secondary" onClick={back}>
        ← Back
      </button>
      <button
        type={onNext ? 'button' : 'submit'}
        onClick={onNext}
        disabled={disabled}
      >
        {label} →
      </button>
    </div>
  );
}
