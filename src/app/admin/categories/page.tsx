"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string; description: string | null };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setName("");
    setDescription("");
    setSaving(false);
    load();
  }

  return (
    <div className="max-w-[700px]">
      <h1 className="text-[28px] mb-8">Categories</h1>

      <form onSubmit={handleCreate} className="card p-5 mb-8 flex flex-col gap-3">
        <h3 className="text-sm font-bold normal-case">Add Category</h3>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="input" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="input" />
        <button type="submit" disabled={saving} className="btn btn-primary btn-sm w-fit disabled:opacity-50">
          {saving ? "Adding..." : "Add Category"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {categories.map((c) => (
          <div key={c.id} className="card p-4 flex justify-between items-center">
            <div>
              <span className="font-semibold text-brown-deep normal-case">{c.name}</span>
              {c.description && <p className="text-xs text-ink-soft normal-case mt-0.5">{c.description}</p>}
            </div>
            <span className="text-xs font-mono text-ink-soft">/{c.slug}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
