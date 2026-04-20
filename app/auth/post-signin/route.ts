import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../server/auth/config";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const callback = url.searchParams.get("callbackUrl") ?? "/app";

  try {
    const session = await getServerSession(authOptions);
    const profileComplete = !!(session?.user as any)?.profileComplete;

    const res = NextResponse.redirect(new URL(callback, req.url));
    const secureFlag = process.env.NODE_ENV === "production" ? "Secure; " : "";

    if (profileComplete) {
      res.headers.set(
        "Set-Cookie",
        `profileComplete=1; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax; ${secureFlag}`
      );
    } else {
      // löschen / sicherstellen dass kein falsches cookie bleibt
      res.headers.set(
        "Set-Cookie",
        `profileComplete=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax; ${secureFlag}`
      );
    }

    return res;
  } catch {
    return NextResponse.redirect(new URL(callback, req.url));
  }
}