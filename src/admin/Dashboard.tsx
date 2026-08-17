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
  is_new: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  category_id: "",
  price: "",
  sale_price: "",
  image_url: "",
  stock: "0",
  sku: "",
  is_active: true,
  is_featured: false,
  is_new: false,
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
          "id,name,description,category,category_id,price,sale_price,image_url,stock,sku,is_active,is_featured,is_new"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("categories")
        .select("id,name,slug")
        .eq("is_active", true)
        .order("name"),
    ]);

    if (productsResult.error) {
      console.error(productsResult.error);
      alert(productsResult.error.message);
    } else {
      setProducts((productsResult.data ?? []) as Product[]);
    }

    if (categoriesResult.error) {
      console.error(categoriesResult.error);
    } else {
      setCategories((categoriesResult.data ?? []) as Category[]);
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
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

    const selectedCategory = categories.find(
      (category) => category.id === form.category_id
    );

    const productData = {
      name: form.name.trim(),
      slug:
        form.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        (editingId ? "" : `-${Date.now()}`),

      description: form.description.trim() || null,

      category_id: form.category_id || null,
      category: selectedCategory?.name || null,

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
      is_new: form.is_new,
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
      is_new: product.is_new,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteProduct = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this product?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Product deleted successfully.");
    await loadData();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            M.S Collection Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Manage products, prices and stock.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold"
        >
          + Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500">Total Products</p>
          <p className="text-3xl font-bold mt-2">
            {products.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500">Active Products</p>
          <p className="text-3xl font-bold mt-2">
            {products.filter((p) => p.is_active).length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500">Featured Products</p>
          <p className="text-3xl font-bold mt-2">
            {products.filter((p) => p.is_featured).length}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>

            <button
              onClick={resetForm}
              className="text-gray-500 text-xl"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              className="border rounded-xl px-4 py-3"
              required
            />

            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="SKU"
              className="border rounded-xl px-4 py-3"
            />

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price (PKR)"
              className="border rounded-xl px-4 py-3"
              min="0"
              required
            />

            <input
              type="number"
              name="sale_price"
              value={form.sale_price}
              onChange={handleChange}
              placeholder="Sale Price (PKR)"
              className="border rounded-xl px-4 py-3"
              min="0"
            />

            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="border rounded-xl px-4 py-3"
              min="0"
            />

            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3 bg-white"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="Product Image URL"
              className="border rounded-xl px-4 py-3 md:col-span-2"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product Description"
              rows={4}
              className="border rounded-xl px-4 py-3 md:col-span-2"
            />

            <div className="flex gap-6 md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                Active
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={form.is_featured}
                  onChange={handleChange}
                />
                Featured
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_new"
                  checked={form.is_new}
                  onChange={handleChange}
                />
                New
              </label>
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white px-7 py-3 rounded-xl font-semibold disabled:opacity-50"
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
                className="border px-7 py-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">
          Products
        </h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">
            No products added yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-4">Product</th>
                  <th className="py-4">Price</th>
                  <th className="py