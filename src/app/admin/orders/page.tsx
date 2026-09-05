"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/format";

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  paymentMethod: string;
  deliveryMethod: string;
  createdAt: string;
  customerName: string | null;
  guestName: string | null;
};

const STATUSES = ["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/orders${status ? `?status=${status}` : ""}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <h1 className="text-[28px] mb-6">Orders</h1>

      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setStatus("")}
          className={`text-xs px-3 py-1.5 rounded-full border normal-case ${!status ? "bg-orange text-white border-orange" : "border-line text-ink-soft"}`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border normal-case ${status === s ? "bg-orange text-white border-orange" : "border-line text-ink-soft"}`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 normal-case text-ink-soft font-semibold">Order</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Customer</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Total</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-ink-soft normal-case">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-ink-soft normal-case">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <span className="font-semibold text-brown-deep">#{o.orderNumber}</span>
                    <span className="block text-xs text-ink-soft normal-case">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </td>
                  <td className="p-3 normal-case">{o.customerName || o.guestName || "Guest"}</td>
                  <td className="p-3">{formatINR(o.total)}</td>
                  <td className="p-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-tint text-orange-deep">
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs font-semibold text-orange-deep">Manage</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
