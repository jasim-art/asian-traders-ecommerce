"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatINR, discountPercent } from "@/lib/format";
import type { ProductDetail } from "@/types/catalog";

export default function ProductDetailClient({ product }: { product: ProductDetail }) {
  const { items, addItem } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const cartQty = items.find((i) => i.productId === product.id)?.quantity || 0;
  const inStock = product.stockQty > 0;
  const off = discountPercent(product.price, product.mrp);
  const images = product.images?.length ? product.images : [null];
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919442425301";

  function buildCartItem() {
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || null,
      price: parseFloat(product.price),
      mrp: parseFloat(product.mrp),
      unit: product.unit,
      maxQuantity: product.stockQty,
    };
  }

  function handleAddToCart() {
    const result = addItem(buildCartItem(), qty);
    showToast(result === "maxed" ? `Only ${product.stockQty} in stock` : "Added to cart");
  }

  function handleBuyNow() {
    addItem(buildCartItem(), qty);
    router.push("/checkout");
  }

  const enquiryMsg = encodeURIComponent(
    `Hi, I'd like to enquire about "${product.name}" (SKU: ${product.sku}) listed on your website.`
  );

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Gallery */}
      <div>
        <div className="card h-[380px] flex items-center justify-center overflow-hidden relative bg-orange-tint">
          {images[activeImg] ? (
            <Image
              src={images[activeImg]!}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={images[activeImg]!.startsWith("http")}
            />
          ) : (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <path d="M4 20L11 4l3 7 6-4-3 13H4z" stroke="#C4520A" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          )}
          {off > 0 && (
            <span className="absolute top-3 left-3 bg-orange-deep text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {off}% OFF
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 relative ${
                  i === activeImg ? "border-orange" : "border-line"
                }`}
              >
                {img && <Image src={img} alt="" fill className="object-cover" sizes="64px" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <span className="font-mono text-[11px] text-orange-deep font-semibold uppercase tracking-wide">
          {product.categoryName} {product.brandName ? `• ${product.brandName}` : ""}
        </span>
        <h1 className="mt-2 text-[30px] normal-case">{product.name}</h1>
        <p className="text-xs text-ink-soft mt-1 normal-case">SKU: {product.sku}</p>

        {parseFloat(product.rating) > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm font-bold text-brown-deep">★ {product.rating}</span>
            <span className="text-xs text-ink-soft normal-case">({product.ratingCount} reviews)</span>
          </div>
        )}

        <div className="flex items-baseline gap-3 mt-5">
          <span className="font-display font-extrabold text-[32px] text-brown-deep normal-case">
            {formatINR(product.price)}
          </span>
          {off > 0 && <span className="text-lg text-ink-soft line-through">{formatINR(product.mrp)}</span>}
          <span className="text-sm text-ink-soft normal-case">/ {product.unit}</span>
        </div>

        <p className={`mt-2 text-sm font-semibold ${inStock ? "text-green-700" : "text-red-600"}`}>
          {inStock ? `In Stock (${product.stockQty} available)` : "Out of Stock"}
        </p>

        {product.description && (
          <p className="mt-5 text-ink-soft normal-case leading-relaxed">{product.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-7">
          <div className="flex items-center border border-line rounded-lg shrink-0">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 text-lg">−</button>
            <span className="w-10 text-center">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stockQty, q + 1))}
              className="w-10 h-10 text-lg"
              disabled={qty >= product.stockQty}
            >
              +
            </button>
          </div>
          <button onClick={handleAddToCart} disabled={!inStock} className="btn btn-outline flex-1 min-w-[140px] disabled:opacity-40">
            Add to Cart
          </button>
          <button onClick={handleBuyNow} disabled={!inStock} className="btn btn-primary flex-1 min-w-[140px] disabled:opacity-40">
            Buy Now
          </button>
        </div>
        {inStock && cartQty > 0 && (
          <p className="text-xs text-ink-soft normal-case mt-2">{cartQty} already in your cart</p>
        )}

        <a
          href={`https://wa.me/${whatsapp}?text=${enquiryMsg}`}
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2 mt-4 text-sm font-semibold text-[#1f8a4c]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M17.6 6.4A8 8 0 1 0 5 17l-1 4 4.1-1a8 8 0 0 0 9.5-13.6z" stroke="#1f8a4c" strokeWidth="1.8" />
          </svg>
          Ask about this product on WhatsApp
        </a>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-9">
            <h3 className="text-[18px] normal-case mb-3">Specifications</h3>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([key, val]) => (
                  <tr key={key} className="border-b border-line">
                    <td className="py-2.5 pr-4 text-ink-soft normal-case w-1/3">{key}</td>
                    <td className="py-2.5 font-medium text-brown-deep normal-case">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
