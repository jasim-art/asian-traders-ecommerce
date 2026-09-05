import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // Parse and validate body
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password" }, { status: 400 });
  }

  // Normalize email the same way registration does (lowercase + trim)
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  try {
    // Fetch customer by email from the customers table
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    // Return the same 401 message for "not found" and "wrong password" to
    // prevent user-enumeration attacks
    if (!customer) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Compare submitted password against the stored bcrypt hash
    const valid = await verifyPassword(password, customer.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Build JWT session token (30-day expiry)
    const token = await createSessionToken({
      customerId: customer.id,
      role: customer.role as "customer" | "admin",
      email: customer.email,
      name: customer.name,
    });

    const res = NextResponse.json({
      ok: true,
      // Never include passwordHash in the response
      customer: { id: customer.id, name: customer.name, email: customer.email, role: customer.role },
    });

    // Set httpOnly session cookie — same attributes as register so both
    // routes create an identical cookie the middleware can read
    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err) {
    // Log the real error server-side; return a safe message to the client.
    // This prevents the client-side catch block from showing "Network error"
    // when the real problem is a DB connection issue.
    console.error("[login] DB error:", err);
    return NextResponse.json(
      { error: "Login failed due to a server error. Please try again." },
      { status: 500 }
    );
  }
}
