"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatINR, discountPercent } from "@/lib/format";
import type { ProductListItem } from "@/types/catalog";

export default function ProductCard({ product }: { product: ProductListItem }) {
  const { items, addItem } = useCart();
  const { showToast } = useToast();
  const cartQty = items.find((i) => i.productId === product.id)?.quantity || 0;
  const inStock = product.stockQty > 0;
  const atMax = inStock && cartQty >= product.stockQty;
  const off = discountPercent(product.price, product.mrp);
  const image = product.images?.[0] || null;

  function handleAdd() {
    const result = addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image,
        price: parseFloat(product.price),
        mrp: parseFloat(product.mrp),
        unit: product.unit,
        maxQuantity: product.stockQty,
      },
      1
    );
    if (result === "maxed") {
      showToast(`Only ${product.stockQty} in stock`);
    } else {
      showToast("Added to cart");
    }
  }

  return (
    <div className="card overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-card-lg">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="h-[150px] bg-orange-tint relative flex items-center justify-center">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized={image.startsWith("http")}
            />
          ) : (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M4 20L11 4l3 7 6-4-3 13H4z" stroke="#C4520A" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          )}
          {off > 0 && (
            <span className="absolute top-2 left-2 bg-orange-deep text-white text-[11px] font-bold px-2 py-1 rounded-full">
              {off}% OFF
            </span>
          )}
          {!inStock && (
            <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs font-bold text-brown-deep uppercase tracking-wide">
              Out of stock
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="font-mono text-[10.5px] text-orange-deep font-semibold uppercase tracking-wide">
          {product.categoryName}
        </span>
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-[15px] normal-case font-bold text-brown-deep leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.brandName && <p className="text-[12.5px] text-ink-soft">{product.brandName}</p>}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display font-extrabold text-[19px] text-brown-deep normal-case">
            {formatINR(product.price)}
          </span>
          {off > 0 && (
            <span className="text-[13px] text-ink-soft line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
        <button
          disabled={!inStock || atMax}
          onClick={handleAdd}
          className="btn btn-primary btn-sm mt-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {!inStock ? "Out of Stock" : atMax ? "Max in Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
