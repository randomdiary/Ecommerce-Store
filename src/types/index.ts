export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price?: number | null;
  image: string;
  category: string;
  stock_quantity: number;
  is_featured?: boolean;
  is_new?: boolean;
};