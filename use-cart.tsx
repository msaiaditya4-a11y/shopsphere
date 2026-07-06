import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/queries";
import { effectivePrice } from "@/lib/format";

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartCtx = {
  items: CartLine[];
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  applyCoupon: (code: string) => void;
  coupon: string | null;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
};

const CartContext = createContext<CartCtx | null>(null);
const STORAGE_KEY = "shopsphere_cart_v1";
const COUPON_KEY = "shopsphere_coupon_v1";

const COUPONS: Record<string, number> = {
  WELCOME10: 0.1,
  SPHERE20: 0.2,
  FLASH25: 0.25,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const c = localStorage.getItem(COUPON_KEY);
      if (c) setCoupon(c);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (coupon) localStorage.setItem(COUPON_KEY, coupon);
    else localStorage.removeItem(COUPON_KEY);
  }, [coupon, hydrated]);

  const add = (p: Product, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((l) => l.product.id === p.id);
      if (found) {
        return cur.map((l) =>
          l.product.id === p.id ? { ...l, quantity: Math.min(p.stock || 99, l.quantity + qty) } : l,
        );
      }
      return [...cur, { product: p, quantity: qty }];
    });
    toast.success(`${p.title} added to cart`);
  };

  const remove = (id: string) => setItems((cur) => cur.filter((l) => l.product.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((cur) =>
      cur
        .map((l) => (l.product.id === id ? { ...l, quantity: Math.max(1, qty) } : l))
        .filter((l) => l.quantity > 0),
    );
  const clear = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const key = code.trim().toUpperCase();
    if (!key) {
      setCoupon(null);
      return;
    }
    if (COUPONS[key]) {
      setCoupon(key);
      toast.success(`Coupon ${key} applied — ${Math.round(COUPONS[key] * 100)}% off`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const derived = useMemo(() => {
    const subtotal = items.reduce(
      (s, l) => s + effectivePrice(l.product.price, l.product.discount_price) * l.quantity,
      0,
    );
    const count = items.reduce((s, l) => s + l.quantity, 0);
    const discountRate = coupon ? COUPONS[coupon] || 0 : 0;
    const discount = subtotal * discountRate;
    const shipping = subtotal > 0 && subtotal - discount < 100 ? 12 : 0;
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + shipping + tax;
    return { subtotal, count, discount, shipping, tax, total };
  }, [items, coupon]);

  return (
    <CartContext.Provider
      value={{ items, add, remove, setQty, clear, applyCoupon, coupon, ...derived }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
