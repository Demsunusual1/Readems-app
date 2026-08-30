import { NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import { createSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/signup';

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid details.' },
      { status: 400 },
    );
  try {
    const { password, ...data } = parsed.data;
    const passwordHash = await hashPassword(password);
    const user = await prisma.$transaction(async (transaction) => {
      const created = await transaction.user.create({
        data: {
          ...data,
          avatarUrl: data.avatarUrl || null,
          passwordHash,
        },
      });
      await createSession(created.id, transaction);
      return created;
    });
    return NextResponse.json(
      {
        dashboard:
          user.role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/reader',
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
      return NextResponse.json(
        { error: 'That email or username is already registered.' },
        { status: 409 },
      );
    return NextResponse.json(
      { error: 'We could not create your account. Please try again.' },
      { status: 500 },
    );
  }
}
