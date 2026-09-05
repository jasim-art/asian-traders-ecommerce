"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useSession } from "@/lib/session-context";
import { useToast } from "@/lib/toast-context";
import CartDrawer from "@/components/CartDrawer";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop#categories", label: "Categories" },
  { href: "/shop#brands", label: "Brands" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const { totalItems, setIsOpen } = useCart();
  const { session, loading, refresh } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919442425301";
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
    setMenuOpen(false);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("logout failed");
      setAccountOpen(false);
      setMenuOpen(false);
      refresh();
      router.push("/");
      router.refresh();
    } catch {
      showToast("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  const firstName = session?.name?.split(" ")[0];

  return (
    <header className="sticky top-0 z-[100] bg-[rgba(251,248,243,0.92)] backdrop-blur border-b border-line">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="flex items-center justify-between h-[76px]">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Asian Traders"
              width={404}
              height={208}
              priority
              className="h-[54px] w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[14.5px] font-semibold text-brown relative py-1 hover:text-orange-deep transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((s) => !s)}
              className="w-10 h-10 rounded-full border border-line flex items-center justify-center hover:border-orange transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#3D2B1F" strokeWidth="1.8" />
                <path d="M21 21l-4-4" stroke="#3D2B1F" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener"
              className="hidden sm:flex w-10 h-10 rounded-full border border-line items-center justify-center hover:border-orange transition-colors"
              aria-label="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17.6 6.4A8 8 0 1 0 5 17l-1 4 4.1-1a8 8 0 0 0 9.5-13.6z" stroke="#3D2B1F" strokeWidth="1.7" />
              </svg>
            </a>

            {/* Account: shows Login when signed out, name + dropdown when signed in */}
            <div ref={accountRef} className="relative hidden sm:block">
              {!loading && session ? (
                <>
                  <button
                    onClick={() => setAccountOpen((o) => !o)}
                    className="flex items-center gap-1.5 h-10 pl-1.5 pr-3 rounded-full border border-line hover:border-orange transition-colors"
                    aria-label="Account menu"
                  >
                    <span className="w-7 h-7 rounded-full bg-brown-deep text-white text-[12px] font-bold flex items-center justify-center uppercase">
                      {firstName?.[0] || "U"}
                    </span>
                    <span className="text-[13.5px] font-semibold text-brown-deep max-w-[90px] truncate">
                      {firstName}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="#3D2B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-line rounded-lg shadow-card-lg overflow-hidden">
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-brown-deep normal-case hover:bg-orange-tint"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-brown-deep normal-case hover:bg-orange-tint"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-orange-deep normal-case hover:bg-orange-tint border-t border-line disabled:opacity-60"
                      >
                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/account/login"
                  className="flex items-center gap-1.5 h-10 px-4 rounded-full border border-line hover:border-orange transition-colors text-[13.5px] font-semibold text-brown-deep"
                >
                  Login
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="relative w-10 h-10 rounded-full bg-brown-deep flex items-center justify-center"
              aria-label="Cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6h15l-1.5 9h-12L5 3H2"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="20" r="1.4" fill="#fff" />
                <circle cx="17" cy="20" r="1.4" fill="#fff" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              className="flex md:hidden flex-col gap-[5px] w-[26px]"
              aria-label="Menu"
              onClick={() => setMenuOpen((m) => !m)}
            >
              <span className="h-[2.5px] bg-brown-deep rounded" />
              <span className="h-[2.5px] bg-brown-deep rounded" />
              <span className="h-[2.5px] bg-brown-deep rounded" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={submitSearch} className="pb-4">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for paints, pipes, tools..."
              className="input"
            />
          </form>
        )}
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col bg-white border-t border-line px-6 py-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-3.5 font-semibold text-brown-deep border-b border-line text-[15px]"
            >
              {l.label}
            </Link>
          ))}
          {!loading && session ? (
            <>
              <Link href="/account" onClick={() => setMenuOpen(false)} className="py-3.5 font-semibold text-brown-deep border-b border-line text-[15px]">
                My Account ({firstName})
              </Link>
              <Link href="/account" onClick={() => setMenuOpen(false)} className="py-3.5 font-semibold text-brown-deep border-b border-line text-[15px]">
                My Orders
              </Link>
              <button onClick={handleLogout} disabled={loggingOut} className="py-3.5 font-semibold text-orange-deep text-left text-[15px] disabled:opacity-60">
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <Link href="/account/login" onClick={() => setMenuOpen(false)} className="py-3.5 font-semibold text-brown-deep border-b border-line text-[15px]">
              Login
            </Link>
          )}
          <a href={`https://wa.me/${whatsapp}`} className="py-3.5 font-semibold text-brown-deep text-[15px]">
            WhatsApp Us
          </a>
        </div>
      )}

      <CartDrawer />
    </header>
  );
}
