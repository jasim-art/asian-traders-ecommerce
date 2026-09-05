"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session-context";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      refresh();
      const defaultDest = data.customer?.role === "admin" ? "/admin" : "/account";
      const redirectTarget = getSafeRedirect(searchParams.get("redirect"), defaultDest);
      router.push(redirectTarget);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[420px] mx-auto px-6 py-20">
      <h1 className="text-[30px] mb-2">Sign In</h1>
      <p className="text-ink-soft normal-case mb-8">Welcome back to Asian Traders.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Password</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        {error && <p className="text-sm text-red-600 normal-case">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="text-sm text-ink-soft normal-case mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link
          href={`/account/register${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
          className="text-orange-deep font-semibold"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
