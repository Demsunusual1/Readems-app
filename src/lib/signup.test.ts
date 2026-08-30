import { describe, expect, it } from 'vitest';
import { signupSchema } from './signup';

const valid = {
  fullName: 'Kemi Adebayo',
  username: 'kemi_reads',
  email: 'kemi@example.com',
  password: 'A-safe-password9',
  role: 'READER',
  interests: ['Drama', 'Poetry', 'Mystery'],
};
describe('signupSchema', () => {
  it('accepts a complete signup', () =>
    expect(signupSchema.safeParse(valid).success).toBe(true));
  it('rejects weak passwords', () =>
    expect(
      signupSchema.safeParse({ ...valid, password: 'password' }).success,
    ).toBe(false));
  it('requires three interests', () =>
    expect(
      signupSchema.safeParse({ ...valid, interests: ['Drama'] }).success,
    ).toBe(false));
  it('normalizes identity fields', () => {
    const result = signupSchema.parse({
      ...valid,
      username: 'KEMI_READS',
      email: 'KEMI@EXAMPLE.COM',
    });
    expect(result.username).toBe('kemi_reads');
    expect(result.email).toBe('kemi@example.com');
  });
});
