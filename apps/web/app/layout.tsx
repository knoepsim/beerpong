import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-ignore: allow side-effect CSS import without type declarations
import "./globals.css";
import React from "react";
import Providers from "./providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../server/auth/config";
import pkg from "../package.json";
import { SiGithub } from "react-icons/si";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bierpongwebapp",
  description: "Bierpong spielen und verwalten",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // serverseitig Session holen und an den Client SessionProvider übergeben
  const session = await getServerSession(authOptions);

  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased  bg-zinc-50 dark:bg-black`}>
        <Providers session={session}>
          <div className="min-h-screen flex flex-col">
            <main className="min-h-[calc(100vh-80px)]">{children}</main>
            <footer className="border-t border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm">
              <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-1">
                {/* left: everything inline and vertically centered */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{pkg?.name ?? "Bierpong"}</span>
                    {pkg?.version && <span className="text-xs text-zinc-500">v{pkg.version}</span>}
                    <span className="text-zinc-400">|</span>
                    <span className="text-sm">&copy;{new Date().getFullYear()}</span>
                  </div>

                  <a
                    href="https://github.com/knoepsim"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-magenta-600 hover:underline gap-2"
                    aria-label="knoepsim auf GitHub (öffnet in neuem Tab)"
                  >
                    <span className="text-sm">@knoepsim</span>
                    <SiGithub className="h-4 w-4" />

                  </a>
                </div>

                <div className="flex gap-4">
                  <a href="/impressum" className="hover:underline">
                    Impressum
                  </a>
                  <a href="/privacy" className="hover:underline">
                    Datenschutz
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
