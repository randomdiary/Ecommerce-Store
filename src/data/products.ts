import { supabase } from "../lib/supabase";
import type { Product } from "../types";

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), product_images(url,is_primary)")
    .eq("is_active", true);

  if (error || !data) return [];

  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    price: Number(p.price),
    sale_price: p.sale_price == null ? null : Number(p.sale_price),
    image:
      p.product_images?.find((x: any) => x.is_primary)?.url ??
      p.product_images?.[0]?.url ??
      "",
    category: p.categories?.name ?? "Jewelry",
    stock_quantity: p.stock_quantity ?? 0,
    is_featured: p.is_featured ?? false,
    is_new: p.is_new ?? false,
  }));
}