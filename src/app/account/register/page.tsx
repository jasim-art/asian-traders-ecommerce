"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session-context";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();
  const redirect = searchParams.get("redirect") || "";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getSafeRedirect(rawRedirect: string | null, fallback: string): string {
    if (!rawRedirect) return fallback;
    if (rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !rawRedirect.includes(":")) {
      return rawRedirect;
    }
    return fallback;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      refresh();
      const redirectTarget = getSafeRedirect(searchParams.get("redirect"), "/account");
      router.push(redirectTarget);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[420px] mx-auto px-6 py-20">
      <h1 className="text-[30px] mb-2">Create Account</h1>
      <p className="text-ink-soft normal-case mb-8">Join Asian Traders for faster checkout and order tracking.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Full Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Password</label>
          <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        </div>
        {error && <p className="text-sm text-red-600 normal-case">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="text-sm text-ink-soft normal-case mt-6 text-center">
        Already have an account?{" "}
        <Link href={`/account/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-orange-deep font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  );
}
