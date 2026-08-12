import { supabase } from "../lib/supabase";
import { products as demoProducts } from "../data/products";
import type { Product } from "../types";

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return demoProducts;
  const { data, error } = await supabase.from("products").select("*, categories(name), product_images(url,is_primary)").eq("is_active", true);
  if (error || !data?.length) return demoProducts;
  return data.map((p:any)=>({
    id:p.id, name:p.name, slug:p.slug, description:p.description ?? "",
    price:Number(p.price), sale_price:p.sale_price == null ? null : Number(p.sale_price),
    image:p.product_images?.find((x:any)=>x.is_primary)?.url ?? p.product_images?.[0]?.url ?? demoProducts[0].image,
    category:p.categories?.name ?? "Jewelry", stock_quantity:p.stock_quantity ?? 0,
    is_featured:p.is_featured, is_new:p.is_new
  }));
}