import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST(request: Request) {
  await deleteSession();
  return NextResponse.redirect(new URL('/login', request.url), 303);
}
