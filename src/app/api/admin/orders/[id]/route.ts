import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders, orderItems, products, inventory } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const [existing] = await db.select().from(orders).where(eq(orders.id, params.id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Restock items if an order is cancelled (and wasn't already cancelled).
  if (parsed.data.status === "CANCELLED" && existing.status !== "CANCELLED") {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, params.id));
    for (const item of items) {
      await db
        .update(inventory)
        .set({ quantity: sql`${inventory.quantity} + ${item.quantity}`, updatedAt: new Date() })
        .where(eq(inventory.productId, item.productId));
    }
  }

  const [order] = await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(orders.id, params.id))
    .returning();

  return NextResponse.json({ order });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const [order] = await db.select().from(orders).where(eq(orders.id, params.id)).limit(1);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      lineTotal: orderItems.lineTotal,
      productName: products.name,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, params.id));

  return NextResponse.json({ order, items });
}
