import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice, effectivePrice } from "@/lib/format";
import { toast } from "sonner";
import { CreditCard, Wallet, Landmark, Lock } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Checkout — ShopSphere" }] }),
});

const addressSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(6, "Phone required"),
  address: z.string().min(4, "Address required"),
  city: z.string().min(2, "City required"),
  zip: z.string().min(3, "ZIP required"),
  country: z.string().min(2, "Country required"),
});

function Checkout() {
  const nav = useNavigate();
  const { items, subtotal, discount, shipping, tax, total, coupon, clear } = useCart();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
  });
  const [payment, setPayment] = useState("card");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, email: f.email || user.email! }));
  }, [user]);

  useEffect(() => {
    if (items.length === 0) nav({ to: "/cart" });
  }, [items.length, nav]);

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!user) {
      toast.error("Please sign in to place an order");
      nav({ to: "/auth", search: { redirect: "/checkout" } });
      return;
    }
    try {
      const parsed = addressSchema.parse(form);
      setSubmitting(true);
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          shipping_address: parsed,
          payment_method: payment,
          subtotal,
          shipping,
          tax,
          discount,
          total_amount: total,
          order_status: "pending",
          coupon_code: coupon,
        })
        .select()
        .single();
      if (error) throw error;

      const orderItems = items.map((l) => ({
        order_id: order.id,
        product_id: l.product.id,
        title: l.product.title,
        image: l.product.images[0] ?? null,
        price: effectivePrice(l.product.price, l.product.discount_price),
        quantity: l.quantity,
      }));
      const { error: e2 } = await supabase.from("order_items").insert(orderItems);
      if (e2) throw e2;

      clear();
      toast.success("Order placed successfully");
      nav({ to: "/order-success/$id", params: { id: order.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not place order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-4xl font-black tracking-tight">Checkout</h1>
      <form onSubmit={place} className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <h2 className="font-display text-xl font-bold">Contact & shipping</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" v={form.name} on={(v) => setForm({ ...form, name: v })} />
              <Field label="Email" type="email" v={form.email} on={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone" v={form.phone} on={(v) => setForm({ ...form, phone: v })} />
              <Field label="Country" v={form.country} on={(v) => setForm({ ...form, country: v })} />
              <div className="sm:col-span-2">
                <Field label="Address" v={form.address} on={(v) => setForm({ ...form, address: v })} />
              </div>
              <Field label="City" v={form.city} on={(v) => setForm({ ...form, city: v })} />
              <Field label="ZIP / Postal" v={form.zip} on={(v) => setForm({ ...form, zip: v })} />
            </div>
          </section>

          <section className="rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <h2 className="font-display text-xl font-bold">Payment method</h2>
            <RadioGroup value={payment} onValueChange={setPayment} className="mt-4 space-y-2">
              {[
                { v: "card", label: "Credit / Debit card", Icon: CreditCard },
                { v: "wallet", label: "Digital wallet (Apple / Google Pay)", Icon: Wallet },
                { v: "bank", label: "Bank transfer", Icon: Landmark },
              ].map(({ v, label, Icon }) => (
                <label
                  key={v}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-4 has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent/5"
                >
                  <RadioGroupItem value={v} />
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="font-medium">{label}</span>
                </label>
              ))}
            </RadioGroup>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Payment UI is a demo. No card is charged.
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-3xl bg-surface p-6 shadow-elegant ring-1 ring-border">
          <h2 className="font-display text-xl font-bold">Order summary</h2>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((l) => (
              <div key={l.product.id} className="flex items-center gap-3 text-sm">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                  <img src={l.product.images[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{l.product.title}</div>
                  <div className="text-xs text-muted-foreground">Qty {l.quantity}</div>
                </div>
                <div className="font-semibold">
                  {formatPrice(effectivePrice(l.product.price, l.product.discount_price) * l.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {discount > 0 && <Row label="Discount" value={`-${formatPrice(discount)}`} />}
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <Row label="Tax" value={formatPrice(tax)} />
            <div className="flex justify-between border-t border-border pt-3 font-display text-xl font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full rounded-full h-12">
            {submitting ? "Placing order…" : "Place order"}
          </Button>
          {!user && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You'll be asked to <Link to="/auth" className="underline">sign in</Link> to complete
              your order.
            </p>
          )}
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  v,
  on,
  type = "text",
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} required type={type} className="mt-1" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
