import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — ShopSphere" },
      { name: "description", content: "How ShopSphere came to be, and why we care about the objects we sell." },
    ],
  }),
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our story</p>
      <h1 className="mt-2 font-display text-5xl font-black tracking-tight">
        We started ShopSphere because online shopping had lost the plot.
      </h1>
      <div className="prose prose-lg mt-8 max-w-none text-ink-soft">
        <p>
          Endless scroll. Interchangeable checkouts. Products picked by algorithms trained on other
          algorithms. We wanted a store that felt like walking into a small shop run by people with
          taste — where every item was chosen for a reason and someone could tell you why.
        </p>
        <p>
          Today ShopSphere carries hundreds of products across audio, wearables, cameras, laptops,
          phones, and home. Every category is edited by a human. Every product is tested against a
          simple bar: would we buy it for someone we love?
        </p>
        <p>
          We ship free over $100, offer 30-day returns without a fuss, and stand behind everything
          we sell with a two-year warranty. If it doesn't earn its keep, we don't carry it.
        </p>
      </div>
    </div>
  );
}
