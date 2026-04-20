import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../server/auth/config';
import SignInForm from '@/components/auth/SignInForm';
import Link from 'next/link';
import SignOutButton from '@/components/auth/SignOutButton';
import { Button } from '@/components/ui/button';

export default async function SignInPage({ searchParams }: { searchParams?: any }) {
  // searchParams kann ein Promise sein -> awaiten
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl ?? '/app';
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const user = session.user as any;
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded shadow text-center">
          <h2 className="text-lg font-semibold mb-2">Hallo{user.name ? ` ${user.name}` : ''}! 👋</h2>
          <p className="text-sm text-zinc-500 mb-4">
            {user.email ? <>Du bist bereits angemeldet mit <strong>{user.email}</strong></> : <>Du bist bereits angemeldet</>}
          </p>

          <div className="flex flex-col gap-2">
            <Link href="/app">
              <Button className='w-50' variant="default" >
                zur App
              </Button>
            </Link>
            <div>
              <SignOutButton className="w-50" variant='destructive' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6">
      <SignInForm callbackUrl={callbackUrl} />
    </div>
  );
}