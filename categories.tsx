import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/queries";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({
    meta: [
      { title: "Categories — ShopSphere" },
      { name: "description", content: "Shop by category on ShopSphere." },
    ],
  }),
});

function CategoriesPage() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Explore</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tight">Categories</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Six edits, hand-picked. Start where curiosity takes you.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/shop"
            search={{ category: c.slug } as never}
            className="group relative block aspect-[4/3] overflow-hidden rounded-3xl shadow-soft ring-1 ring-border"
          >
            <img
              src={c.image_url ?? ""}
              alt={c.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 text-primary-foreground">
              <div className="font-display text-2xl font-bold">{c.name}</div>
              <div className="text-sm opacity-80">{c.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
