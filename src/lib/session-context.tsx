"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ClientSession = { name: string; email: string; role: "customer" | "admin" } | null;

type SessionContextValue = {
  session: ClientSession;
  loading: boolean;
  refresh: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ClientSession>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSession(d.customer))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading, refresh: load }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
