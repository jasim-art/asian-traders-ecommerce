import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({
  code: z.string().min(3),
  description: z.string().optional().or(z.literal("")),
  percentOff: z.number().int().min(1).max(100).optional(),
  flatOff: z.number().positive().optional(),
  minOrderValue: z.number().min(0).default(0),
  expiresAt: z.string().optional().or(z.literal("")),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json({ coupons: rows });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const d = parsed.data;
  const [coupon] = await db
    .insert(coupons)
    .values({
      code: d.code.toUpperCase().trim(),
      description: d.description || null,
      percentOff: d.percentOff ?? null,
      flatOff: d.flatOff ? d.flatOff.toFixed(2) : null,
      minOrderValue: d.minOrderValue.toFixed(2),
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    })
    .returning();
  return NextResponse.json({ coupon });
}
