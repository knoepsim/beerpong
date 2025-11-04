import { getServerSession } from "next-auth"
import { authConfig } from "@/server/auth/config"
import Link from "next/link"

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
      </div>
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
