import { supabase } from "./supabase";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  image: string;
  category: string;
  stock: number;
  is_featured: boolean;
  is_new: boolean;
};

export async function fetchProducts(): Promise<StoreProduct[]> {
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
    throw error;
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    price: Number(product.price),
    sale_price:
      product.sale_price === null
        ? null
        : Number(product.sale_price),
    image:
      product.image_url ||
      (product.images?.length ? product.images[0] : ""),
    category: product.category ?? "Jewelry",
    stock: Number(product.stock ?? 0),
    is_featured: Boolean(product.is_featured),
    is_new: Boolean(product.is_new),
  }));
}