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

  return (data ?? []).map((product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    price: Number(product.price),
    sale_price:
      product.sale_price == null
        ? null
        : Number(product.sale_price),
    image:
      product.image_url ||
      (Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : ""),
    category: product.category ?? "Jewelry",
    stock_quantity: Number(product.stock ?? 0),
    is_featured: Boolean(product.is_featured),
    is_new: Boolean(product.is_new),
  }));
}