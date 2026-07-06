import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchCategories, fetchProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Countdown } from "@/components/site/Countdown";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, Sparkles, RotateCcw, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const trending = products.filter((p) => p.trending).slice(0, 8);
  const flash = products.filter((p) => p.flash_sale).slice(0, 4);
  const heroTarget = new Date();
  heroTarget.setDate(heroTarget.getDate() + 2);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <Sparkles className="h-3.5 w-3.5" /> New season · 2026
            </span>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Objects worth <span className="italic text-accent">keeping</span>.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-primary-foreground/70">
              A quietly ambitious marketplace for the tech, audio, and everyday tools you'll actually
              reach for. Curated by editors, delivered by us.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-accent px-6 text-accent-foreground hover:bg-accent/90">
                <Link to="/shop">
                  Shop the collection <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/categories">Browse categories</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-primary-foreground/60">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-accent text-accent" />
                4.9 avg from 12,400+ reviews
              </div>
              <div>Free shipping · $100+</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-elegant ring-1 ring-primary-foreground/10">
              <img
                src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200"
                alt="Featured product"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-6 bottom-6 glass rounded-2xl p-4 text-ink">
                <div className="text-[10px] font-bold uppercase tracking-widest text-accent">
                  Editor's pick
                </div>
                <div className="mt-1 font-display text-xl font-bold">Aurora Wireless</div>
                <div className="text-sm text-muted-foreground">Studio-grade ANC · 40h battery</div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-3xl bg-accent p-5 text-accent-foreground shadow-elegant sm:block">
              <div className="text-4xl font-display font-black">-30%</div>
              <div className="text-xs font-semibold uppercase tracking-widest">Flash sale</div>
            </div>
          </motion.div>
        </div>

        {/* Trust strip */}
        <div className="border-t border-primary-foreground/10 bg-primary/40">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8">
            {[
              [Truck, "Free shipping", "On orders over $100"],
              [Shield, "Secure checkout", "256-bit encryption"],
              [RotateCcw, "30-day returns", "No questions asked"],
              [Sparkles, "Curated by hand", "Editors vet everything"],
            ].map(([Icon, title, sub]) => (
              <div key={title as string} className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{title as string}</div>
                  <div className="text-xs text-primary-foreground/60">{sub as string}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Shop by category"
          title="Find your next favorite thing"
          action={
            <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
              <Link to="/categories">
                All categories <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/shop"
                search={{ category: c.slug } as never}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-cream shadow-soft ring-1 ring-border transition-transform hover:-translate-y-1"
              >
                <img
                  src={c.image_url ?? ""}
                  alt={c.name}
                  className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-primary-foreground">
                  <div className="font-display text-lg font-bold">{c.name}</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-70">Shop now →</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Featured"
          title="Our current obsession"
          action={
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/shop">View all</Link>
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Flash sale */}
      {flash.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-elegant sm:p-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Flash sale · 48 hours
                </p>
                <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
                  Up to 30% off, then it's gone.
                </h2>
              </div>
              <Countdown target={heroTarget} />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {flash.map((p, i) => (
                <div key={p.id} className="rounded-2xl bg-surface p-1 text-ink">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Trending" title="What everyone's adding to cart" />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {trending.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Loved by 200k+" title="Words from the people who show up" />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              q: "The packaging alone made me feel like I was unboxing a gift. Product's brilliant too.",
              n: "Amelia R.",
              r: "Verified buyer · London",
            },
            {
              q: "Fast shipping, easy returns, actually good taste in what they carry. Rare combo.",
              n: "Marcus J.",
              r: "Verified buyer · Brooklyn",
            },
            {
              q: "I've replaced three shopping apps with ShopSphere. Everything just… works.",
              n: "Priya S.",
              r: "Verified buyer · Toronto",
            },
          ].map((t, i) => (
            <motion.div
              key={t.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-border"
            >
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-accent" />
                ))}
              </div>
              <blockquote className="mt-4 font-display text-lg leading-snug tracking-tight">
                "{t.q}"
              </blockquote>
              <div className="mt-6 text-sm">
                <div className="font-semibold">{t.n}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-accent/10 p-10 ring-1 ring-accent/30 sm:p-14">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Newsletter</p>
            <h3 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">
              Get 10% off your first order
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Drops, deals, and one thoughtful editor's note a week. Zero spam.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("You're on the list. Check your inbox for a welcome code.");
                (e.currentTarget as HTMLFormElement).reset();
              }}
              className="mt-6 flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="you@somewhere.com"
                className="h-12 flex-1 rounded-full border border-border bg-surface px-5 text-sm outline-none ring-ring/30 focus:ring-4"
              />
              <Button type="submit" size="lg" className="h-12 rounded-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
