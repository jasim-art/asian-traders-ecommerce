import { db } from "@/db";
import { orders, customers, products, inventory } from "@/db/schema";
import { and, eq, gte, ne, sql } from "drizzle-orm";

export async function getDashboardStats() {
  const [salesRow] = await db
    .select({ total: sql<string>`coalesce(sum(${orders.total}), 0)::text` })
    .from(orders)
    .where(ne(orders.status, "CANCELLED"));

  const [orderCountRow] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
  const [pendingRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, "PENDING"));
  const [customerCountRow] = await db.select({ count: sql<number>`count(*)::int` }).from(customers);
  const [productCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.isActive, true));

  const lowStock = await db
    .select({
      id: products.id,
      name: products.name,
      quantity: inventory.quantity,
      lowStockAt: products.lowStockAt,
    })
    .from(products)
    .innerJoin(inventory, eq(inventory.productId, products.id))
    .where(and(eq(products.isActive, true), sql`${inventory.quantity} <= ${products.lowStockAt}`));

  const salesByDay = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      total: sql<string>`sum(${orders.total})::text`,
    })
    .from(orders)
    .where(and(ne(orders.status, "CANCELLED"), gte(orders.createdAt, sql`now() - interval '14 days'`)))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  return {
    totalSales: salesRow?.total ?? "0",
    totalOrders: orderCountRow?.count ?? 0,
    pendingOrders: pendingRow?.count ?? 0,
    totalCustomers: customerCountRow?.count ?? 0,
    totalProducts: productCountRow?.count ?? 0,
    lowStockProducts: lowStock,
    salesByDay,
  };
}
