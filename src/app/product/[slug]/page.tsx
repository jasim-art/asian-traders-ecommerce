import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProductReviews } from "@/lib/queries";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductCard from "@/components/ProductCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description || `Buy ${product.name} at Asian Traders, Manalmedu.`,
    openGraph: { images: product.images?.[0] ? [product.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product.categorySlug, product.id),
    getProductReviews(product.id),
  ]);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: product.images,
    description: product.description,
    brand: product.brandName ? { "@type": "Brand", name: product.brandName } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.stockQty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="max-w-[1240px] mx-auto px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <ProductDetailClient product={product} />

      {reviews.length > 0 && (
        <div className="mt-16 max-w-[720px]">
          <h3 className="text-[22px] normal-case mb-5">Customer Reviews</h3>
          <div className="flex flex-col gap-5">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-line pb-5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-brown-deep">{r.authorName}</span>
                  <span className="text-xs text-orange-deep">{"★".repeat(r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-ink-soft normal-case mt-1.5">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h3 className="text-[22px] normal-case mb-5">You May Also Like</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
