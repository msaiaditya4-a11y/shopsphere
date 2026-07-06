import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  brand: string | null;
  category_id: string | null;
  price: number;
  discount_price: number | null;
  images: string[];
  stock: number;
  rating: number;
  reviews_count: number;
  specs: Record<string, unknown> | null;
  featured: boolean;
  trending: boolean;
  flash_sale: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as unknown as Product) ?? null;
}
