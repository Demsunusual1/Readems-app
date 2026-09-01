'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { PasswordField } from './password-field';
import { Input } from './ui/input';

export function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    if (!email || !password) return setError('Enter your email and password.');
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as {
        error?: string;
        dashboard?: string;
      };
      if (!response.ok || !result.dashboard)
        throw new Error(result.error ?? 'Unable to log in.');
      router.push(result.dashboard);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="auth-form" onSubmit={submit} aria-busy={loading}>
      <label>
        Email address
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@example.com"
          leadingIcon={<EnvelopeSimple size={21} />}
        />
      </label>
      <label>
        Password
        <PasswordField
          name="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
        />
      </label>
      <Link className="forgot" href="/help">
        Forgot password?
      </Link>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button className="auth-submit" disabled={loading}>
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
