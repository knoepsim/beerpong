import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../server/auth/config';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import Link from 'next/link';
import { Beer, Trophy, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Global Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/app" className="flex items-center space-x-2">
              <Beer className="h-6 w-6 text-primary" />
              <span className="inline-block font-black uppercase tracking-tighter text-xl">
                Beerpong
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/app" className="transition-colors hover:text-primary flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link href="/app/tournaments" className="transition-colors hover:text-primary flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Turniere
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild title="Profil">
               <Link href="/app/account">
                <User className="h-5 w-5" />
               </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild title="Abmelden" className="text-muted-foreground hover:text-destructive">
               <Link href="/auth/signout">
                <LogOut className="h-5 w-5" />
               </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-6 bg-zinc-100 dark:bg-zinc-900/50 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Beerpong Tournament Manager. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}
