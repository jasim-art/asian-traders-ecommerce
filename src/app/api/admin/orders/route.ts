import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      paymentMethod: orders.paymentMethod,
      deliveryMethod: orders.deliveryMethod,
      createdAt: orders.createdAt,
      customerName: customers.name,
      guestName: orders.guestName,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(status ? (eq(orders.status, status as any) as any) : undefined)
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ orders: rows });
}
