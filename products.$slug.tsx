import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { fetchProductBySlug, fetchProducts } from "@/lib/queries";
import { formatPrice, effectivePrice, discountPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetails,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — ShopSphere` },
      { property: "og:title", content: `${params.slug} — ShopSphere` },
    ],
  }),
});

function ProductDetails() {
  const { slug } = Route.useParams();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { add } = useCart();
  const { toggle, has } = useWishlist();

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    throw notFound();
  }

  const priced = effectivePrice(product.price, product.discount_price);
  const off = discountPercent(product.price, product.discount_price);
  const similar = allProducts.filter(
    (p) => p.id !== product.id && p.category_id === product.category_id,
  ).slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          {" / "}
          <Link to="/shop" className="hover:text-ink">
            Shop
          </Link>
          {" / "}
          <span className="text-ink">{product.title}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <motion.div
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square overflow-hidden rounded-3xl bg-cream shadow-soft"
            >
              <img
                src={product.images[activeImg] ?? product.images[0]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
              {off > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-foreground">
                  -{off}% off
                </span>
              )}
            </motion.div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors ${
                      i === activeImg ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                {product.brand}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {product.rating.toFixed(1)} ({product.reviews_count} reviews)
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              {product.title}
            </h1>

            <div className="mt-6 flex items-end gap-3">
              <div className="text-4xl font-display font-black">{formatPrice(priced)}</div>
              {off > 0 && (
                <div className="pb-1.5 text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </div>
              )}
            </div>
            <p className="mt-1 text-sm font-semibold text-emerald-600">
              {product.stock > 0 ? `In stock · ${product.stock} available` : "Currently sold out"}
            </p>

            <p className="mt-6 text-base leading-relaxed text-ink-soft">{product.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full border border-border p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="w-8 text-center font-semibold">{qty}</div>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                onClick={() => add(product, qty)}
                disabled={product.stock === 0}
                className="h-12 flex-1 rounded-full text-base"
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> Add to cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => toggle(product.id, product.title)}
                className="h-12 rounded-full"
              >
                <Heart
                  className={`h-4 w-4 ${has(product.id) ? "fill-accent text-accent" : ""}`}
                />
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                [Truck, "Free shipping over $100"],
                [RotateCcw, "30-day returns"],
                [Shield, "2-year warranty"],
              ].map(([Icon, label]) => (
                <div
                  key={label as string}
                  className="flex items-center gap-2 rounded-2xl bg-secondary p-3 text-xs font-medium"
                >
                  <Icon className="h-4 w-4 text-accent" />
                  {label as string}
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="mb-3 font-display text-lg font-bold">Specifications</h3>
              <dl className="grid gap-2 rounded-2xl bg-surface p-4 ring-1 ring-border">
                <SpecRow label="Brand" value={product.brand ?? "—"} />
                <SpecRow label="Rating" value={`${product.rating.toFixed(1)} / 5`} />
                <SpecRow label="Reviews" value={String(product.reviews_count)} />
                <SpecRow label="Stock" value={String(product.stock)} />
              </dl>
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-black tracking-tight">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {similar.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 py-2 text-sm last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
