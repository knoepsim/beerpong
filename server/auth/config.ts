import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";

import { prisma } from "../db";
import type { PrismaClient } from "@/lib/generated/prisma";


// TODO: Implementieren der POST /api/auth/help/sign-in-method Route um dem Nutzer anzuzeigen, welche Anmeldemethoden mit seiner E‑Mail verknüpft sind. Ggf. direkt in der Mail magic link zur anmeldung da die Anmeldung mit Email immer funktioniert

export const authOptions = {
    adapter: PrismaAdapter(prisma as unknown as PrismaClient),
    session: {
        strategy: "database", // <= geändert von "database" auf "jwt"
        maxAge: 30 * 24 * 60 * 60, // 30 Tage
        updateAge: 24 * 60 * 60,   // 1 Tag
    },
    providers: [
        // social provider  
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),

        // email provider:
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
        signIn: '/auth/signin',
        signOut: '/auth/signout',
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // nach signIn/Callback zur kleinen post-signin Route damit wir das Cookie setzen können
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            try {
                const dest = new URL(url);
                if (dest.origin === baseUrl) return url;
            } catch { }
            // default: /auth/post-signin?callbackUrl=<base>
            return `${baseUrl}/auth/post-signin?callbackUrl=${encodeURIComponent(url ?? baseUrl + "/app")}`;
        },
        async session({ session, user, token }) {
            // bei database strategy kommt user (DB) zurück
            if (user) {
                (session.user as any).id = user.id;
                (session.user as any).profileComplete = (user as any).profileComplete ?? false;
            } else if (token) {
                (session.user as any).id = token.sub;
                (session.user as any).profileComplete = (token as any).profileComplete ?? false;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            // Return false blockiert Redirect nach signin
            return true;
        },
    },
    // cookie options: in dev kein Secure
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            },
        },
    },

} satisfies NextAuthOptions

export default authOptions