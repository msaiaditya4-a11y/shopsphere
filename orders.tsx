import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  component: Orders,
  head: () => ({ meta: [{ title: "My Orders — ShopSphere" }] }),
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-black tracking-tight">My orders</h1>
      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border p-16 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-2xl font-bold">No orders yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your future orders will show up here.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-border">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Order</div>
                  <div className="font-mono text-sm">#{o.id.slice(0, 8)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[o.order_status] ?? "bg-secondary"}`}
                  >
                    {o.order_status}
                  </span>
                  <div className="mt-2 font-display text-2xl font-bold">
                    {formatPrice(Number(o.total_amount))}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(o.order_items ?? []).map((it: { id: string; title: string; image: string | null; quantity: number; price: number }) => (
                  <div key={it.id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                    {it.image && (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                        <img src={it.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 text-sm">
                      <div className="truncate font-medium">{it.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Qty {it.quantity} · {formatPrice(Number(it.price))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
