import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", location: "" });

  if (items.length === 0) {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const orderLines = items
      .map((item) => `${item.name} x${item.qty} = KSh ${(item.price * item.qty).toLocaleString()}`)
      .join("%0A");

    const msg = encodeURIComponent(
      `Hello, I'd like to place an order:\n\n` +
      items.map((item) => `${item.name}${item.color ? ` (${item.color})` : ""} x${item.qty} = KSh ${(item.price * item.qty).toLocaleString()}`).join("\n") +
      `\n\nTotal: KSh ${cartTotal.toLocaleString()}` +
      `\n\nName: ${form.name}` +
      `\nPhone: ${form.phone}` +
      `\nDelivery: ${form.location}`
    );

    clearCart();
    window.open(`https://wa.me/254747622490?text=${msg}`, "_blank");
  };

  return (
    <div className="pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-12 animate-fade-in">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 animate-fade-in">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full bg-transparent border border-charcoal/20 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="Jane Wangari"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-transparent border border-charcoal/20 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="+254 7XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-2">
                Delivery Location
              </label>
              <input
                type="text"
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                className="w-full bg-transparent border border-charcoal/20 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="Nairobi, Westlands"
              />
            </div>

            <button type="submit" className="btn-gold w-full mt-4 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Confirm Order via WhatsApp
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2 animate-fade-in animate-fade-in-delay-2">
            <div className="bg-white/50 border border-beige/30 p-6">
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
                        <p className="text-xs text-charcoal/40">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm text-charcoal">
                        KSh {(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-beige/50 flex justify-between">
                <span className="text-sm tracking-wider uppercase text-charcoal/60">Total</span>
                <span className="font-serif text-xl text-charcoal">
                  KSh {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
