import { Link } from "react-router-dom";
import products from "../data/products";

// Use product images as "reels" — pairs of products shown in a vertical scroll layout
const reelsData = products.slice(0, 12).map((p, i) => ({
  id: p.id,
  image: p.images[0],
  overlay: i % 3 === 0 ? "Trending Now" : i % 3 === 1 ? "Best Seller" : "New Drop",
  productId: p.id,
  productName: p.name,
  price: p.price,
}));

export default function Reels() {
  return (
    <div className="pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Style Inspiration</p>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal">Reels</h1>
          <p className="mt-3 text-sm text-charcoal/50 tracking-wider max-w-md mx-auto">
            Scroll through our curated looks and shop the style
          </p>
        </div>

        {/* Reels Grid — Vertical scroll like layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {reelsData.map((reel, i) => (
            <div
              key={reel.id}
              className="relative group overflow-hidden bg-cream-dark aspect-[9/16] animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 0.08, 0.5)}s` }}
            >
              <img
                src={reel.image}
                alt={reel.productName}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />

              {/* Tag */}
              <span className="absolute top-4 left-4 bg-gold/90 text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1 backdrop-blur-sm">
                {reel.overlay}
              </span>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                <div>
                  <p className="text-cream text-sm font-serif">{reel.productName}</p>
                  <p className="text-cream/70 text-xs">KSh {reel.price.toLocaleString()}</p>
                </div>
                <Link
                  to={`/product/${reel.productId}`}
                  className="block w-full bg-cream/90 text-charcoal text-center py-2 text-[10px] tracking-[0.25em] uppercase hover:bg-gold hover:text-white transition-colors duration-300"
                >
                  Shop This Look
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
