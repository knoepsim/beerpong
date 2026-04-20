import { prisma } from '@beerpong/db';
import { BrowserContext } from '@playwright/test';

export async function setupTestSession(context: BrowserContext) {
  const sessionToken = `test-session-${Math.random().toString(36).substring(7)}`;
  const expires = new Date();
  expires.setDate(expires.getDate() + 1);

  // 1. Test User anlegen (Admin für alle Features)
  const user = await prisma.user.upsert({
    where: { email: 'test-admin@example.com' },
    update: { role: 'ADMIN', profileComplete: true },
    create: {
      email: 'test-admin@example.com',
      name: 'Test Admin',
      username: 'testadmin',
      role: 'ADMIN',
      profileComplete: true,
    },
  });

  // 2. Session in DB anlegen
  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  // 3. Cookie im Browser setzen
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: sessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
        name: 'profileComplete',
        value: '1',
        domain: 'localhost',
        path: '/',
    }
  ]);

  return user;
}
