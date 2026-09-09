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

describe('profile images', () => {
  const base = {
    fullName: 'Amara Okafor',
    username: 'amara_writes',
    email: 'amara@example.com',
    password: 'StrongPassword9',
    role: 'READER' as const,
    interests: ['Drama', 'Fantasy', 'Mystery'],
  };

  it('accepts the picture the wizard produces', () => {
    expect(
      signupSchema.safeParse({
        ...base,
        avatarUrl: 'data:image/png;base64,iVBORw0KGgo=',
      }).success,
    ).toBe(true);
    expect(signupSchema.safeParse({ ...base, avatarUrl: '' }).success).toBe(
      true,
    );
  });

  it('accepts a picture that ships with Readems', () => {
    expect(
      signupSchema.safeParse({
        ...base,
        avatarUrl: '/readems/community-zara.png',
      }).success,
    ).toBe(true);
  });

  it('refuses a picture on somebody else’s server', () => {
    // Readems will not fetch an arbitrary host to resize it, so a remote
    // address would only ever render as a broken image.
    const result = signupSchema.safeParse({
      ...base,
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(result.success).toBe(false);
  });
});
