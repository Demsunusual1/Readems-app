import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, dashboardForRole, verifyPassword } from '@/lib/auth';
import { loginSchema } from '@/lib/login';
import { ensureBootstrapAdmin } from '@/lib/admin';

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid details.' },
      { status: 400 },
    );
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash)))
    return NextResponse.json(
      { error: 'The email or password is incorrect.' },
      { status: 401 },
    );
  if (user.accountStatus === 'SUSPENDED')
    return NextResponse.json(
      { error: 'This account is suspended. Write to support@readems.com.' },
      { status: 403 },
    );
  // Signing in is where the first admin is made: an address listed in
  // READEMS_ADMIN_EMAILS gets SUPER_ADMIN here, because nobody can grant it
  // before one exists.
  await ensureBootstrapAdmin(user);
  await createSession(user.id);
  return NextResponse.json({ dashboard: dashboardForRole(user.role) });
}
