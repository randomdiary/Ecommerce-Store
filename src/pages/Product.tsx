import { Link, useParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../store/cart";
import { getProducts } from "../services/products";
import type { Product } from "../types";

export default function Product() {
  const { id } = useParams();
  const add = useCart((s) => s.add);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((products) => {
        const found = products.find((item) => item.id === id);
        setProduct(found ?? null);
      })
      .catch((error) => {
        console.error("Product fetch error:", error);
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const number = import.meta.env.VITE_WHATSAPP_NUMBER;

  if (loading) {
    return (
      <section className="container py-20 text-center">
        <p className="text-stone-500">Loading product...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container py-20 text-center">
        <h1 className="font-display text-4xl">
          Product not found
        </h1>

        <Link
          to="/shop"
          className="mt-6 inline-block underline"
        >
          ← Back to shop
        </Link>
      </section>
    );
  }

  const wa = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(
        `Hi M.S Collection, I am interested in ${product.name}.`
      )}`
    : "#";

  const currentPrice = product.sale_price ?? product.price;

  return (
    <section className="container py-14">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-stone-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[400px] items-center justify-center text-stone-400">
              No image available
            </div>
          )}
        </div>

        <div className="self-center">
          <p className="text-xs uppercase tracking-widest text-champagne">
            {product.category}
          </p>

          <h1 className="mt-2 font-display text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 text-2xl font-semibold">
            Rs. {currentPrice.toLocaleString()}
          </div>

          {product.sale_price && (
            <div className="mt-1 text-sm text-stone-400 line-through">
              Rs. {product.price.toLocaleString()}
            </div>
          )}

          <p className="mt-6 leading-7 text-stone-500">
            {product.description}
          </p>

          <p className="mt-5 text-sm">
            {product.stock_quantity > 0
              ? `${product.stock_quantity} available`
              : "Out of stock"}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              disabled={product.stock_quantity <= 0}
              className="btn btn-dark disabled:opacity-40"
              onClick={() => add(product)}
            >
              <ShoppingBag size={18} />
              Add to cart
            </button>

            {number && (
              <a
                className="btn btn-light"
                href={wa}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp enquiry
              </a>
            )}
          </div>

          <Link
            className="mt-8 inline-block text-sm underline"
            to="/shop"
          >
            ← Back to shop
          </Link>
        </div>
      </div>
    </section>
  );
}