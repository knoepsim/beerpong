import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { PrismaClient as PrismaClientType } from "@/generated/prisma"
import Google from "next-auth/providers/google"
import Email from "next-auth/providers/email"
import { prisma } from "@/server/db"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"

// TODO: Implementieren der POST /api/auth/help/sign-in-method Route um dem Nutzer anzuzeigen, welche Anmeldemethoden mit seiner E‑Mail verknüpft sind. Ggf. direkt in der Mail magic link zur anmeldung da die Anmeldung mit Email immer funktioniert

export const authConfig = {
    // The adapter type expects the PrismaClient type from the installed
    // @prisma/client package. Our `prisma` instance comes from the generated
    // client (which may be typed differently), so cast it to the expected
    // type here to satisfy the adapter signature.
    adapter: PrismaAdapter(prisma as unknown as PrismaClientType),
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60, // 30 Tage
        updateAge: 24 * 60 * 60,   // 1 Tag
    },
    providers: [
        // Mindestens einen Provider konfigurieren:
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHub({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),
        Discord({ clientId: process.env.DISCORD_CLIENT_ID!, clientSecret: process.env.DISCORD_CLIENT_SECRET! }),

        // Optionaler E‑Mail‑Provider für verifizierte E‑Mails:
        Email({
            server: {
                host: process.env.EMAIL_SERVER_HOST!,
                port: Number(process.env.EMAIL_SERVER_PORT!),
                auth: { user: process.env.EMAIL_SERVER_USER!, pass: process.env.EMAIL_SERVER_PASSWORD! },
            },
            from: process.env.EMAIL_FROM!,
        }),
    ],
    pages: {
        // Optional: eigene Pages definieren
    },
    callbacks: {
        session: async ({ session, user }) => {
            if (session.user) {
                // Zusätzliche Felder in Session spiegeln
                session.user.id = user.id
                session.user.role = (user as any).role ?? "USER"
            }
            return session
        },
        // Optional: signIn zum Erzwingen verifizierter E‑Mails
        // signIn: async ({ user, account }) => {
        //   if (account?.provider === "email") {
        //     return !!user.emailVerified
        //   }
        //   return true
        // },
    },
    // Wichtig: NEXTAUTH_SECRET in .env setzen (prod Pflicht)
    // trustHost: true, // falls hinter Proxy/Edge
} satisfies NextAuthOptions
