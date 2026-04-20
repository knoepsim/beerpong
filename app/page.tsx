import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../server/auth/config";
import { Button } from "@/components/ui/button";
import SignOutButton from "@/components/auth/SignOutButton"

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userName = (session?.user?.name ?? session?.user?.email) as string | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-magenta-50 dark:from-zinc-950 dark:to-magenta-950">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Bierpong
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 max-w-xl">
          Turniere organisieren, Scores tracken, gemeinsam gewinnen.
        </p>

        {/* Buttons */}
        {session?.user ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <p className="text-zinc-700 dark:text-zinc-300 self-center">
              Hey <span className="font-semibold text-magenta-600">{userName ?? "Champion"}</span>! 👋
            </p>
            <Link href="/app">
              <Button className="px-6 py-2" variant="default">
                Zur App
              </Button>
            </Link>
            <SignOutButton className="px-6 py-2" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/signin">
              <Button className="px-6 py-2" variant="default">
                Anmelden / Account erstellen
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
