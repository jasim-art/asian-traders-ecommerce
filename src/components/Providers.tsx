"use client";

import { CartProvider } from "@/lib/cart-context";
import { SessionProvider } from "@/lib/session-context";
import { ToastProvider } from "@/lib/toast-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
