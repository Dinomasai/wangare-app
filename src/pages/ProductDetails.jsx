import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProduct, fetchProducts } from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import SafeImg from "../components/SafeImg";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    fetchProduct(id).then((p) => {
      setProduct(p);
      setSelectedColor(p?.colors?.[0] || "");
      setSelectedSize(p?.sizes?.[0] || "");
      setLoading(false);
      // Fetch related
      if (p) {
        fetchProducts(p.category).then((all) => {
          setRelated(all.filter((r) => r.id !== p.id).slice(0, 4));
        });
      }
    });
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen">
        <h2 className="font-serif text-2xl text-charcoal">Product not found</h2>
        <Link to="/shop" className="btn-outline mt-6 inline-block">Back to Shop</Link>
      </div>
    );
  }

  function handleAddToCart() {
    addToCart(product, selectedColor, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addToCart(product, selectedColor, selectedSize);
    navigate("/checkout");
  }

  return (
    <div className="pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="mb-8 text-xs text-charcoal/40 tracking-wider">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <Link to={`/shop/${product.category}`} className="hover:text-gold transition-colors capitalize">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-4 animate-fade-in">
            <div className="relative overflow-hidden bg-cream-dark aspect-[3/4]">
              <SafeImg src={product.images?.[activeImg]} alt={product.name} loading="eager" className="w-full h-full object-cover transition-all duration-500" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-colors duration-300 ${
                      i === activeImg ? "border-gold" : "border-transparent hover:border-beige"
                    }`}
                  >
                    <SafeImg src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="animate-fade-in animate-fade-in-delay-2 flex flex-col justify-center">
            {product.newArrival && (
              <span className="inline-block mb-4 text-[10px] tracking-[0.3em] uppercase text-gold">New Arrival</span>
            )}
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal leading-snug">{product.name}</h1>
            <p className="mt-3 text-xl text-charcoal/70 font-light">KSh {product.price.toLocaleString()}</p>
            <div className="mt-6 h-px bg-beige/50" />
            <p className="mt-6 text-sm text-charcoal/60 leading-relaxed">{product.description}</p>

            <div className="mt-4 text-xs text-charcoal/40 tracking-wider space-y-1">
              <p>Category: <span className="text-charcoal/60 capitalize">{product.category}</span></p>
              <p>SKU: <span className="text-charcoal/60">WL-{String(product.id).padStart(4, "0")}</span></p>
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-3">
                  Color: <span className="text-charcoal">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs tracking-wider border transition-all duration-300 ${
                        selectedColor === color
                          ? "border-gold bg-gold/10 text-charcoal"
                          : "border-charcoal/20 text-charcoal/60 hover:border-charcoal/40"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes (for clothes) */}
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs tracking-[0.2em] uppercase text-charcoal/60 mb-3">
                  Size: <span className="text-charcoal">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center text-xs tracking-wider border transition-all duration-300 ${
                        selectedSize === size
                          ? "border-gold bg-gold/10 text-charcoal"
                          : "border-charcoal/20 text-charcoal/60 hover:border-charcoal/40"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className={`px-8 py-3.5 text-sm tracking-widest uppercase transition-all duration-300 ${
                  added ? "bg-gold text-white" : "bg-charcoal text-cream hover:bg-gold"
                }`}
              >
                {added ? "Added!" : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-gold text-white px-8 py-3.5 text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors duration-300 text-center flex items-center justify-center gap-2"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <div className="h-px bg-beige/50 mb-16" />
            <h2 className="font-serif text-2xl md:text-3xl text-charcoal text-center mb-12">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
