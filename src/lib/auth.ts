import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'readems_session';
export const dashboardForRole = (role: 'READER' | 'CREATOR' | 'BOTH') =>
  role === 'CREATOR' ? '/creator/dashboard' : '/reader/dashboard';

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split(':');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, 'hex');
  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}

const digest = (token: string) =>
  createHash('sha256').update(token).digest('hex');

type SessionClient = Pick<typeof prisma, 'session'>;

export async function createSession(
  userId: string,
  client: SessionClient = prisma,
) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await client.session.create({
    data: { tokenHash: digest(token), userId, expiresAt },
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: digest(token) },
    include: { user: true },
  });
  return session && session.expiresAt > new Date() ? session.user : null;
}

export async function deleteSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token)
    await prisma.session.deleteMany({ where: { tokenHash: digest(token) } });
  store.delete(SESSION_COOKIE);
}
