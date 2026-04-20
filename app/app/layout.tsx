import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../server/auth/config';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  const cookieStore = await cookies();
  const cookieProfileComplete = cookieStore.get('profileComplete')?.value === '1';

  // Get current path from custom header set by middleware
  const headersList = await headers();
  const currentPath = headersList.get('x-current-path') || '/app';

  if (!session) {
    const cb = encodeURIComponent(currentPath);
    redirect(`/auth/signin?callbackUrl=${cb}`);
  }

  const profileCompleteFromSession = (session?.user as any)?.profileComplete;
  const profileComplete = profileCompleteFromSession ?? cookieProfileComplete;

  if (!profileComplete) {
    const cb = encodeURIComponent(currentPath);
    redirect(`/onboarding?callbackUrl=${cb}`);
  }

  return <>{children}</>;
}
