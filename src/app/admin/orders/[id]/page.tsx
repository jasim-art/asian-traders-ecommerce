"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatINR } from "@/lib/format";

const STATUSES = ["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/orders/${params.id}`);
    const data = await res.json();
    setOrder(data.order);
    setItems(data.items || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(status: string) {
    setUpdating(true);
    await fetch(`/api/admin/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setUpdating(false);
  }

  if (!order) return <p className="text-ink-soft normal-case">Loading...</p>;

  return (
    <div className="max-w-[700px]">
      <h1 className="text-[28px] mb-1">Order #{order.orderNumber}</h1>
      <p className="text-ink-soft normal-case mb-6">
        {order.guestName || "Registered customer"} • {order.paymentMethod} • {order.deliveryMethod}
      </p>

      <div className="card p-5 mb-5">
        <h3 className="text-sm font-bold normal-case mb-3">Update Status</h3>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={updating}
              onClick={() => updateStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border normal-case disabled:opacity-50 ${
                order.status === s ? "bg-orange text-white border-orange" : "border-line text-ink-soft"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-5">
        <h3 className="text-sm font-bold normal-case mb-3">Items</h3>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm border-b border-line py-2 last:border-0">
            <span className="normal-case">{item.productName} × {item.quantity}</span>
            <span>{formatINR(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-soft normal-case">Subtotal</span>
          <span>{formatINR(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-soft normal-case">Delivery</span>
          <span>{formatINR(order.deliveryCharge)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-line pt-3 mt-2">
          <span className="normal-case">Total</span>
          <span>{formatINR(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
