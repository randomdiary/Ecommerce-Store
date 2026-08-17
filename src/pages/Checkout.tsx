import { useState } from "react";
import { useCart } from "../store/cart";
import { supabase } from "../lib/supabase";

export default function Checkout() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total);
  const clear = useCart((s) => s.clear);

  const subtotal = total();
  const deliveryCharge = 250 as number;
  const orderTotal = subtotal + deliveryCharge;

  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orderId, setOrderId] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    setSaving(true);

    try {
      
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: form.fullName.trim(),
          customer_email: form.email.trim() || null,
          customer_phone: form.phone.trim(),
          city: form.city.trim() || null,
          province: form.province.trim() || null,
          postal_code: form.postalCode.trim() || null,
          address: form.address.trim(),
          payment_method: form.paymentMethod,
          subtotal: subtotal,
          delivery_charge: deliveryCharge,
          total: orderTotal,
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        alert(orderError.message);
        return;
      }

      if (!order) {
        alert("Order could not be created.");
        return;
      }

      // 2. Save order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.sale_price ?? item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);

        // Remove incomplete order
        await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);

        alert(itemsError.message);
        return;
      }

      // 3. Clear cart
      clear();

      // 4. Show success
      setOrderId(order.id);
      setDone(true);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong while placing your order.");
    } finally {
      setSaving(false);
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

        <p className="mt-3 text-sm text-stone-500">
          Your order has been successfully placed.
        </p>

        {orderId && (
          <p className="mt-4 text-sm">
            Order ID:{" "}
            <span className="font-semibold">
              {orderId}
            </span>
          </p>
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
          onSubmit={handleSubmit}
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
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="input"
                placeholder="Phone number"
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
                placeholder="Complete delivery address"
              />

              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="input md:col-span-2"
              >
                <option value="Cash on Delivery">
                  Cash on Delivery
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>

                <option value="Easypaisa / JazzCash">
                  Easypaisa / JazzCash
                </option>
              </select>
            </div>
          </div>

          <aside className="card h-fit p-6">
            <h2 className="font-display text-2xl">
              Order summary
            </h2>

            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span className="font-medium">
                    Rs.{" "}
                    {(
                      (item.sale_price ?? item.price) *
                      item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-5 border-t" />

<div className="space-y-3">
  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>Rs. {subtotal.toLocaleString()}</span>
  </div>

  <div className="flex justify-between">
    <span>Delivery</span>
    <span>
      Rs. {deliveryCharge.toLocaleString()}
    </span>
    </div>

         <div className="border-t pt-3 flex justify-between">
         <span className="font-semibold">Total</span>

         <strong className="text-xl">
            Rs. {orderTotal.toLocaleString()}
         </strong>
        </div>
       </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-dark mt-6 w-full disabled:opacity-50"
            >
              {saving ? "Placing order..." : "Place order"}
            </button>
          </aside>
        </form>
      )}
    </section>
  );
}
