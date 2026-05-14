import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder, initiatePayment } from "../api";
import SafeImg from "../components/SafeImg";

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "" });
  const [status, setStatus] = useState(""); // "" | "sending" | "success" | "error"
  const [msg, setMsg] = useState("");

  if (items.length === 0 && status !== "success") {
    return (
      <div className="pt-32 pb-20 min-h-screen text-center">
        <div className="max-w-md mx-auto px-6">
          <h1 className="font-serif text-3xl text-charcoal mb-3">Nothing to Checkout</h1>
          <p className="text-sm text-charcoal/50 mb-8">Add items to your cart first.</p>
          <Link to="/shop" className="btn-primary inline-block">Shop Now</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) { setMsg("Please enter your name"); return; }
    if (!form.email) { setMsg("Please enter your email address"); return; }
    if (!form.location) { setMsg("Please enter your delivery location"); return; }

    setStatus("sending");
    setMsg("");

    try {
      const nameParts = form.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const orderItems = items.map((item) => ({
        id: item.id, name: item.name, price: item.price,
        qty: item.qty, color: item.color || "", size: item.size || "",
      }));

      const order = await createOrder({
        customer: { name: form.name, phone: form.phone, email: form.email, location: form.location },
        items: orderItems,
        total: cartTotal,
        paymentMethod: "pesapal",
      });

      if (!order?.id) {
        setStatus("error");
        setMsg("Could not create your order. Please try again.");
        return;
      }

      const payment = await initiatePayment({
        orderId: String(order.id),
        amount: cartTotal,
        currency: "KES",
        description: `Payment for Wangaré Luxe order #${order.id}`,
        customerEmail: form.email,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: form.phone || "",
      });

      if (!payment?.success || !payment?.data?.redirectUrl) {
        setStatus("error");
        const detail = payment?.debug?.message || payment?.error || "unknown";
        setMsg(`Payment service error: ${detail}`);
        console.error("[checkout] initiate failed", payment);
        return;
      }

      clearCart();
      window.location.href = payment.data.redirectUrl;
    } catch {
      setStatus("error");
      setMsg("Could not place your order. Please try again in a moment.");
    }
  };

  if (status === "success") {
    return (
      <div className="pt-32 pb-20 min-h-screen text-center">
        <div className="max-w-md mx-auto px-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-charcoal mb-3">Order Placed!</h1>
          <p className="text-sm text-charcoal/50 mb-2">{msg}</p>
          <p className="text-xs text-charcoal/40 mb-8">
            We've been notified and will prepare your order. Thank you for shopping with Wangaré Luxe.
          </p>
          <Link to="/shop" className="btn-primary inline-block">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-12 animate-fade-in">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 animate-fade-in">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-2">Full Name</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange}
                className="w-full bg-transparent border border-charcoal/20 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="Jane Wangari" />
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-2">Email Address</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange}
                className="w-full bg-transparent border border-charcoal/20 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="jane@example.com" />
              <p className="text-xs text-charcoal/30 mt-1.5">Used for payment confirmation</p>
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-2">Phone Number <span className="normal-case text-charcoal/30">(optional)</span></label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                className="w-full bg-transparent border border-charcoal/20 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="0712 345 678" />
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-2">Delivery Location</label>
              <input type="text" name="location" required value={form.location} onChange={handleChange}
                className="w-full bg-transparent border border-charcoal/20 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="Nairobi, Westlands" />
            </div>

            {/* Payment info */}
            <div className="border border-charcoal/10 p-5 mt-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-700">PP</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Pay with Pesapal</p>
                  <p className="text-xs text-charcoal/40">M-Pesa, Visa, Mastercard & more</p>
                </div>
              </div>
              <p className="text-xs text-charcoal/40 leading-relaxed">
                You'll be redirected to Pesapal's secure payment page to complete your purchase. Supports M-Pesa, cards, and other methods.
              </p>
            </div>

            {/* Status */}
            {msg && (
              <div className={`p-4 text-sm rounded ${
                status === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}>
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className={`btn-gold w-full mt-4 flex items-center justify-center gap-2 ${
                status === "sending" ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {status === "sending" && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {status === "sending" ? "Preparing Payment..." : `Pay KSh ${cartTotal.toLocaleString()}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2 animate-fade-in animate-fade-in-delay-2">
            <div className="bg-white/50 border border-beige/30 p-6 sticky top-28">
              <h2 className="font-serif text-lg text-charcoal mb-6">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.cartKey} className="flex gap-3">
                    <div className="w-14 h-16 flex-shrink-0 bg-cream-dark overflow-hidden">
                      <SafeImg src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex justify-between">
                      <div>
                        <p className="text-sm text-charcoal">{item.name}</p>
                        {item.color && <p className="text-xs text-charcoal/40">{item.color}</p>}
                        {item.size && <p className="text-xs text-charcoal/40">Size: {item.size}</p>}
                        <p className="text-xs text-charcoal/40">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm text-charcoal">KSh {(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-beige/50 flex justify-between">
                <span className="text-sm tracking-wider uppercase text-charcoal/60">Total</span>
                <span className="font-serif text-xl text-charcoal">KSh {cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
