import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

// Logout has no sensitive server-side work to fail on (JWT sessions are
// stateless — there's nothing to "revoke" beyond the cookie itself), but we
// still wrap this so a malformed request can never surface an unhandled
// error or a stack trace to the client.
export async function POST() {
  try {
    const res = NextResponse.json({ ok: true });
    // Clear the cookie with the exact same attributes it was set with
    // (see login/register routes) — mismatched attributes can cause some
    // browsers to treat this as a *different* cookie and leave the real
    // one in place. Belt-and-suspenders: set an empty value, maxAge 0,
    // AND an expiry in the past.
    res.cookies.delete(AUTH_COOKIE_NAME);
    res.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    // Never leak internals — but still return a response the client can
    // treat as "not logged in" so the UI doesn't get stuck.
    return NextResponse.json({ ok: false, error: "Could not log out. Please try again." }, { status: 500 });
  }
}
