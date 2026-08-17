import { supabase } from "../lib/supabase";
import type { Product } from "../types";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      category,
      price,
      sale_price,
      image_url,
      stock,
      is_featured
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Products fetch error:", error);
    return [];
  }

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.id,
    description: p.description ?? "",
    price: Number(p.price),
    sale_price:
      p.sale_price == null ? null : Number(p.sale_price),
    image: p.image_url ?? "",
    category: p.category ?? "Jewelry",
    stock_quantity: Number(p.stock ?? 0),
    is_featured: Boolean(p.is_featured),
    is_new: false,
  }));
}