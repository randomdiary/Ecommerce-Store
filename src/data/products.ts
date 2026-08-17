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
      is_featured,
      is_active,
      created_at
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Products fetch error:", error);
    throw error;
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: "",
    description: product.description ?? "",
    price: Number(product.price ?? 0),
    sale_price:
      product.sale_price == null
        ? null
        : Number(product.sale_price),
    image: product.image_url ?? "",
    category: product.category ?? "Jewelry",
    stock_quantity: Number(product.stock ?? 0),
    is_featured: Boolean(product.is_featured),
    is_new: false,
  }));
}