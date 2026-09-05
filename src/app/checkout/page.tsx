"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useSession } from "@/lib/session-context";
import { formatINR } from "@/lib/format";

const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_CHARGE = 49;

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutForm />
    </Suspense>
  );
}

function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: loadingSession } = useSession();

  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "RAZORPAY">("COD");
  const [couponCode] = useState(searchParams.get("coupon") || "");
  const [discount, setDiscount] = useState(0);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Amazon/Flipkart-style flow: checkout requires an account. Guests are
  // sent to sign in and bounced straight back here once they're in.
  useEffect(() => {
    if (!loadingSession && !session && items.length > 0) {
      router.replace("/account/login?redirect=/checkout");
    }
  }, [loadingSession, session, items.length, router]);

  useEffect(() => {
    if (couponCode) {
      fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.discount) setDiscount(d.discount);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deliveryCharge = deliveryMethod === "PICKUP" || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = Math.max(subtotal + deliveryCharge - discount, 0);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload: Record<string, unknown> = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      deliveryMethod,
      paymentMethod,
      couponCode: couponCode || undefined,
      notes: notes || undefined,
    };
    if (deliveryMethod === "DELIVERY") payload.address = address;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not place your order. Please try again.");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/order-confirmation/${data.order.orderNumber}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
        <h1 className="text-[28px]">Nothing to Checkout</h1>
        <p className="text-ink-soft normal-case mt-3">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-primary mt-6 inline-flex">Shop Now</Link>
      </div>
    );
  }

  // Redirecting to login — render nothing so the guest form never flashes.
  if (!loadingSession && !session) {
    return null;
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      <h1 className="text-[32px] mb-8">Checkout</h1>
      {session && (
        <p className="text-sm text-ink-soft normal-case -mt-6 mb-8">
          Signed in as <span className="font-semibold text-brown-deep">{session.name}</span> ({session.email})
        </p>
      )}
      <form onSubmit={placeOrder} className="grid md:grid-cols-[1fr_360px] gap-10">
        <div className="flex flex-col gap-8">
          <div className="card p-6">
            <h3 className="text-[18px] normal-case mb-4">1. Delivery Method</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: "DELIVERY", label: "Home Delivery", desc: "Delivered to your address in Manalmedu" },
                { key: "PICKUP", label: "Store Pickup", desc: "Collect from Asian Traders, Manalmedu" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setDeliveryMethod(opt.key as any)}
                  className={`text-left p-4 rounded-lg border-2 ${
                    deliveryMethod === opt.key ? "border-orange bg-orange-tint" : "border-line"
                  }`}
                >
                  <span className="block font-semibold text-sm text-brown-deep">{opt.label}</span>
                  <span className="block text-xs text-ink-soft normal-case mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {deliveryMethod === "DELIVERY" && (
            <div className="card p-6">
              <h3 className="text-[18px] normal-case mb-4">2. Delivery Address</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address Line 1</label>
                  <input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address Line 2 (optional)</label>
                  <input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input required value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="input" />
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h3 className="text-[18px] normal-case mb-4">3. Payment Method</h3>
            <div className="flex flex-col gap-3">
              {[
                { key: "COD", label: "Cash on Delivery", desc: "Pay when your order arrives" },
                { key: "UPI", label: "UPI", desc: "Pay via GPay, PhonePe, or any UPI app" },
                { key: "RAZORPAY", label: "Card / Net Banking (Razorpay)", desc: "Secure online payment" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setPaymentMethod(opt.key as any)}
                  className={`text-left p-4 rounded-lg border-2 flex justify-between items-center ${
                    paymentMethod === opt.key ? "border-orange bg-orange-tint" : "border-line"
                  }`}
                >
                  <span>
                    <span className="block font-semibold text-sm text-brown-deep">{opt.label}</span>
                    <span className="block text-xs text-ink-soft normal-case mt-1">{opt.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <label className="label">Order Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input" />
          </div>
        </div>

        {/* Order summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h3 className="text-[18px] normal-case mb-4">Order Summary</h3>
          <div className="flex flex-col gap-3 max-h-[240px] overflow-y-auto mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="normal-case text-ink-soft">{item.name} × {item.quantity}</span>
                <span className="font-medium">{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 text-sm border-t border-line pt-4">
            <div className="flex justify-between">
              <span className="text-ink-soft normal-case">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft normal-case">Delivery</span>
              <span>{deliveryCharge === 0 ? "FREE" : formatINR(deliveryCharge)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span className="normal-case">Discount</span>
                <span>−{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-brown-deep border-t border-line pt-2.5 mt-1">
              <span className="normal-case">Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 normal-case mt-4">{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full mt-5 disabled:opacity-50">
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
