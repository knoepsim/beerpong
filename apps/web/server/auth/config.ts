import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../db";

import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma as any),
    session: {
        strategy: "database", 
        maxAge: 30 * 24 * 60 * 60, 
        updateAge: 24 * 60 * 60,   
    },
    providers: [
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
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            try {
                const dest = new URL(url);
                if (dest.origin === baseUrl) return url;
            } catch { }
            return `${baseUrl}/auth/post-signin?callbackUrl=${encodeURIComponent(url ?? baseUrl + "/app")}`;
        },
        async session({ session, user, token }) {
            if (user) {
                (session.user as any).id = user.id;
                (session.user as any).profileComplete = (user as any).profileComplete ?? false;
                (session.user as any).role = (user as any).role ?? 'USER';
            } else if (token) {
                (session.user as any).id = token.sub;
                (session.user as any).profileComplete = (token as any).profileComplete ?? false;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            return true;
        },
    },
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
}

export default authOptions
