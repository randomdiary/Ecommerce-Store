import { supabase } from "../lib/supabase";
import type { Product } from "../types";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      price,
      sale_price,
      image_url,
      images,
      category,
      stock,
      is_featured,
      is_new
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Products fetch error:", error);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    price: Number(p.price),
    sale_price:
      p.sale_price == null ? null : Number(p.sale_price),
    image:
      p.image_url ||
      (Array.isArray(p.images) && p.images.length > 0
        ? p.images[0]
        : ""),
    category: p.category ?? "Jewelry",
    stock_quantity: Number(p.stock ?? 0),
    is_featured: Boolean(p.is_featured),
    is_new: Boolean(p.is_new),
  }));
}