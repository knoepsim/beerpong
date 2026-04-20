import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth/config';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = (url.searchParams.get('username') || '').trim();
  if (!username) return NextResponse.json({ available: false, error: 'missing' }, { status: 400 });

  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id ?? null;

  const found = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  // verfügbar, wenn nicht gefunden OR gefunden aber gehört dem aktuellen User
  const available = !found || (currentUserId && found.id === currentUserId);
  return NextResponse.json({ available });
}
