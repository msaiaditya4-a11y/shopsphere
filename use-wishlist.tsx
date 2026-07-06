import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

type WishCtx = {
  ids: string[];
  toggle: (id: string, title?: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

const Ctx = createContext<WishCtx | null>(null);
const KEY = "shopsphere_wishlist_v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids, hydrated]);

  const toggle = (id: string, title?: string) => {
    setIds((cur) => {
      if (cur.includes(id)) {
        toast(`${title ?? "Item"} removed from wishlist`);
        return cur.filter((x) => x !== id);
      }
      toast.success(`${title ?? "Item"} saved to wishlist`);
      return [...cur, id];
    });
  };

  return (
    <Ctx.Provider value={{ ids, toggle, has: (id) => ids.includes(id), clear: () => setIds([]) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
};
