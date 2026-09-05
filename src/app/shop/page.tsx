import Link from "next/link";
import { listProducts, listCategories, listBrands } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop All Products",
  description: "Browse paints, plumbing, electrical, hardware, tools and construction materials at Asian Traders, Manalmedu.",
};

type SearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const [products, categories, brands] = await Promise.all([
    listProducts({
      q: searchParams.q,
      category: searchParams.category,
      brand: searchParams.brand,
      sort: (searchParams.sort as any) || "featured",
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    }),
    listCategories(),
    listBrands(),
  ]);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  }

  const activeCategory = categories.find((c) => c.slug === searchParams.category);

  return (
    <div className="max-w-[1240px] mx-auto px-6 py-12">
      <div className="mb-8">
        <span className="eyebrow">
          {activeCategory ? activeCategory.name : "Full Catalogue"}
        </span>
        <h1 className="mt-2.5 text-[36px]">{activeCategory ? activeCategory.name : "Shop All Products"}</h1>
        {searchParams.q && (
          <p className="text-ink-soft normal-case mt-2">
            Showing results for <strong>&ldquo;{searchParams.q}&rdquo;</strong>
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-9">
        {/* Sidebar filters */}
        <aside className="flex flex-col gap-8">
          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-wide text-brown-deep mb-3">Categories</h4>
            <ul className="flex flex-col gap-1.5">
              <li>
                <Link
                  href={buildUrl({ category: undefined })}
                  className={`block text-[14px] py-1.5 normal-case ${!searchParams.category ? "font-bold text-orange-deep" : "text-ink-soft"}`}
                >
                  All Categories
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildUrl({ category: c.slug })}
                    className={`block text-[14px] py-1.5 normal-case ${searchParams.category === c.slug ? "font-bold text-orange-deep" : "text-ink-soft"}`}
                  >
                    {c.name} <span className="text-xs">({c.productCount})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-wide text-brown-deep mb-3">Brands</h4>
            <ul className="flex flex-col gap-1.5">
              <li>
                <Link
                  href={buildUrl({ brand: undefined })}
                  className={`block text-[14px] py-1.5 normal-case ${!searchParams.brand ? "font-bold text-orange-deep" : "text-ink-soft"}`}
                >
                  All Brands
                </Link>
              </li>
              {brands.map((b) => (
                <li key={b.id}>
                  <Link
                    href={buildUrl({ brand: b.slug })}
                    className={`block text-[14px] py-1.5 normal-case ${searchParams.brand === b.slug ? "font-bold text-orange-deep" : "text-ink-soft"}`}
                  >
                    {b.name} <span className="text-xs">({b.productCount})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product grid */}
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <span className="text-sm text-ink-soft normal-case">{products.length} products</span>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-ink-soft normal-case">Sort:</span>
              {[
                { key: "featured", label: "Featured" },
                { key: "price_asc", label: "Price: Low to High" },
                { key: "price_desc", label: "Price: High to Low" },
                { key: "rating", label: "Top Rated" },
              ].map((s) => (
                <Link
                  key={s.key}
                  href={buildUrl({ sort: s.key })}
                  className={`text-xs px-3 py-1.5 rounded-full border normal-case ${
                    (searchParams.sort || "featured") === s.key
                      ? "bg-orange text-white border-orange"
                      : "border-line text-ink-soft"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="card p-16 text-center">
              <p className="text-ink-soft normal-case">No products found. Try a different search or filter.</p>
              <Link href="/shop" className="btn btn-outline btn-sm mt-4 inline-flex">Clear Filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
