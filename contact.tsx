import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — ShopSphere" },
      { name: "description", content: "Get in touch with the ShopSphere team." },
    ],
  }),
});

function Contact() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Contact</p>
          <h1 className="mt-2 font-display text-5xl font-black tracking-tight">Say hello</h1>
          <p className="mt-4 text-muted-foreground">
            We reply to every email within one business day. For urgent order questions, chat is
            fastest.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { Icon: Mail, label: "Email", v: "hello@shopsphere.co" },
              { Icon: MessageCircle, label: "Live chat", v: "Mon–Fri · 9am–6pm ET" },
              { Icon: Phone, label: "Phone", v: "+1 (555) 010-4477" },
            ].map(({ Icon, label, v }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </div>
                  <div className="font-medium">{v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent. We'll get back to you shortly.");
            (e.currentTarget as HTMLFormElement).reset();
          }}
          className="rounded-3xl bg-surface p-8 shadow-elegant ring-1 ring-border"
        >
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input required className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required className="mt-1" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea rows={5} required className="mt-1" />
            </div>
            <Button type="submit" size="lg" className="w-full rounded-full h-12">
              Send message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
