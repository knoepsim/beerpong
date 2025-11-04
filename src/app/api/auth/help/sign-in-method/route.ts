import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { sendMail, wrapHtml } from "@/server/email/mailer"

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email)
}

function providerLabel(id: string) {
  switch (id) {
    case "google":
      return "Google"
    case "github":
      return "GitHub"
    case "discord":
      return "Discord"
    case "email":
      return "E‑Mail (Magic Link)"
    case "credentials":
      return "E‑Mail + Passwort"
    default:
      return id
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({ email: undefined }))
    // Always respond generically to the client to avoid user enumeration
    const genericResponse = NextResponse.json({ ok: true })

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return genericResponse
    }

    // Look up user and linked providers
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: { select: { provider: true } } },
    })

    // Build email content
    let subject = "Hinweis zu deiner Anmeldung"
    let html = wrapHtml(
      `<h1>Informationen zu deiner Anmeldung</h1>
       <p>Wenn für diese E‑Mail ein Konto existiert, sind folgende Anmeldemethoden verknüpft:</p>
       ${user?.accounts?.length
         ? `<ul>${user.accounts
             .map((a) => `<li>${providerLabel(a.provider)}</li>`)
             .join("")}</ul>`
         : `<p>Für diese E‑Mail konnten wir keine verknüpften Anmeldemethoden ermitteln.</p>`}
       <p>Du kannst dich jederzeit mit einer der aktivierten Methoden anmelden. Falls du Unterstützung brauchst, antworte einfach auf diese Mail.</p>`
    )
    const text = `Informationen zu deiner Anmeldung\n\n$${
      user?.accounts?.length
        ? user.accounts.map((a) => `- ${providerLabel(a.provider)}`).join("\n")
        : "Keine verknüpften Anmeldemethoden gefunden."
    }\n\nWenn du Hilfe benötigst, antworte bitte auf diese E‑Mail.`.replace("$", "")

    // Send email (even if no account — it goes to the inbox owner only)
    try {
      await sendMail({ to: email, subject, html, text })
    } catch (e) {
      console.warn("[sign-in-method] Failed to send email:", e)
      // Do not leak details to the client
    }

    return genericResponse
  } catch (e) {
    // Always return generic
    return NextResponse.json({ ok: true })
  }
}
