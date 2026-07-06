import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/queries";
import { formatPrice, effectivePrice, discountPercent } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const priced = effectivePrice(product.price, product.discount_price);
  const off = discountPercent(product.price, product.discount_price);
  const inStock = product.stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-surface shadow-soft ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-elegant"
    >
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-cream"
      >
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground shadow-soft">
              -{off}%
            </span>
          )}
          {product.flash_sale && (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-destructive-foreground">
              Flash
            </span>
          )}
          {!inStock && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
              Sold out
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id, product.title);
            }}
            className="grid h-9 w-9 place-items-center rounded-full bg-surface/95 text-ink shadow-soft transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${has(product.id) ? "fill-accent text-accent" : ""}`} />
          </button>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-surface/95 text-ink shadow-soft">
            <Eye className="h-4 w-4" />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider text-accent">{product.brand}</span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {product.rating.toFixed(1)}
            <span className="text-muted-foreground/60">({product.reviews_count})</span>
          </span>
        </div>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="mt-1.5 line-clamp-2 min-h-[2.5rem] font-display text-base font-semibold leading-snug tracking-tight hover:text-accent"
        >
          {product.title}
        </Link>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-ink">{formatPrice(priced)}</div>
            {off > 0 && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </div>
            )}
          </div>
          <Button
            size="icon"
            onClick={() => add(product)}
            disabled={!inStock}
            className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground shadow-soft transition-transform hover:scale-105 disabled:opacity-40"
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
