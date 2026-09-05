"use client";

import { useEffect, useState } from "react";

type Brand = { id: string; name: string; slug: string };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(data.brands || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    setSaving(false);
    load();
  }

  return (
    <div className="max-w-[700px]">
      <h1 className="text-[28px] mb-8">Brands</h1>

      <form onSubmit={handleCreate} className="card p-5 mb-8 flex flex-col gap-3">
        <h3 className="text-sm font-bold normal-case">Add Brand</h3>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand name" className="input" />
        <button type="submit" disabled={saving} className="btn btn-primary btn-sm w-fit disabled:opacity-50">
          {saving ? "Adding..." : "Add Brand"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {brands.map((b) => (
          <div key={b.id} className="card p-4 flex justify-between items-center">
            <span className="font-semibold text-brown-deep normal-case">{b.name}</span>
            <span className="text-xs font-mono text-ink-soft">/{b.slug}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
