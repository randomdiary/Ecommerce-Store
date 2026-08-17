import { useState } from "react";
import { useCart } from "../store/cart";
import { supabase } from "../lib/supabase";

export default function Checkout() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total);
  const clear = useCart((s) => s.clear);

  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    province: "",
    postalCode: "",
    address: "",
    paymentMethod: "Cash on Delivery",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const placeOrder = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const orderTotal = total();

      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: form.fullName,
          email: form.email || null,
          phone: form.phone,
          shipping_address: form.address,
          city: form.city,
          province: form.province || null,
          postal_code: form.postalCode || null,
          subtotal: orderTotal,
          shipping_fee: 0,
          discount: 0,
          total: orderTotal,
          payment_method: form.paymentMethod,
          status: "pending",
        })
        .select("id, order_number")
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        alert(`Order could not be placed: ${orderError.message}`);
        return;
      }

      // 2. Create order items
      const orderItems = items.map((item: any) => {
        const price = Number(
          item.sale_price ?? item.price
        );

        const quantity = Number(
          item.quantity ?? 1
        );

        return {
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity,
          unit_price: price,
          total_price: price * quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error(
          "Order items error:",
          itemsError
        );

        // Remove incomplete order if order items fail
        await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);

        alert(
          `Order items could not be saved: ${itemsError.message}`
        );

        return;
      }

      // 3. Clear cart only after everything succeeds
      clear();

      setOrderNumber(order.order_number);
      setDone(true);
    } catch (error) {
      console.error("Unexpected checkout error:", error);

      alert(
        "Something went wrong while placing your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <section className="container py-24 text-center">
        <h1 className="font-display text-5xl">
          Order received ✨
        </h1>

        <p className="mt-4 text-stone-500">
          Thank you for shopping with M.S Collection.
        </p>

        {orderNumber && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-stone-100 p-6">
            <p className="text-sm text-stone-500">
              Your Order Number
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {orderNumber}
            </p>

            <p className="mt-4 text-sm text-stone-500">
              Please keep this order number for your records.
            </p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="container py-14">
      <h1 className="font-display text-5xl">
        Checkout
      </h1>

      {!items.length ? (
        <p className="py-20 text-stone-500">
          Your cart is empty.
        </p>
      ) : (
        <form
          className="mt-10 grid gap-10 md:grid-cols-[1fr_360px]"
          onSubmit={placeOrder}
        >
          <div className="card p-6">
            <h2 className="font-display text-2xl">
              Delivery details
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="input"
                placeholder="Full name"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="Email"
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="input"
                placeholder="Phone"
              />

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="input"
                placeholder="City"
              />

              <input
                name="province"
                value={form.province}
                onChange={handleChange}
                className="input"
                placeholder="Province"
              />

              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className="input"
                placeholder="Postal code"
              />

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="input md:col-span-2"
                rows={4}
                placeholder="Complete address"
              />

              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="input md:col-span-2"
              >
                <option>
                  Cash on Delivery
                </option>

                <option>
                  Bank Transfer
                </option>

                <option>
                  Easypaisa / JazzCash
                </option>
              </select>
            </div>
          </div>

          <aside className="card h-fit p-6">
            <h2 className="font-display text-2xl">
              Order total
            </h2>

            <p className="mt-5 text-2xl font-semibold">
              Rs. {total().toLocaleString()}
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark mt-6 w-full disabled:opacity-50"
            >
              {loading
                ? "Placing order..."
                : "Place order"}
            </button>
          </aside>
        </form>
      )}
    </section>
  );
}