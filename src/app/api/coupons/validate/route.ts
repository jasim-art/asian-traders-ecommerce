import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json().catch(() => ({ code: "", subtotal: 0 }));
  if (!code) return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase().trim()))
    .limit(1);

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  const min = parseFloat(coupon.minOrderValue);
  if (subtotal < min) {
    return NextResponse.json({ error: `Minimum order value for this coupon is ₹${min}` }, { status: 400 });
  }

  let discount = 0;
  if (coupon.percentOff) discount = (subtotal * coupon.percentOff) / 100;
  else if (coupon.flatOff) discount = parseFloat(coupon.flatOff);

  return NextResponse.json({
    code: coupon.code,
    description: coupon.description,
    discount: Math.round(discount * 100) / 100,
  });
}
