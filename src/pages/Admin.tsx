import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  city: string;
  total: number;
  status: string;
  created_at: string;
};

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);

    const [productsResult, ordersResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,name,price,sale_price,image_url,stock,is_active"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("orders")
        .select(
          "id,order_number,customer_name,phone,city,total,status,created_at"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (productsResult.error) {
      console.error(
        "Products error:",
        productsResult.error
      );
    } else {
      setProducts(productsResult.data || []);
    }

    if (ordersResult.error) {
      console.error(
        "Orders error:",
        ordersResult.error
      );
    } else {
      setOrders(ordersResult.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateOrderStatus = async (
    id: string,
    status: string
  ) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadDashboard();
  };

  const deleteOrder = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadDashboard();
  };

  const activeProducts = products.filter(
    (p) => p.is_active
  ).length;

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  return (
    <section className="container py-14">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-champagne">
          Management
        </p>

        <h1 className="font-display text-5xl">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-stone-500">
          Manage your M.S Collection products and orders.
        </p>
      </div>

      {loading ? (
        <p className="py-20 text-center text-stone-500">
          Loading dashboard...
        </p>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid gap-5 md:grid-cols-4">
            <div className="card p-6">
              <p className="text-sm text-stone-500">
                Total Products
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {products.length}
              </p>
            </div>

            <div className="card p-6">
              <p className="text-sm text-stone-500">
                Active Products
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {activeProducts}
              </p>
            </div>

            <div className="card p-6">
              <p className="text-sm text-stone-500">
                Orders
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {orders.length}
              </p>
            </div>

            <div className="card p-6">
              <p className="text-sm text-stone-500">
                Total Sales
              </p>

              <p className="mt-2 text-3xl font-semibold">
                Rs. {totalSales.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Orders */}
          <div className="card mt-10 overflow-hidden">
            <div className="border-b p-6">
              <h2 className="font-display text-3xl">
                Customer Orders
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="p-10 text-center text-stone-500">
                No orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-stone-50">
                      <th className="px-4 py-4">
                        Order
                      </th>

                      <th className="px-4 py-4">
                        Customer
                      </th>

                      <th className="px-4 py-4">
                        Phone
                      </th>

                      <th className="px-4 py-4">
                        City
                      </th>

                      <th className="px-4 py-4">
                        Total
                      </th>

                      <th className="px-4 py-4">
                        Status
                      </th>

                      <th className="px-4 py-4">
                        Date
                      </th>

                      <th className="px-4 py-4">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-4 py-4 font-semibold">
                          {order.order_number}
                        </td>

                        <td className="px-4 py-4">
                          {order.customer_name}
                        </td>

                        <td className="px-4 py-4">
                          {order.phone}
                        </td>

                        <td className="px-4 py-4">
                          {order.city}
                        </td>

                        <td className="px-4 py-4 font-semibold">
                          Rs.{" "}
                          {Number(
                            order.total
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(
                                order.id,
                                e.target.value
                              )
                            }
                            className="rounded-lg border px-3 py-2"
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="processing">
                              Processing
                            </option>

                            <option value="shipped">
                              Shipped
                            </option>

                            <option value="delivered">
                              Delivered
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>
                          </select>
                        </td>

                        <td className="px-4 py-4 text-sm text-stone-500">
                          {new Date(
                            order.created_at
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() =>
                              deleteOrder(order.id)
                            }
                            className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}