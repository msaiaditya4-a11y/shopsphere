import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import { effectivePrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Cart — ShopSphere" }] }),
});

function CartPage() {
  const { items, remove, setQty, subtotal, discount, shipping, tax, total, coupon, applyCoupon } =
    useCart();
  const [code, setCode] = useState(coupon ?? "");
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary text-ink">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-black tracking-tight">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Let's fix that. Start with something you love.</p>
        <Button asChild size="lg" className="mt-8 rounded-full">
          <Link to="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-4xl font-black tracking-tight">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          {items.map((l) => {
            const p = effectivePrice(l.product.price, l.product.discount_price);
            return (
              <motion.div
                key={l.product.id}
                layout
                className="flex gap-4 rounded-3xl bg-surface p-4 shadow-soft ring-1 ring-border"
              >
                <Link
                  to="/products/$slug"
                  params={{ slug: l.product.slug }}
                  className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-cream"
                >
                  <img src={l.product.images[0]} alt={l.product.title} className="h-full w-full object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    to="/products/$slug"
                    params={{ slug: l.product.slug }}
                    className="font-display text-base font-semibold leading-snug hover:text-accent"
                  >
                    {l.product.title}
                  </Link>
                  <div className="text-xs uppercase tracking-wider text-accent">{l.product.brand}</div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 rounded-full border border-border p-1">
                      <button
                        onClick={() => setQty(l.product.id, l.quantity - 1)}
                        className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <div className="w-8 text-center text-sm font-semibold">{l.quantity}</div>
                      <button
                        onClick={() => setQty(l.product.id, l.quantity + 1)}
                        className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="font-display text-lg font-bold">
                      {formatPrice(p * l.quantity)}
                    </div>
                    <button
                      onClick={() => remove(l.product.id)}
                      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <aside className="h-fit rounded-3xl bg-surface p-6 shadow-elegant ring-1 ring-border">
          <h2 className="font-display text-xl font-bold">Order summary</h2>
          <div className="mt-6 space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {discount > 0 && <Row label={`Discount (${coupon})`} value={`-${formatPrice(discount)}`} />}
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <Row label="Tax" value={formatPrice(tax)} />
            <div className="my-3 h-px bg-border" />
            <div className="flex justify-between font-display text-xl font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyCoupon(code);
            }}
            className="mt-6 flex gap-2"
          >
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon (try WELCOME10)"
              className="h-11 rounded-full"
            />
            <Button type="submit" variant="outline" className="rounded-full h-11">
              Apply
            </Button>
          </form>

          <Button
            size="lg"
            onClick={() => nav({ to: "/checkout" })}
            className="mt-4 w-full rounded-full h-12 text-base"
          >
            Checkout <ArrowRight className="ml-1 h-4 w-4" />
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Free shipping on orders over $100 · 30-day returns
          </p>
        </aside>
      </div>
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
