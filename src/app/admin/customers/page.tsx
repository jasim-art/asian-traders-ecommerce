import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      createdAt: customers.createdAt,
      orderCount: sql<number>`count(${orders.id})::int`,
      totalSpent: sql<string>`coalesce(sum(${orders.total}), 0)::text`,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt));

  return (
    <div>
      <h1 className="text-[28px] mb-8">Customers</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 normal-case text-ink-soft font-semibold">Name</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Contact</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Orders</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="p-3 font-semibold text-brown-deep normal-case">{c.name}</td>
                <td className="p-3 normal-case text-xs">{c.email}<br />{c.phone}</td>
                <td className="p-3">{c.orderCount}</td>
                <td className="p-3">{formatINR(c.totalSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
