"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/format";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  percentOff: number | null;
  flatOff: string | null;
  minOrderValue: string;
  isActive: boolean;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", description: "", percentOff: "", flatOff: "", minOrderValue: "0" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.coupons || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        description: form.description || undefined,
        percentOff: form.percentOff ? Number(form.percentOff) : undefined,
        flatOff: form.flatOff ? Number(form.flatOff) : undefined,
        minOrderValue: Number(form.minOrderValue || 0),
      }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not create coupon");
    else {
      setForm({ code: "", description: "", percentOff: "", flatOff: "", minOrderValue: "0" });
      load();
    }
    setSaving(false);
  }

  return (
    <div className="max-w-[700px]">
      <h1 className="text-[28px] mb-8">Coupons</h1>

      <form onSubmit={handleCreate} className="card p-5 mb-8 flex flex-col gap-3">
        <h3 className="text-sm font-bold normal-case">Create Coupon</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code (e.g. SAVE10)" className="input" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input" />
          <input type="number" value={form.percentOff} onChange={(e) => setForm({ ...form, percentOff: e.target.value })} placeholder="% off (optional)" className="input" />
          <input type="number" value={form.flatOff} onChange={(e) => setForm({ ...form, flatOff: e.target.value })} placeholder="Flat ₹ off (optional)" className="input" />
          <input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} placeholder="Min order value" className="input" />
        </div>
        {error && <p className="text-sm text-red-600 normal-case">{error}</p>}
        <button type="submit" disabled={saving} className="btn btn-primary btn-sm w-fit disabled:opacity-50">
          {saving ? "Creating..." : "Create Coupon"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {coupons.map((c) => (
          <div key={c.id} className="card p-4 flex justify-between items-center">
            <div>
              <span className="font-mono font-bold text-brown-deep">{c.code}</span>
              {c.description && <p className="text-xs text-ink-soft normal-case mt-0.5">{c.description}</p>}
            </div>
            <div className="text-right text-sm">
              {c.percentOff ? `${c.percentOff}% off` : c.flatOff ? `${formatINR(c.flatOff)} off` : ""}
              <span className="block text-xs text-ink-soft normal-case">Min: {formatINR(c.minOrderValue)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
