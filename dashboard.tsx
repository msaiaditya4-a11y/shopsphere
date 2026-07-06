import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format";
import { ShoppingBag, Heart, User, MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — ShopSphere" }] }),
});

function Dashboard() {
  const { user } = useAuth();
  const { ids } = useWishlist();
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const total = orders.reduce((s, o) => s + Number(o.total_amount), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Dashboard</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tight">
        Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ""}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={ShoppingBag} label="Orders" value={String(orders.length)} to="/orders" />
        <Stat icon={Heart} label="Wishlist" value={String(ids.length)} to="/wishlist" />
        <Stat icon={User} label="Lifetime spend" value={formatPrice(total)} to="/orders" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Recent orders</h2>
            <Link to="/orders" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  to="/orders"
                  className="flex items-center justify-between rounded-2xl border border-border p-4 hover:bg-secondary"
                >
                  <div>
                    <div className="font-mono text-sm">#{o.id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()} · {o.order_status}
                    </div>
                  </div>
                  <div className="font-display text-lg font-bold">
                    {formatPrice(Number(o.total_amount))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-elegant">
          <MapPin className="h-6 w-6 text-accent" />
          <h2 className="mt-3 font-display text-2xl font-bold">Update your profile</h2>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Save your default shipping address for a one-tap checkout next time.
          </p>
          <Link
            to="/profile"
            className="mt-6 inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            Edit profile <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-border transition-transform hover:-translate-y-0.5"
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 font-display text-3xl font-black">{value}</div>
      </div>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
        <Icon className="h-6 w-6" />
      </div>
    </Link>
  );
}
