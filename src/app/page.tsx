import { getServerSession } from "next-auth"
import { authConfig } from "@/server/auth/config"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import RouterButton from "@/components/ui/router-button";

export default async function Home() {
  const session = await getServerSession(authConfig)


  if (!session?.user) {
    return (
      <div className="p-6">
        <h1>Startseite</h1>
        <p>Nicht angemeldet.</p>
        <p>
          <Link href="/api/auth/signin">Login</Link>
        </p>
  <RouterButton href="/api/auth/signin" variant="outline">Login</RouterButton>
      </div >
    )
  }
  return (
    <div className="p-6">
      <h1>Startseite</h1>
      <p>
        Hallo, {session.user.name ?? session.user.email}
      </p>
      <p>
        <Link href="/api/auth/signout">Logout</Link>
      </p>
      <p>
        <Link href="/dashboard">Dashboard</Link>
      </p>
    </div>
  )

}
