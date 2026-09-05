import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

// Deliberately re-implemented (not imported from lib/auth.ts) so this stays
// on the Edge runtime without pulling bcryptjs into the middleware bundle.
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-in-production");

type SessionPayload = { customerId: string; role: "customer" | "admin"; email: string; name: string };

async function readSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    // Expired/tampered/leftover-from-a-different-secret token — treat exactly
    // like "logged out" rather than erroring.
    return null;
  }
}

const AUTH_PAGES = ["/account/login", "/account/register"];
// /checkout is deliberately NOT protected here: whether checkout is
// "needed" depends on the cart, which lives in client-side localStorage the
// edge middleware can't see. Gating it here would force a login redirect
// even for an empty cart. The checkout page itself (client component)
// checks session + cart together and redirects to login only when there's
// actually something to check out — see src/app/checkout/page.tsx.
const PROTECTED_PREFIXES = ["/account", "/admin"];

function getSafeRedirectPath(rawDest: string | null, fallback: string): string {
  if (!rawDest) return fallback;
  if (rawDest.startsWith("/") && !rawDest.startsWith("//") && !rawDest.includes(":")) {
    return rawDest;
  }
  return fallback;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);
  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !isAuthPage;

  if (!isAuthPage && !isProtected) return NextResponse.next();

  const session = await readSession(req);

  // Already signed in and heading to /account/login or /account/register —
  // send them where they were already going instead of showing the form again.
  if (isAuthPage && session) {
    const dest = req.nextUrl.searchParams.get("redirect");
    const fallback = session.role === "admin" ? "/admin" : "/account";
    const targetPath = getSafeRedirectPath(dest, fallback);
    const url = req.nextUrl.clone();
    url.pathname = targetPath;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isProtected) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/account/login";
      url.search = `?redirect=${encodeURIComponent(pathname)}`;
      const res = NextResponse.redirect(url);
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
    if (pathname.startsWith("/admin") && session.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
