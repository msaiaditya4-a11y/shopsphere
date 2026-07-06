import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useWishlist } from "@/hooks/use-wishlist";
import { fetchProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/wishlist")({
  component: WishlistPage,
  head: () => ({ meta: [{ title: "Wishlist — ShopSphere" }] }),
});

function WishlistPage() {
  const { ids } = useWishlist();
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-black tracking-tight">Wishlist</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border p-16 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-2xl font-bold">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any product to save it.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/shop">Browse the shop</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
