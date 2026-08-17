import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  stock: number;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  category: "",
  category_id: "",
  price: "",
  sale_price: "",
  image_url: "",
  stock: "0",
  sku: "",
  is_active: true,
  is_featured: false,
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);

    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,name,description,category,category_id,price,sale_price,image_url,stock,sku,is_active,is_featured"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("categories")
        .select("id,name,slug")
        .eq("is_active", true)
        .order("name"),
    ]);

    if (productsResult.error) {
      console.error("Products error:", productsResult.error);
      alert(productsResult.error.message);
    } else {
      setProducts((productsResult.data || []) as Product[]);
    }

    if (categoriesResult.error) {
      console.error("Categories error:", categoriesResult.error);
    } else {
      setCategories((categoriesResult.data || []) as Category[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const categoryId = e.target.value;

    const selectedCategory = categories.find(
      (category) => category.id === categoryId
    );

    setForm((prev) => ({
      ...prev,
      category_id: categoryId,
      category: selectedCategory?.name || "",
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      alert("Please enter a valid price.");
      return;
    }

    setSaving(true);

    const productData = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category || null,
      category_id: form.category_id || null,
      price: Number(form.price),
      sale_price:
        form.sale_price && Number(form.sale_price) > 0
          ? Number(form.sale_price)
          : null,
      image_url: form.image_url.trim() || null,
      stock: Number(form.stock) || 0,
      sku: form.sku.trim() || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
    };

    let error = null;

    if (editingId) {
      const result = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from("products")
        .insert(productData);

      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      editingId
        ? "Product updated successfully!"
        : "Product added successfully!"
    );

    resetForm();
    await loadData();
  };

  const editProduct = (product: Product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      category_id: product.category_id || "",
      price: String(product.price ?? ""),
      sale_price:
        product.sale_price !== null
          ? String(product.sale_price)
          : "",
      image_url: product.image_url || "",
      stock: String(product.stock ?? 0),
      sku: product.sku || "",
      is_active: product.is_active,
      is_featured: product.is_featured,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteProduct = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Product deleted successfully.");
    await loadData();
  };

  const activeProducts = products.filter(
    (product) => product.is_active
  ).length;

  const featuredProducts = products.filter(
    (product) => product.is_featured
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            M.S Collection Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your jewellery products, prices and stock.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
        >
          + Add Product
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>
          <h2 className="mt-2 text-3xl font-bold">
            {products.length}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Active Products</p>
          <h2 className="mt-2 text-3xl font-bold">
            {activeProducts}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Featured Products
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {featuredProducts}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Categories</p>
          <h2 className="mt-2 text-3xl font-bold">
            {categories.length}
          </h2>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>

            <button
              onClick={resetForm}
              className="text-xl text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block font-medium">
                Product Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Pearl Drop Earrings"
                className="w-full rounded-xl border px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                SKU
              </label>

              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. MS-EAR-001"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Price (PKR) *
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="2500"
                min="0"
                className="w-full rounded-xl border px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Sale Price (PKR)
              </label>

              <input
                type="number"
                name="sale_price"
                value={form.sale_price}
                onChange={handleChange}
                placeholder="1999"
                min="0"
                className="w-full rounded-xl border px-4 py-3"
              />

              <p className="mt-1 text-xs text-gray-500">
                Leave empty if there is no sale.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Category
              </label>

              <select
                value={form.category_id}
                onChange={handleCategoryChange}
                className="w-full rounded-xl border bg-white px-4 py-3"
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-medium">
                Product Image URL
              </label>

              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your jewellery..."
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div className="flex flex-col gap-5 md:col-span-2 md:flex-row">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-5 w-5"
                />

                <span>Active — show on website</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={form.is_featured}
                  onChange={handleChange}
                  className="h-5 w-5"
                />

                <span>Featured Product</span>
              </label>
            </div>

            <div className="flex gap-3 pt-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-black px-7 py-3 font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border px-7 py-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Products</h2>

          <span className="text-gray-500">
            {products.length} product
            {products.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-500">
              No products added yet.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-black px-6 py-3 text-white"
            >
              + Add Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-4">Product</th>
                  <th className="px-3 py-4">Category</th>
                  <th className="px-3 py-4">Price</th>
                  <th className="px-3 py-4">Stock</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        <div>
                          <p className="font-semibold">
                            {product.name}
                          </p>

                          {product.sku && (
                            <p className="text-xs text-gray-500">
                              SKU: {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      {product.category || "—"}
                    </td>

                    <td className="px-3 py-4">
                      {product.sale_price ? (
                        <>
                          <span className="font-semibold">
                            Rs.{" "}
                            {product.sale_price.toLocaleString()}
                          </span>

                          <span className="block text-sm text-gray-400 line-through">
                            Rs.{" "}
                            {product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold">
                          Rs.{" "}
                          {product.price.toLocaleString()}
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-4">
                      {product.stock}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={
                            product.is_active
                              ? "text-sm text-green-600"
                              : "text-sm text-red-500"
                          }
                        >
                          {product.is_active
                            ? "Active"
                            : "Hidden"}
                        </span>

                        {product.is_featured && (
                          <span className="text-sm">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            editProduct(product)
                          }
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteProduct(product.id)
                          }
                          className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}