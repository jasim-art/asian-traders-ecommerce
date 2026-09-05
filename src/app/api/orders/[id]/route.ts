import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  const [order] = await db.select().from(orders).where(eq(orders.id, params.id)).limit(1);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Only the owning customer (or an admin) may view this order.
  if (order.customerId && (!session || (session.customerId !== order.customerId && session.role !== "admin"))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      lineTotal: orderItems.lineTotal,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.images,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  return NextResponse.json({ order, items });
}
