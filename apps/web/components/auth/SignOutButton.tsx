'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SignOutButton({
  callbackUrl = '/?s=signoutSuccess',
  className,
  variant
}: {
  callbackUrl?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
}) {
  return (
    <Button
      className={className}
      variant={variant ?? 'outline'}
      onClick={() => signOut({ callbackUrl })}
    >
      Abmelden
    </Button>
  );
}