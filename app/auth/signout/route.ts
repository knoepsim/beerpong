import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

const cookieName =
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
    const sessionToken = match?.[1];

    if (sessionToken) {
      await prisma.session.deleteMany({ where: { sessionToken } });
    }

    // Redirect mit Query-Message
    const res = NextResponse.redirect(new URL("/?s=signoutSuccess", req.url));
    const secureFlag = process.env.NODE_ENV === "production" ? "Secure; " : "";
    res.headers.set(
      "Set-Cookie",
      `${cookieName}=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax; ${secureFlag}`
    );
    return res;
  } catch (e) {
    return NextResponse.redirect(new URL("/?s=signoutError", req.url));
  }
}