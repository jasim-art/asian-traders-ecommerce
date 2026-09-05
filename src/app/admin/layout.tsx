import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/coupons", label: "Coupons" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/account/login?redirect=/admin");
  if (session.role !== "admin") redirect("/");

  return (
    <div className="min-h-[70vh] md:grid md:grid-cols-[220px_1fr] max-w-[1320px] mx-auto">
      <aside className="border-r border-line px-4 py-8 hidden md:block">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-4 px-2">Admin Panel</p>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-brown-deep hover:bg-orange-tint normal-case"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 px-2">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile/tablet: horizontally scrollable pill nav instead of a hidden sidebar */}
      <nav className="md:hidden sticky top-[76px] z-10 bg-bg border-b border-line px-4 py-3 flex items-center gap-4">
        <div className="flex gap-2 overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3.5 py-1.5 rounded-full border border-line text-[13px] font-semibold text-brown-deep whitespace-nowrap shrink-0 hover:border-orange normal-case"
            >
              {n.label}
            </Link>
          ))}
        </div>
        <div className="shrink-0">
          <LogoutButton />
        </div>
      </nav>

      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
