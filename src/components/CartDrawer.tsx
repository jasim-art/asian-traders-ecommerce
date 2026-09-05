"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatINR } from "@/lib/format";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, setQuantity, subtotal, savings, totalItems } = useCart();
  const { showToast } = useToast();

  if (!isOpen) return null;

  function increment(productId: string, quantity: number, maxQuantity: number) {
    if (quantity >= maxQuantity) {
      showToast(`Only ${maxQuantity} in stock`);
      return;
    }
    setQuantity(productId, quantity + 1);
  }

  return (
    <div className="fixed inset-0 z-[200]">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-[400px] bg-white shadow-card-lg flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-line shrink-0">
          <h3 className="text-[18px] normal-case">Your Cart ({totalItems})</h3>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
            className="w-8 h-8 -mr-2 flex items-center justify-center text-2xl leading-none text-ink-soft hover:text-brown-deep transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="mb-4 opacity-70">
                <path
                  d="M4 6h15l-1.5 9h-12L5 3H2"
                  stroke="#6B5D50"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="20" r="1.4" stroke="#6B5D50" strokeWidth="1.4" />
                <circle cx="17" cy="20" r="1.4" stroke="#6B5D50" strokeWidth="1.4" />
              </svg>
              <p className="font-semibold text-brown-deep normal-case">Your cart is empty</p>
              <p className="text-sm text-ink-soft normal-case mt-1">Add something you love to get started.</p>
              <button onClick={() => setIsOpen(false)} className="btn btn-primary btn-sm mt-5">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 border-b border-line pb-4 last:border-b-0 last:pb-0">
                  <div className="w-16 h-16 rounded-lg bg-orange-tint overflow-hidden shrink-0 relative">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-semibold text-brown-deep normal-case line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-ink-soft normal-case mt-0.5">
                      {formatINR(item.price)} / {item.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-line rounded-md">
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="w-6 h-6 text-sm disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => increment(item.productId, item.quantity, item.maxQuantity)}
                          disabled={item.quantity >= item.maxQuantity}
                          aria-label="Increase quantity"
                          className="w-6 h-6 text-sm disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-xs text-orange-deep font-semibold normal-case"
                      >
                        Remove
                      </button>
                    </div>
                    {item.quantity >= item.maxQuantity && (
                      <p className="text-[11px] text-orange-deep normal-case mt-1">
                        Max available stock reached
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-bold text-brown-deep shrink-0 normal-case">
                    {formatINR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 sm:px-6 py-5 border-t border-line shrink-0">
            <div className="flex flex-col gap-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-ink-soft normal-case">Subtotal</span>
                <span className="font-semibold text-brown-deep">{formatINR(subtotal)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-700">
                  <span className="normal-case">You Saved</span>
                  <span className="font-semibold">{formatINR(savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-brown-deep border-t border-line pt-2.5 mt-1">
                <span className="normal-case">Total</span>
                <span>{formatINR(subtotal)}</span>
              </div>
            </div>
            <Link href="/cart" onClick={() => setIsOpen(false)} className="btn btn-outline w-full mb-2">
              View Cart
            </Link>
            <Link href="/checkout" onClick={() => setIsOpen(false)} className="btn btn-primary w-full">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
