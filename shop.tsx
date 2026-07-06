import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { fetchCategories, fetchProducts, type Product } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { effectivePrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const search = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating", "popular"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  discount: z.string().optional(),
  stock: z.string().optional(),
  flash: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  component: Shop,
});

const PER_PAGE = 12;

function Shop() {
  const s = Route.useSearch();
  const nav = Route.useNavigate();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const [localQ, setLocalQ] = useState(s.q ?? "");
  const brands = useMemo(
    () => Array.from(new Set((products ?? []).map((p) => p.brand).filter(Boolean))) as string[],
    [products],
  );
  const maxPrice = useMemo(
    () => Math.ceil(Math.max(0, ...(products ?? []).map((p) => Number(p.price)))),
    [products],
  );

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = [...products];
    if (s.q) {
      const q = s.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      );
    }
    if (s.category) {
      const cat = categories.find((c) => c.slug === s.category);
      if (cat) list = list.filter((p) => p.category_id === cat.id);
    }
    if (s.brand) list = list.filter((p) => p.brand === s.brand);
    if (s.min != null) list = list.filter((p) => effectivePrice(p.price, p.discount_price) >= s.min!);
    if (s.max != null) list = list.filter((p) => effectivePrice(p.price, p.discount_price) <= s.max!);
    if (s.rating) list = list.filter((p) => p.rating >= s.rating!);
    if (s.discount === "1") list = list.filter((p) => p.discount_price != null);
    if (s.stock === "1") list = list.filter((p) => p.stock > 0);
    if (s.flash === "1") list = list.filter((p) => p.flash_sale);

    switch (s.sort) {
      case "price-asc":
        list.sort((a, b) => effectivePrice(a.price, a.discount_price) - effectivePrice(b.price, b.discount_price));
        break;
      case "price-desc":
        list.sort((a, b) => effectivePrice(b.price, b.discount_price) - effectivePrice(a.price, a.discount_price));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        list.sort((a, b) => b.reviews_count - a.reviews_count);
        break;
      default:
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }
    return list;
  }, [products, categories, s]);

  const page = s.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const patch = (v: Partial<z.infer<typeof search>>) =>
    nav({ search: ((cur: object) => ({ ...cur, ...v, page: 1 })) as never });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Shop</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight">All products</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtered.length} products{s.q ? ` matching "${s.q}"` : ""}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            patch({ q: localQ });
          }}
          className="relative flex-1 min-w-[220px]"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Search products, brands…"
            className="h-11 rounded-full pl-9"
          />
        </form>

        <Select value={s.sort ?? "newest"} onValueChange={(v) => patch({ sort: v as never })}>
          <SelectTrigger className="h-11 w-[180px] rounded-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="rating">Highest rated</SelectItem>
            <SelectItem value="popular">Most popular</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11 rounded-full lg:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Filters
                s={s}
                patch={patch}
                brands={brands}
                categories={categories}
                maxPrice={maxPrice}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <Filters s={s} patch={patch} brands={brands} categories={categories} maxPrice={maxPrice} />
        </aside>

        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-16 text-center">
              <h3 className="font-display text-2xl font-bold">Nothing matches</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try loosening a filter or clearing your search.
              </p>
              <Button
                className="mt-6 rounded-full"
                variant="outline"
                onClick={() => nav({ search: {} as never })}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {paged.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                const active = n === page;
                return (
                  <Link
                    key={n}
                    to="/shop"
                    search={((cur: object) => ({ ...cur, page: n })) as never}
                    className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {n}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Filters({
  s,
  patch,
  brands,
  categories,
  maxPrice,
}: {
  s: z.infer<typeof search>;
  patch: (v: Partial<z.infer<typeof search>>) => void;
  brands: string[];
  categories: { id: string; name: string; slug: string }[];
  maxPrice: number;
}) {
  const min = s.min ?? 0;
  const max = s.max ?? (maxPrice || 3000);
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest">Category</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => patch({ category: undefined })}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${!s.category ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => patch({ category: c.slug })}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${s.category === c.slug ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest">Price</h4>
        <Slider
          min={0}
          max={maxPrice || 3000}
          step={10}
          value={[min, max]}
          onValueChange={([lo, hi]) => patch({ min: lo, max: hi })}
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>${min}</span>
          <span>${max}</span>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest">Brand</h4>
        <div className="max-h-52 space-y-2 overflow-y-auto pr-2">
          {brands.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={s.brand === b}
                onCheckedChange={(v) => patch({ brand: v ? b : undefined })}
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest">Rating</h4>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => patch({ rating: s.rating === r ? undefined : r })}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${s.rating === r ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < r ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
                />
              ))}
              & up
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={s.stock === "1"}
            onCheckedChange={(v) => patch({ stock: v ? "1" : undefined })}
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={s.discount === "1"}
            onCheckedChange={(v) => patch({ discount: v ? "1" : undefined })}
          />
          On sale
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={s.flash === "1"}
            onCheckedChange={(v) => patch({ flash: v ? "1" : undefined })}
          />
          Flash deals
        </label>
      </div>
    </div>
  );
}
