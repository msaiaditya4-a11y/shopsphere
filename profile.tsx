import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Profile — ShopSphere" }] }),
});

function Profile() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        const a = (data.address ?? {}) as { line1?: string; city?: string; zip?: string; country?: string };
        setAddress(a.line1 ?? "");
        setCity(a.city ?? "");
        setZip(a.zip ?? "");
        setCountry(a.country ?? "");
      }
    })();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name, phone, address: { line1: address, city, zip, country } })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-black tracking-tight">Profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>

      <form onSubmit={save} className="mt-8 space-y-4 rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-border">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>ZIP</Label>
            <Input value={zip} onChange={(e) => setZip(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Country</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="rounded-full">
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => signOut()} className="rounded-full">
            Sign out
          </Button>
        </div>
      </form>
    </div>
  );
}
