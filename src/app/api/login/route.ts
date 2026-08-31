import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, dashboardForRole, verifyPassword } from '@/lib/auth';
import { loginSchema } from '@/lib/login';

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
  await createSession(user.id);
  return NextResponse.json({ dashboard: dashboardForRole(user.role) });
}
