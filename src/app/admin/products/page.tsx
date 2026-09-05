"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/format";

type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: string;
  mrp: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryName: string;
  brandName: string | null;
  stockQty: number | null;
  lowStockAt: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this product? It will be hidden from the store.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-[28px]">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">+ Add Product</Link>
      </div>

      <div className="flex gap-2 mb-5 max-w-md">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search products..."
          className="input"
        />
        <button onClick={load} className="btn btn-outline btn-sm shrink-0">Search</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 normal-case text-ink-soft font-semibold">Product</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Category</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Price</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Stock</th>
              <th className="p-3 normal-case text-ink-soft font-semibold">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-ink-soft normal-case">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-ink-soft normal-case">No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <span className="font-semibold text-brown-deep normal-case">{p.name}</span>
                    <span className="block text-xs text-ink-soft normal-case">SKU: {p.sku}</span>
                  </td>
                  <td className="p-3 normal-case">{p.categoryName}</td>
                  <td className="p-3 normal-case">{formatINR(p.price)}</td>
                  <td className="p-3">
                    <span className={(p.stockQty ?? 0) <= p.lowStockAt ? "text-orange-deep font-semibold" : ""}>
                      {p.stockQty ?? 0}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-semibold text-orange-deep mr-3">Edit</Link>
                    <button onClick={() => handleDelete(p.id)} className="text-xs font-semibold text-red-600">Delete</button>
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
