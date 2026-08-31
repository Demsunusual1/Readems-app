import { describe, expect, it } from 'vitest';
import { loginSchema } from './login';

describe('loginSchema', () => {
  it('normalizes valid credentials', () => {
    const result = loginSchema.parse({
      email: ' KEMI@EXAMPLE.COM ',
      password: 'a password',
    });
    expect(result.email).toBe('kemi@example.com');
  });
  it('requires a valid email and password', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: '' }).success).toBe(
      false,
    );
  });
});
