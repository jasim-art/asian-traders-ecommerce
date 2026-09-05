import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatINR } from "@/lib/format";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/account/login?redirect=/account");
  if (session.role === "admin") redirect("/admin");

  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, session.customerId))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[30px]">My Account</h1>
          <p className="text-ink-soft normal-case mt-1">
            {session.name} • {session.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="text-[20px] normal-case mb-4">Order History</h2>
      {myOrders.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink-soft normal-case">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="btn btn-primary mt-4 inline-flex">Start Shopping</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {myOrders.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.id}`}
              className="card p-5 flex items-center justify-between hover:border-orange transition-colors"
            >
              <div>
                <span className="font-semibold text-brown-deep">#{o.orderNumber}</span>
                <p className="text-xs text-ink-soft normal-case mt-1">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <span className="block font-bold text-brown-deep">{formatINR(o.total)}</span>
                <span className="text-xs text-ink-soft normal-case">{STATUS_LABEL[o.status]}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
