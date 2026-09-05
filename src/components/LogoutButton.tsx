"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { useToast } from "@/lib/toast-context";

export default function LogoutButton() {
  const router = useRouter();
  const { refresh } = useSession();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("logout failed");
      refresh();
      router.push("/");
      router.refresh();
    } catch {
      // Don't pretend it worked if the server call actually failed — the
      // session cookie may still be valid, so silently redirecting would
      // just leave the user confused about whether they're logged in.
      showToast("Could not log out. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button onClick={handleLogout} disabled={loading} className="btn btn-outline btn-sm disabled:opacity-60">
      {loading ? "Logging out..." : "Log Out"}
    </button>
  );
}
