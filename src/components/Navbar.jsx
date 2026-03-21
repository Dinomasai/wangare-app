import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cartCount } = useCart();

  const linkClass = ({ isActive }) =>
    `text-xs tracking-[0.25em] uppercase transition-colors duration-300 ${
      isActive ? "text-gold" : "text-charcoal hover:text-gold"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md border-b border-beige/40">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="font-serif text-xl md:text-2xl tracking-wider text-charcoal">
          Wangaré <span className="text-gold">Luxe</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/shop" className={linkClass}>Shop</NavLink>
          <NavLink to="/reels" className={linkClass}>Reels</NavLink>
          <NavLink to="/cart" className={linkClass}>
            Cart
            {cartCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold text-white text-[10px] font-sans font-semibold">
                {cartCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-px bg-charcoal transition-all duration-300 ${open ? "rotate-45 translate-y-[4px]" : ""}`} />
          <span className={`block w-6 h-px bg-charcoal transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-px bg-charcoal transition-all duration-300 ${open ? "-rotate-45 -translate-y-[4px]" : ""}`} />
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-cream border-b border-beige/40 ${
          open ? "max-h-64" : "max-h-0"
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-5">
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/shop" className={linkClass} onClick={() => setOpen(false)}>Shop</NavLink>
          <NavLink to="/reels" className={linkClass} onClick={() => setOpen(false)}>Reels</NavLink>
          <NavLink to="/cart" className={linkClass} onClick={() => setOpen(false)}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
