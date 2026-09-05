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
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name.trim();
  const { phone, password } = parsed.data;

  const existing = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  if (existing[0]) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [customer] = await db
    .insert(customers)
    .values({ name, email, phone: phone || null, passwordHash, role: "customer" })
    .returning();

  const token = await createSessionToken({
    customerId: customer.id,
    role: "customer",
    email: customer.email,
    name: customer.name,
  });

  const res = NextResponse.json({ ok: true, customer: { id: customer.id, name: customer.name, email: customer.email } });
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
