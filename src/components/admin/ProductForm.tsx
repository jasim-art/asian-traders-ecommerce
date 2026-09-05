"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

export type ProductFormValues = {
  sku: string;
  name: string;
  description: string;
  images: string;
  price: string;
  mrp: string;
  unit: string;
  categoryId: string;
  brandId: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  stockQty: string;
  lowStockAt: string;
};

const EMPTY: ProductFormValues = {
  sku: "",
  name: "",
  description: "",
  images: "",
  price: "",
  mrp: "",
  unit: "pc",
  categoryId: "",
  brandId: "",
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  stockQty: "0",
  lowStockAt: "5",
};

export default function ProductForm({
  initial,
  productId,
}: {
  initial?: Partial<ProductFormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
    fetch("/api/brands").then((r) => r.json()).then((d) => setBrands(d.brands || []));
  }, []);

  function set<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      sku: values.sku,
      name: values.name,
      description: values.description,
      images: values.images.split(",").map((s) => s.trim()).filter(Boolean),
      price: parseFloat(values.price),
      mrp: parseFloat(values.mrp),
      unit: values.unit,
      categoryId: values.categoryId,
      brandId: values.brandId || undefined,
      isActive: values.isActive,
      isFeatured: values.isFeatured,
      isBestSeller: values.isBestSeller,
      stockQty: parseInt(values.stockQty, 10),
      lowStockAt: parseInt(values.lowStockAt, 10),
    };

    const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save product");
        setSaving(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[720px] flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">SKU</label>
          <input required disabled={!!productId} value={values.sku} onChange={(e) => set("sku", e.target.value)} className="input disabled:opacity-60" />
        </div>
        <div>
          <label className="label">Unit</label>
          <input required value={values.unit} onChange={(e) => set("unit", e.target.value)} placeholder="pc, bag, litre..." className="input" />
        </div>
      </div>

      <div>
        <label className="label">Product Name</label>
        <input required value={values.name} onChange={(e) => set("name", e.target.value)} className="input" />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} className="input" />
      </div>

      <div>
        <label className="label">Image URLs (comma-separated)</label>
        <input value={values.images} onChange={(e) => set("images", e.target.value)} className="input" placeholder="https://..., https://..." />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Price (₹)</label>
          <input required type="number" step="0.01" value={values.price} onChange={(e) => set("price", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">MRP (₹)</label>
          <input required type="number" step="0.01" value={values.mrp} onChange={(e) => set("mrp", e.target.value)} className="input" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Category</label>
          <select required value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="input">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Brand (optional)</label>
          <select value={values.brandId} onChange={(e) => set("brandId", e.target.value)} className="input">
            <option value="">No brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Stock Quantity</label>
          <input required type="number" value={values.stockQty} onChange={(e) => set("stockQty", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Low Stock Threshold</label>
          <input required type="number" value={values.lowStockAt} onChange={(e) => set("lowStockAt", e.target.value)} className="input" />
        </div>
      </div>

      <div className="flex gap-6 flex-wrap">
        <label className="flex items-center gap-2 text-sm normal-case">
          <input type="checkbox" checked={values.isActive} onChange={(e) => set("isActive", e.target.checked)} /> Active
        </label>
        <label className="flex items-center gap-2 text-sm normal-case">
          <input type="checkbox" checked={values.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm normal-case">
          <input type="checkbox" checked={values.isBestSeller} onChange={(e) => set("isBestSeller", e.target.checked)} /> Best Seller
        </label>
      </div>

      {error && <p className="text-sm text-red-600 normal-case">{error}</p>}

      <button type="submit" disabled={saving} className="btn btn-primary w-fit disabled:opacity-50">
        {saving ? "Saving..." : productId ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
