'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import { Logo } from './ui/logo';

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
    panel.current
      ?.querySelector<HTMLElement>('h2')
      ?.focus({ preventScroll: step === 1 });
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
      <div className={`auth-onboarding auth-onboarding-step-${step}`}>
        {step >= 2 && step <= 4 && (
          <header className="onboarding-topbar">
            <Logo tone="light" />
            <div
              className="onboarding-progress"
              aria-label={`Step ${step - 1} of 3`}
            >
              {[1, 2, 3].map((item) => (
                <span
                  key={item}
                  className={item <= step - 1 ? 'is-active' : undefined}
                >
                  {item}
                </span>
              ))}
              <small>Step {step - 1} of 3</small>
            </div>
          </header>
        )}
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
        <section
          ref={panel}
          className={`signup-card signup-step-${step}`}
          aria-label={steps[step]}
        >
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
              <p className="eyebrow">Step 1 of 3</p>
              <h2 tabIndex={-1}>Welcome to Readems</h2>
              <p>
                Tell us what inspires you most. We’ll personalize your
                experience.
              </p>
              <div className="choice-grid">
                {(
                  [
                    [
                      'READER',
                      'Reader',
                      'Discover stories, grow your mind, and join the conversation.',
                    ],
                    [
                      'CREATOR',
                      'Creator',
                      'Write your story, share your voice, and build your audience.',
                    ],
                    [
                      'BOTH',
                      'Both',
                      'Read, write, and connect—your complete creative home.',
                    ],
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
              <aside className="onboarding-note">
                <strong>A global community</strong>
                <span>
                  Join readers and writers from around the world in a space
                  built for stories that matter.
                </span>
              </aside>
              <Nav back={() => setStep(1)} onNext={next} />
            </>
          )}
          {step === 3 && (
            <>
              <p className="eyebrow">Step 2 of 3</p>
              <h2 tabIndex={-1}>What stories move you?</h2>
              <p>
                Choose the stories you love. We’ll personalize your Readems
                experience. <b>{data.interests.length} selected</b>
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
              <aside className="onboarding-note">
                <strong>Tailored just for you</strong>
                <span>
                  Your choices help us recommend stories, writers, and
                  communities you’ll love.
                </span>
              </aside>
              <Nav back={() => setStep(2)} onNext={next} />
            </>
          )}
          {step === 4 && (
            <form onSubmit={submit} aria-busy={loading}>
              <p className="eyebrow">Step 3 of 3</p>
              <h2 tabIndex={-1}>Create Your Reader Profile</h2>
              <p>
                Tell us about yourself so we can personalize your Readems
                experience.
              </p>
              <div className="onboarding-profile-photo">
                <Image
                  src="/readems/creator-chinelo-okoye.png"
                  alt="Profile preview"
                  width={180}
                  height={180}
                />
                <strong>Add a profile photo</strong>
                <span>Show the community who you are.</span>
              </div>
              <div className="onboarding-profile-grid">
                {field('Display Name', 'fullName', 'text', 'name')}
                {field('Username', 'username', 'text', 'username')}
              </div>
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
              <div className="onboarding-select-grid">
                <label>
                  Country / Region
                  <select defaultValue="Nigeria">
                    <option>Nigeria</option>
                    <option>Ghana</option>
                    <option>South Africa</option>
                    <option>United Kingdom</option>
                  </select>
                </label>
                <label>
                  Preferred Language
                  <select defaultValue="English">
                    <option>English</option>
                    <option>French</option>
                    <option>Portuguese</option>
                  </select>
                </label>
              </div>
              <fieldset className="onboarding-preferences">
                <legend>Content Preferences</legend>
                <small>Help us tailor your reading recommendations.</small>
                <div>
                  {['Fiction', 'Non-Fiction', 'Poetry', 'Comics'].map(
                    (preference) => (
                      <button
                        key={preference}
                        type="button"
                        className={preference === 'Fiction' ? 'selected' : ''}
                      >
                        {preference}
                        <span>{preference === 'Fiction' ? '✓' : '+'}</span>
                      </button>
                    ),
                  )}
                </div>
              </fieldset>
              <fieldset className="onboarding-privacy">
                <legend>Privacy &amp; Visibility</legend>
                <small>You can change these anytime in settings.</small>
                <label>
                  <span>
                    <strong>Show my profile to other readers</strong>
                    Allow others to discover and follow you.
                  </span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label>
                  <span>
                    <strong>Display my reading activity</strong>
                    Share your reads and reviews with followers.
                  </span>
                  <input type="checkbox" />
                </label>
              </fieldset>
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
