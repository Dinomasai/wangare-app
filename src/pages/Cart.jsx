import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import SafeImg from "../components/SafeImg";

export default function Cart() {
  const { items, updateQty, removeFromCart, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen text-center">
        <div className="max-w-md mx-auto px-6 animate-fade-in">
          <svg className="w-16 h-16 mx-auto text-beige mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="font-serif text-3xl text-charcoal mb-3">Your Cart is Empty</h1>
          <p className="text-sm text-charcoal/50 mb-8">
            Discover our curated collection of luxury bags
          </p>
          <Link to="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-12 animate-fade-in">
          Shopping Cart
        </h1>

        {/* Cart items */}
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.cartKey}
              className="flex gap-5 bg-white/50 border border-beige/30 p-4 md:p-6 animate-fade-in"
            >
              <Link to={`/product/${item.id}`} className="flex-shrink-0 w-24 h-28 md:w-32 md:h-36 overflow-hidden bg-cream-dark">
                <SafeImg src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/product/${item.id}`} className="font-serif text-base md:text-lg text-charcoal hover:text-gold transition-colors">
                    {item.name}
                  </Link>
                  {item.color && (
                    <p className="text-xs text-charcoal/40 mt-0.5">Color: {item.color}</p>
                  )}
                  <p className="text-sm text-charcoal/50 mt-1">
                    KSh {item.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-charcoal/20">
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal/60 hover:text-charcoal transition-colors"
                    >
                      &minus;
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center text-sm border-x border-charcoal/20">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal/60 hover:text-charcoal transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-charcoal">
                      KSh {(item.price * item.qty).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.cartKey)}
                      className="text-charcoal/30 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-10 border-t border-beige/50 pt-8">
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm tracking-wider uppercase text-charcoal/60">Total</span>
            <span className="font-serif text-2xl text-charcoal">
              KSh {cartTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link to="/shop" className="btn-outline text-center">
              Continue Shopping
            </Link>
            <Link to="/checkout" className="btn-primary text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
