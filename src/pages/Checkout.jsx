import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { initiateMpesa, queryMpesaStatus, createOrder } from "../api";

const OWNER_PHONE = "254747622490";

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", location: "" });
  const [status, setStatus] = useState(""); // "" | "sending" | "waiting" | "success" | "error"
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

  // Build the owner WhatsApp notification message
  function buildOwnerMessage(orderDetails) {
    const itemsList = (orderDetails || items)
      .map((item) => `  - ${item.name}${item.color ? ` (${item.color})` : ""}${item.size ? ` Size ${item.size}` : ""} x${item.qty} = KSh ${(item.price * item.qty).toLocaleString()}`)
      .join("\n");

    return encodeURIComponent(
      `NEW ORDER PAID via M-PESA\n\n` +
      `Customer: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      `Delivery: ${form.location}\n\n` +
      `Items:\n${itemsList}\n\n` +
      `Total: KSh ${cartTotal.toLocaleString()}`
    );
  }

  // Save order + notify owner
  const placeOrder = async (paymentStatus) => {
    const orderItems = items.map((item) => ({
      id: item.id, name: item.name, price: item.price,
      qty: item.qty, color: item.color || "", size: item.size || "",
    }));
    await createOrder({
      customer: { name: form.name, phone: form.phone, location: form.location },
      items: orderItems,
      total: cartTotal,
      paymentMethod: "mpesa",
    });
    // WhatsApp notification to owner
    const ownerMsg = buildOwnerMessage(items);
    window.open(`https://wa.me/${OWNER_PHONE}?text=${ownerMsg}`, "_blank");
    clearCart();
    setStatus("success");
    setMsg(paymentStatus === "confirmed"
      ? "Payment successful! Your order has been placed."
      : "Your order has been placed. Payment is being processed.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) { setMsg("Please enter your name"); return; }
    if (!form.phone) { setMsg("Please enter your phone number"); return; }
    if (!form.location) { setMsg("Please enter delivery location"); return; }

    setStatus("sending");
    setMsg("");

    try {
      const orderId = `ORD-${Date.now()}`;
      const result = await initiateMpesa(form.phone, cartTotal, orderId);

      if (result.success) {
        setStatus("waiting");
        setMsg("M-PESA prompt sent! Check your phone and enter your PIN to pay.");

        // Poll payment status
        const checkoutRequestId = result.checkoutRequestId;
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const query = await queryMpesaStatus(checkoutRequestId);
            if (query.ResultCode === "0" || query.ResultCode === 0) {
              clearInterval(poll);
              await placeOrder("confirmed");
            } else if (attempts >= 12) {
              clearInterval(poll);
              await placeOrder("processing");
            }
          } catch {
            if (attempts >= 12) {
              clearInterval(poll);
              await placeOrder("processing");
            }
          }
        }, 5000);
      } else {
        setStatus("error");
        setMsg("Could not send M-PESA prompt. Please check your phone number and try again.");
      }
    } catch {
      setStatus("error");
      setMsg("Payment service is temporarily unavailable. Please try again in a moment.");
    }
  };

  // Success state
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
              <label className="block text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-2">M-PESA Phone Number</label>
              <input type="tel" name="phone" required value={form.phone} onChange={handleChange}
                className="w-full bg-transparent border border-charcoal/20 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="0712 345 678" />
              <p className="text-xs text-charcoal/30 mt-1.5">You'll receive an M-PESA prompt on this number</p>
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
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-green-700">M</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Pay with M-PESA</p>
                  <p className="text-xs text-charcoal/40">Lipa na M-PESA - instant & secure</p>
                </div>
              </div>
              <p className="text-xs text-charcoal/40 leading-relaxed">
                An M-PESA payment prompt will be sent to your phone. Enter your PIN to complete the payment.
              </p>
            </div>

            {/* Status */}
            {msg && (
              <div className={`p-4 text-sm rounded ${
                status === "waiting" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                status === "error" ? "bg-red-50 text-red-700 border border-red-200" :
                "bg-green-50 text-green-700 border border-green-200"
              }`}>
                {status === "waiting" && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span>{msg}</span>
                  </div>
                )}
                {status !== "waiting" && msg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending" || status === "waiting"}
              className={`btn-gold w-full mt-4 flex items-center justify-center gap-2 ${
                (status === "sending" || status === "waiting") ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {status === "sending" && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {status === "sending" ? "Sending Prompt..." :
               status === "waiting" ? "Waiting for Payment..." :
               `Pay KSh ${cartTotal.toLocaleString()} with M-PESA`}
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
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
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
