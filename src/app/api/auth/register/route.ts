import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  // Parse and validate body
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Normalize email (lowercase + trim) so lookup is consistent with login
  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name.trim();
  const { phone, password } = parsed.data;

  try {
    // Duplicate-email check
    const existing = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, email)).limit(1);
    if (existing[0]) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password — bcrypt with cost factor 10 (never store plaintext)
    const passwordHash = await hashPassword(password);

    // Insert customer row
    const [customer] = await db
      .insert(customers)
      .values({ name, email, phone: phone || null, passwordHash, role: "customer" })
      .returning();

    // Create JWT session token (30-day expiry)
    const token = await createSessionToken({
      customerId: customer.id,
      role: "customer",
      email: customer.email,
      name: customer.name,
    });

    const res = NextResponse.json({
      ok: true,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });

    // Set httpOnly cookie — secure=true in production, lax sameSite works for
    // same-site form submissions and Vercel deployments
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
    // Log the real error server-side for debugging; return a safe message to the client
    console.error("[register] DB error:", err);
    return NextResponse.json(
      { error: "Registration failed due to a server error. Please try again." },
      { status: 500 }
    );
  }
}
