import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchReels, fetchProducts } from "../api";

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchReels(), fetchProducts()]).then(([reelsData, productsData]) => {
      setProducts(productsData);
      // If no reels uploaded yet, generate reels from products
      if (reelsData.length === 0) {
        const autoReels = productsData.slice(0, 12).map((p, i) => ({
          id: p.id,
          media: p.images[0],
          mediaType: "image",
          productId: p.id,
          tag: i % 3 === 0 ? "Trending Now" : i % 3 === 1 ? "Best Seller" : "New Drop",
          caption: p.name,
        }));
        setReels(autoReels);
      } else {
        setReels(reelsData);
      }
      setLoading(false);
    });
  }, []);

  function getProduct(productId) {
    return products.find((p) => p.id === productId);
  }

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Style Inspiration</p>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal">Reels</h1>
          <p className="mt-3 text-sm text-charcoal/50 tracking-wider max-w-md mx-auto">
            Scroll through our curated looks and shop the style
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {reels.map((reel, i) => {
            const product = getProduct(reel.productId);
            return (
              <div
                key={reel.id}
                className="relative group overflow-hidden bg-cream-dark aspect-[9/16] animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 0.08, 0.5)}s` }}
              >
                {reel.mediaType === "video" ? (
                  <ReelVideo src={reel.media} />
                ) : (
                  <img
                    src={reel.media}
                    alt={reel.caption || "Reel"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />

                <span className="absolute top-4 left-4 bg-gold/90 text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1 backdrop-blur-sm">
                  {reel.tag}
                </span>

                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                  <div>
                    <p className="text-cream text-sm font-serif">{product?.name || reel.caption}</p>
                    {product && (
                      <p className="text-cream/70 text-xs">KSh {product.price.toLocaleString()}</p>
                    )}
                  </div>
                  {product && (
                    <Link
                      to={`/product/${product.id}`}
                      className="block w-full bg-cream/90 text-charcoal text-center py-2.5 text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-gold hover:text-white transition-colors duration-300"
                    >
                      Buy This Look
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {reels.length === 0 && (
          <p className="text-center text-charcoal/40 py-20 text-sm tracking-wider">
            No reels yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}

function ReelVideo({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function togglePlay() {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  }

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
