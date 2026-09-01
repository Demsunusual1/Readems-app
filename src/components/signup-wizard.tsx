'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle,
  Infinity,
  PenNib,
  ShieldCheck,
  User,
  EnvelopeSimple,
  At,
} from '@phosphor-icons/react';
import { interests, signupSchema, type SignupInput } from '@/lib/signup';
import { PasswordField } from './password-field';
import { Input } from './ui/input';
import { AuthShell } from './auth-shell';
import { AuthSocial } from './auth-social';

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

export function SignupWizard({
  initialRole = 'READER',
}: {
  initialRole?: SignupInput['role'];
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ ...initial, role: initialRole });
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    panel.current?.querySelector<HTMLElement>('h2')?.focus();
  }, [step]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState('/reader/dashboard');
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const update = (field: keyof Draft, value: string | string[]) =>
    setData((current) => ({ ...current, [field]: value }));
  const next = () => {
    setError('');
    if (step === 1) {
      const account = signupSchema
        .pick({ fullName: true, username: true, email: true, password: true })
        .safeParse(data);
      if (!account.success) return setError(account.error.issues[0].message);
      if (data.password !== data.confirmPassword)
        return setError('Passwords do not match.');
      if (!agreed)
        return setError('Agree to the Terms and Privacy Policy to continue.');
    }
    if (step === 3 && data.interests.length < 3)
      return setError('Choose at least 3 interests.');
    setStep((value) => value + 1);
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
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
      {type === 'password' ? (
        <PasswordField
          name={name}
          autoComplete={autoComplete}
          required={required}
          value={String(data[name])}
          onChange={(e) => update(name, e.target.value)}
        />
      ) : (
        <Input
          leadingIcon={
            name === 'email' ? (
              <EnvelopeSimple />
            ) : name === 'username' ? (
              <At />
            ) : (
              <User />
            )
          }
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={String(data[name])}
          onChange={(e) => update(name, e.target.value)}
        />
      )}
    </label>
  );
  return (
    <AuthShell mode="signup">
      <div className="auth-onboarding">
        <ol className="auth-steps" aria-label="Account setup progress">
          {['Create account', 'Personalize', 'You’re in'].map(
            (label, index) => {
              const stage = step === 1 ? 0 : step === 5 ? 2 : 1;
              return (
                <li
                  key={label}
                  aria-current={index === stage ? 'step' : undefined}
                >
                  <span>
                    {index < stage ? <Check aria-hidden="true" /> : index + 1}
                  </span>
                  {label}
                </li>
              );
            },
          )}
        </ol>
        <section ref={panel} className="signup-card" aria-label={steps[step]}>
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <p className="eyebrow">Account details</p>
              <h2 tabIndex={-1}>Create your Readems account</h2>
              <p>One account for everything you read, write and publish.</p>
              <div className="form-grid">
                {field('Full name', 'fullName', 'text', 'name')}
                {field('Username', 'username', 'text', 'username')}
                {field('Email address', 'email', 'email', 'email')}
                {field(
                  'Create password',
                  'password',
                  'password',
                  'new-password',
                )}
                {field(
                  'Confirm password',
                  'confirmPassword',
                  'password',
                  'new-password',
                )}
              </div>
              <div className="auth-password-guide">
                <ShieldCheck aria-hidden="true" />
                <p>
                  Keep your stories safe.
                  <span>
                    Use 12+ characters with uppercase, lowercase, and a number.
                  </span>
                </p>
              </div>
              <label className="agreement">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                />{' '}
                <span>
                  I agree to the <Link href="/terms">Terms of Service</Link> and{' '}
                  <Link href="/privacy">Privacy Policy</Link>.
                </span>
              </label>
              <button className="auth-submit" type="submit">
                Continue <ArrowRight aria-hidden="true" />
              </button>
              <AuthSocial />
              <p className="auth-switch">
                Already have an account? <Link href="/login">Log in</Link>
              </p>
            </form>
          )}
          {step === 2 && (
            <>
              <p className="eyebrow">Choose your path</p>
              <h2 tabIndex={-1}>How will you use Readems?</h2>
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
                      {value === 'READER' ? (
                        <BookOpen aria-hidden="true" />
                      ) : value === 'CREATOR' ? (
                        <PenNib aria-hidden="true" />
                      ) : (
                        <Infinity aria-hidden="true" />
                      )}
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
              <h2 tabIndex={-1}>What stories move you?</h2>
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
                      {active && <Check weight="bold" aria-hidden="true" />}
                      {item}
                    </button>
                  );
                })}
              </div>
              <Nav back={() => setStep(2)} onNext={next} />
            </>
          )}
          {step === 4 && (
            <form onSubmit={submit} aria-busy={loading}>
              <p className="eyebrow">One last touch</p>
              <h2 tabIndex={-1}>Set up your profile</h2>
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
              <div className="welcome-icon">
                <CheckCircle weight="fill" aria-hidden="true" />
              </div>
              <p className="eyebrow">You’re all set</p>
              <h2 tabIndex={-1}>
                Welcome to Readems, {data.fullName.split(' ')[0]}!
              </h2>
              <p>Your profile is ready and your recommendations are waiting.</p>
              <button onClick={() => router.push(destination)}>
                Go to my dashboard <ArrowRight aria-hidden="true" />
              </button>
            </>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>
      </div>
    </AuthShell>
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
      <button
        type="button"
        className="secondary"
        onClick={back}
        disabled={disabled}
      >
        <ArrowLeft aria-hidden="true" /> Back
      </button>
      <button
        type={onNext ? 'button' : 'submit'}
        onClick={onNext}
        disabled={disabled}
      >
        {label} <ArrowRight aria-hidden="true" />
      </button>
    </div>
  );
}
