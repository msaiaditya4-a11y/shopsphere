import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/order-success/$id")({
  component: OrderSuccess,
  head: () => ({ meta: [{ title: "Order confirmed — ShopSphere" }] }),
});

function OrderSuccess() {
  const { id } = Route.useParams();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent/20 text-accent">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-black tracking-tight">Thank you for your order</h1>
      <p className="mt-3 text-muted-foreground">
        Order <span className="font-mono text-ink">#{id.slice(0, 8)}</span> is confirmed. A receipt
        is on the way to your inbox.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="rounded-full">
          <Link to="/orders">View my orders</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link to="/shop">Keep shopping</Link>
        </Button>
      </div>
    </div>
  );
}
