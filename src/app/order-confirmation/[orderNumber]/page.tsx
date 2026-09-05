import Link from "next/link";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatINR } from "@/lib/format";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, params.orderNumber)).limit(1);
  if (!order) notFound();

  return (
    <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">✓</span>
      </div>
      <h1 className="text-[30px]">Order Placed!</h1>
      <p className="text-ink-soft normal-case mt-3">
        Thank you — your order <strong>#{order.orderNumber}</strong> has been received.
      </p>
      <div className="card p-6 mt-8 text-left">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-soft normal-case">Order Number</span>
          <span className="font-semibold">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-soft normal-case">Payment Method</span>
          <span className="font-semibold">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-soft normal-case">Delivery Method</span>
          <span className="font-semibold normal-case">{order.deliveryMethod === "PICKUP" ? "Store Pickup" : "Home Delivery"}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-brown-deep border-t border-line pt-3 mt-3">
          <span className="normal-case">Total Paid</span>
          <span>{formatINR(order.total)}</span>
        </div>
      </div>
      <p className="text-sm text-ink-soft normal-case mt-6">
        We&apos;ll reach out via WhatsApp or phone to confirm your order shortly.
      </p>
      <div className="flex gap-3 justify-center mt-6">
        <Link href="/shop" className="btn btn-outline">Continue Shopping</Link>
        <a href="https://wa.me/919442425301" className="btn btn-primary">Chat on WhatsApp</a>
      </div>
    </div>
  );
}
