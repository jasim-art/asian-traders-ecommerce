import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect(`/account/login?redirect=/account/orders/${params.id}`);

  const [order] = await db.select().from(orders).where(eq(orders.id, params.id)).limit(1);
  if (!order) notFound();
  if (order.customerId !== session.customerId && session.role !== "admin") notFound();

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      lineTotal: orderItems.lineTotal,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <h1 className="text-[28px] mb-1">Order #{order.orderNumber}</h1>
      <p className="text-ink-soft normal-case mb-8">
        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      {order.status !== "CANCELLED" ? (
        <div className="flex items-center mb-10">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i <= currentStepIndex ? "bg-orange text-white" : "bg-line text-ink-soft"
                }`}
              >
                {i + 1}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-[2px] flex-1 ${i < currentStepIndex ? "bg-orange" : "bg-line"}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-10 inline-block bg-red-50 text-red-700 text-sm font-semibold px-4 py-2 rounded-full">
          This order was cancelled
        </p>
      )}

      <div className="card p-6 mb-6">
        <h3 className="text-[16px] normal-case mb-4 font-bold">Items</h3>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm border-b border-line pb-3 last:border-0">
              <span className="normal-case text-brown-deep">{item.productName} × {item.quantity}</span>
              <span className="font-medium">{formatINR(item.lineTotal)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-soft normal-case">Subtotal</span>
          <span>{formatINR(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-soft normal-case">Delivery</span>
          <span>{parseFloat(order.deliveryCharge) === 0 ? "FREE" : formatINR(order.deliveryCharge)}</span>
        </div>
        {parseFloat(order.discount) > 0 && (
          <div className="flex justify-between text-sm mb-2 text-green-700">
            <span className="normal-case">Discount</span>
            <span>−{formatINR(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-brown-deep border-t border-line pt-3 mt-2">
          <span className="normal-case">Total</span>
          <span>{formatINR(order.total)}</span>
        </div>
        <p className="text-xs text-ink-soft normal-case mt-4">
          Payment: {order.paymentMethod} • {order.deliveryMethod === "PICKUP" ? "Store Pickup" : "Home Delivery"}
        </p>
      </div>
    </div>
  );
}
