export const formatPrice = (n: number | string | null | undefined) => {
  const value = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

export const num = (n: number | string | null | undefined): number => {
  if (n == null) return 0;
  return typeof n === "string" ? parseFloat(n) || 0 : n;
};

export const effectivePrice = (price: number | string, discount?: number | string | null) => {
  const p = num(price);
  const d = num(discount);
  return d && d < p ? d : p;
};

export const discountPercent = (price: number | string, discount?: number | string | null) => {
  const p = num(price);
  const d = num(discount);
  if (!d || d >= p) return 0;
  return Math.round(((p - d) / p) * 100);
};
