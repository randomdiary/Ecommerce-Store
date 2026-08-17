import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/products";
import type { Product } from "../types";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const cats = [
    "All",
    ...Array.from(
      new Set(products.map((p) => p.category))
    ),
  ];

  const list = useMemo(() => {
    return products.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        p.name.toLowerCase().includes(q.toLowerCase())
    );
  }, [products, q, cat]);

  return (
    <section className="container py-14">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-champagne">
          The collection
        </p>

        <h1 className="font-display text-5xl">
          Shop Jewelry
        </h1>
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          className="input"
          placeholder="Search jewelry..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="input md:w-56"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="py-20 text-center text-stone-500">
          Loading products...
        </p>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
              />
            ))}
          </div>

          {!list.length && (
            <p className="py-20 text-center text-stone-500">
              No products found.
            </p>
          )}
        </>
      )}
    </section>
  );
}