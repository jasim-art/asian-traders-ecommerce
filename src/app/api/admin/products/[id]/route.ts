import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products, inventory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().or(z.literal("")),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.string()).optional(),
  price: z.number().positive().optional(),
  mrp: z.number().positive().optional(),
  unit: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  stockQty: z.number().int().min(0).optional(),
  lowStockAt: z.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { stockQty, price, mrp, ...rest } = parsed.data;

  const updates: Record<string, unknown> = { ...rest, updatedAt: new Date() };
  if (price !== undefined) updates.price = price.toFixed(2);
  if (mrp !== undefined) updates.mrp = mrp.toFixed(2);

  const [product] = await db.update(products).set(updates).where(eq(products.id, params.id)).returning();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  if (stockQty !== undefined) {
    await db
      .update(inventory)
      .set({ quantity: stockQty, updatedAt: new Date() })
      .where(eq(inventory.productId, params.id));
  }

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  await db.update(products).set({ isActive: false }).where(eq(products.id, params.id));
  return NextResponse.json({ ok: true });
}
