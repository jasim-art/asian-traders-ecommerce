"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatINR } from "@/lib/format";

const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_CHARGE = 49;

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotal, savings } = useCart();
  const { showToast } = useToast();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checking, setChecking] = useState(false);

  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_CHARGE;
  const discount = applied?.discount || 0;
  const total = Math.max(subtotal + deliveryCharge - discount, 0);

  function increment(productId: string, quantity: number, maxQuantity: number) {
    if (quantity >= maxQuantity) {
      showToast(`Only ${maxQuantity} in stock`);
      return;
    }
    setQuantity(productId, quantity + 1);
  }

  async function applyCoupon() {
    if (!coupon.trim()) return;
    setChecking(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon");
        setApplied(null);
      } else {
        setApplied({ code: data.code, discount: data.discount });
      }
    } finally {
      setChecking(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-24 text-center">
        <h1 className="text-[30px]">Your Cart is Empty</h1>
        <p className="text-ink-soft normal-case mt-3">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/shop" className="btn btn-primary mt-6 inline-flex">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      <h1 className="text-[32px] mb-8">Your Cart</h1>
      <div className="grid md:grid-cols-[1fr_360px] gap-10">
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.productId} className="card p-4 flex gap-4 items-center">
              <div className="w-20 h-20 rounded-lg bg-orange-tint overflow-hidden relative shrink-0">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="font-semibold text-brown-deep normal-case line-clamp-2">
                  {item.name}
                </Link>
                <p className="text-sm text-ink-soft mt-1">{formatINR(item.price)} / {item.unit}</p>
                {item.quantity >= item.maxQuantity && (
                  <p className="text-[11px] text-orange-deep normal-case mt-1">Max available stock reached</p>
                )}
              </div>
              <div className="flex items-center border border-line rounded-lg">
                <button
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-9 h-9 disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-9 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => increment(item.productId, item.quantity, item.maxQuantity)}
                  disabled={item.quantity >= item.maxQuantity}
                  className="w-9 h-9 disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <div className="w-24 text-right font-bold text-brown-deep">
                {formatINR(item.price * item.quantity)}
              </div>
              <button onClick={() => removeItem(item.productId)} className="text-ink-soft hover:text-orange-deep" aria-label="Remove">
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit">
          <h3 className="text-[18px] normal-case mb-4">Order Summary</h3>
          <div className="flex gap-2 mb-4">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="input"
            />
            <button onClick={applyCoupon} disabled={checking} className="btn btn-outline btn-sm shrink-0">
              Apply
            </button>
          </div>
          {couponError && <p className="text-xs text-red-600 mb-3 normal-case">{couponError}</p>}
          {applied && (
            <p className="text-xs text-green-700 mb-3 normal-case">
              Coupon &ldquo;{applied.code}&rdquo; applied — you saved {formatINR(applied.discount)}
            </p>
          )}

          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft normal-case">Subtotal</span>
              <span className="font-medium">{formatINR(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-green-700">
                <span className="normal-case">You Saved</span>
                <span className="font-medium">{formatINR(savings)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-soft normal-case">Delivery</span>
              <span className="font-medium">{deliveryCharge === 0 ? "FREE" : formatINR(deliveryCharge)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span className="normal-case">Discount</span>
                <span className="font-medium">−{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-brown-deep border-t border-line pt-2.5 mt-1">
              <span className="normal-case">Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          {subtotal < FREE_DELIVERY_THRESHOLD && (
            <p className="text-xs text-ink-soft normal-case mt-3">
              Add {formatINR(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.
            </p>
          )}

          <Link
            href={applied ? `/checkout?coupon=${applied.code}` : "/checkout"}
            className="btn btn-primary w-full mt-5"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
