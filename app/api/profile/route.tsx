import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../server/auth/config';
import { prisma } from '../../../server/db';
import * as z from 'zod';

const profileSchema = z.object({
  username: z
    .string()
    .min(4, 'username too short')
    .max(30, 'username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'invalid username'),
  firstName: z.string().min(2, 'firstName too short').max(50, 'firstName too long'),
  lastName: z.string().min(2, 'lastName too short').max(50, 'lastName too long'),
  phone: z.string().regex(/^\+?\d{7,15}$/, 'Invalid phone'),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      profileComplete: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parse = profileSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parse.error.flatten() }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id as string },
        data: {
          username: parse.data.username,
          firstName: parse.data.firstName,
          lastName: parse.data.lastName,
          phone: parse.data.phone,
          profileComplete: true,
        },
      });

      const res = NextResponse.json(updatedUser, { status: 200 });
      const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
      res.headers.set(
        'Set-Cookie',
        `profileComplete=1; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax; HttpOnly=false; ${secureFlag}`
      );
      return res;
    } catch (dbErr) {
      return NextResponse.json({ error: 'DB Fehler', details: (dbErr as any).message || String(dbErr) }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON or server error' }, { status: 400 });
  }
}