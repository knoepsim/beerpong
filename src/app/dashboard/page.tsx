import { getServerSession } from "next-auth"
import { authConfig } from "@/server/auth/config"
import Link from "next/link"

export default async function Dashboard() {
  const session = await getServerSession(authConfig)
  if (!session?.user) {
    return (
      <div className="p-6">
        <p>Nicht angemeldet.</p>
        <Link href="/api/auth/signin">Login</Link>
      </div>
    )
  }
  return (
    <div className="p-6">
      <p>
        Willkommen, {session.user.name ?? session.user.email}
      </p>
      <Link href="/api/auth/signout">Logout</Link>
    </div>
  )
}
