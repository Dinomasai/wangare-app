import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import products from "../data/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetails() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen">
        <h2 className="font-serif text-2xl text-charcoal">Product not found</h2>
        <Link to="/shop" className="btn-outline mt-6 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent(
    `Hello, I want to buy ${product.name} (Color: ${selectedColor}) for KSh ${product.price.toLocaleString()}`
  );
  const whatsappUrl = `https://wa.me/254747622490?text=${whatsappMsg}`;

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  function handleAddToCart() {
    addToCart(product, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 text-xs text-charcoal/40 tracking-wider">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4 animate-fade-in">
            <div className="relative overflow-hidden bg-cream-dark aspect-[3/4]">
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
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
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="animate-fade-in animate-fade-in-delay-2 flex flex-col justify-center">
            {product.newArrival && (
              <span className="inline-block mb-4 text-[10px] tracking-[0.3em] uppercase text-gold">
                New Arrival
              </span>
            )}
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal leading-snug">
              {product.name}
            </h1>
            <p className="mt-3 text-xl text-charcoal/70 font-light">
              KSh {product.price.toLocaleString()}
            </p>

            <div className="mt-6 h-px bg-beige/50" />

            <p className="mt-6 text-sm text-charcoal/60 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-4 text-xs text-charcoal/40 tracking-wider space-y-1">
              <p>Category: <span className="text-charcoal/60 capitalize">{product.category}</span></p>
              <p>SKU: <span className="text-charcoal/60">WL-{String(product.id).padStart(4, "0")}</span></p>
            </div>

            {product.colors && product.colors.length > 0 && (
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

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className={`px-8 py-3.5 text-sm tracking-widest uppercase transition-all duration-300 ${
                  added
                    ? "bg-gold text-white"
                    : "bg-charcoal text-cream hover:bg-gold"
                }`}
              >
                {added ? "Added!" : "Add to Cart"}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-charcoal text-charcoal px-8 py-3.5 text-sm tracking-widest uppercase hover:bg-charcoal hover:text-cream transition-colors duration-300 text-center flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Buy Now
              </a>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-24">
            <div className="h-px bg-beige/50 mb-16" />
            <h2 className="font-serif text-2xl md:text-3xl text-charcoal text-center mb-12">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
