import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/products";
import type { Product } from "../types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((error) => {
        console.error("Home products error:", error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container grid min-h-[620px] items-center gap-12 py-16 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.35em] text-champagne">
              M.S Collection
            </p>

            <h1 className="font-display text-5xl leading-tight md:text-7xl">
              Timeless Beauty.
              <br />
              <span className="text-champagne">
                Endless Elegance.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-stone-500">
              Discover refined jewelry designed to make everyday
              moments feel extraordinary.
            </p>

            <div className="mt-8 flex gap-3">
              <Link className="btn btn-dark" to="/shop">
                Shop Collection
              </Link>

              <Link className="btn btn-light" to="/about">
                Our Story
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px]">
            <img
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85"
              className="h-[520px] w-full object-cover"
              alt="M.S Collection jewelry"
            />
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-champagne">
              Curated for you
            </p>

            <h2 className="font-display text-4xl">
              Featured Pieces
            </h2>
          </div>

          <Link to="/shop" className="text-sm underline">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="py-12 text-center text-stone-500">
            Loading products...
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products
              .filter((product) => product.is_featured)
              .slice(0, 6)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  p={product}
                />
              ))}
          </div>
        )}

        {!loading &&
          products.filter((product) => product.is_featured).length ===
            0 && (
            <p className="py-12 text-center text-stone-500">
              No featured products yet.
            </p>
          )}
      </section>

      <section className="mt-12 bg-black py-20 text-white">
        <div className="container text-center">
          <p className="text-xs uppercase tracking-[.35em] text-champagne">
            The M.S promise
          </p>

          <h2 className="mt-4 font-display text-4xl">
            Affordable luxury, beautifully presented.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-stone-300">
            Thoughtful designs, elegant packaging and a shopping
            experience made for you.
          </p>
        </div>
      </section>
    </>
  );
}