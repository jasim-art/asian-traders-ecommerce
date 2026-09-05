import { getDashboardStats } from "@/lib/admin-queries";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const maxDay = Math.max(1, ...stats.salesByDay.map((d) => parseFloat(d.total)));

  const cards = [
    { label: "Total Sales", value: formatINR(stats.totalSales) },
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Total Customers", value: stats.totalCustomers },
    { label: "Total Products", value: stats.totalProducts },
    { label: "Low Stock Items", value: stats.lowStockProducts.length },
  ];

  return (
    <div>
      <h1 className="text-[28px] mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs text-ink-soft normal-case uppercase tracking-wide">{c.label}</p>
            <p className="text-[26px] font-display font-extrabold text-brown-deep mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-10">
        <h3 className="text-[16px] normal-case font-bold mb-5">Sales — Last 14 Days</h3>
        {stats.salesByDay.length === 0 ? (
          <p className="text-sm text-ink-soft normal-case">No sales recorded in this period yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-[160px]">
            {stats.salesByDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                <div
                  className="w-full bg-orange rounded-t-md"
                  style={{ height: `${Math.max((parseFloat(d.total) / maxDay) * 100, 4)}%` }}
                  title={`${d.day}: ${formatINR(d.total)}`}
                />
                <span className="text-[9px] text-ink-soft rotate-0">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div className="card p-6">
          <h3 className="text-[16px] normal-case font-bold mb-4">Low Stock Alerts</h3>
          <div className="flex flex-col gap-2">
            {stats.lowStockProducts.map((p) => (
              <div key={p.id} className="flex justify-between text-sm border-b border-line pb-2 last:border-0">
                <span className="normal-case">{p.name}</span>
                <span className="font-semibold text-orange-deep">{p.quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
