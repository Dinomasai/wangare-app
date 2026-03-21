import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import heroImg from "../assets/images/product1.jpg";

const featured = products.filter((p) => p.featured).slice(0, 8);
const newArrivals = products.filter((p) => p.newArrival).slice(0, 10);

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function SectionHeading({ title, subtitle, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`text-center mb-12 ${visible ? "animate-fade-in" : "opacity-0"} ${className}`}>
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-charcoal/50 tracking-wider">{subtitle}</p>}
    </div>
  );
}

export default function Home() {
  const scrollRef = useRef(null);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt="Wangaré Luxe hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="relative z-10 text-center px-6 animate-fade-in">
          <p className="text-cream/70 text-xs tracking-[0.4em] uppercase mb-4">Kenyan Luxury Brand</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-tight">
            Wangaré <span className="text-gold">Luxe</span>
          </h1>
          <p className="mt-5 text-cream/80 text-sm md:text-base tracking-[0.3em] uppercase font-light">
            Luxury in Every Detail
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="btn-primary">
              Shop Collection
            </Link>
            <Link to="/reels" className="border border-cream/40 text-cream px-8 py-3 text-sm tracking-widest uppercase hover:bg-cream/10 transition-colors duration-300">
              View Reels
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-cream/50 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <svg className="w-4 h-4 text-cream/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Featured Bags */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <SectionHeading title="Featured Collection" subtitle="Curated pieces for the discerning woman" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-14">
          <Link to="/shop" className="btn-outline">
            View All Products
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-beige/50" />
      </div>

      {/* New Arrivals Carousel */}
      <section className="py-20 md:py-28">
        <SectionHeading title="New Arrivals" subtitle="Just landed — be the first to own them" />
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar px-6 scroll-smooth"
        >
          {newArrivals.map((product) => (
            <div key={product.id} className="min-w-[260px] md:min-w-[300px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Brand Story Banner */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <img
          src={products[4]?.images[0]}
          alt="Brand story"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Our Philosophy</p>
          <h2 className="font-serif text-3xl md:text-5xl text-cream leading-snug">
            Where Kenyan Craftsmanship Meets Global Elegance
          </h2>
          <p className="mt-6 text-cream/70 text-sm md:text-base leading-relaxed">
            Every Wangaré Luxe piece is a celebration of African artistry — handpicked materials,
            meticulous detailing, and designs that transcend trends.
          </p>
          <Link to="/shop" className="btn-gold mt-10 inline-block">
            Discover More
          </Link>
        </div>
      </section>

      {/* Social CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <SectionHeading title="Follow the Luxe Life" subtitle="Stay inspired — join us on social media" />
        <div className="flex justify-center gap-8">
          <a
            href="https://www.instagram.com/wangareluxe?igsh=MWpmbDhqMno2OHY1ag=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-charcoal/60 hover:text-gold transition-colors"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            <span className="text-xs tracking-wider uppercase">Instagram</span>
          </a>
          <a
            href="https://tiktok.com/@wangare.luxe?_t=ZM-8w2yg6CUQwp&_r=1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-charcoal/60 hover:text-gold transition-colors"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            <span className="text-xs tracking-wider uppercase">TikTok</span>
          </a>
          <a
            href="https://wa.me/254747622490"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-charcoal/60 hover:text-gold transition-colors"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span className="text-xs tracking-wider uppercase">WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
}
