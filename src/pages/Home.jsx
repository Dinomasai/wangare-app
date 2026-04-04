import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api";
import ProductCard from "../components/ProductCard";

/* ── Intersection Observer hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Section intro ── */
function SectionIntro({ overline, title, subtitle, light = false, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`text-center mb-14 md:mb-16 ${visible ? "animate-fade-in" : "opacity-0"} ${className}`}>
      {overline && (
        <p className={`text-xs tracking-[0.4em] uppercase mb-3 ${light ? "text-gold" : "text-gold"}`}>{overline}</p>
      )}
      <h2 className={`font-serif text-3xl md:text-5xl leading-tight ${light ? "text-cream" : "text-charcoal"}`}>{title}</h2>
      {subtitle && (
        <p className={`mt-4 text-sm tracking-wider max-w-lg mx-auto ${light ? "text-cream/60" : "text-charcoal/45"}`}>{subtitle}</p>
      )}
    </div>
  );
}

/* ── Category data ── */
const CATEGORIES = [
  { name: "Bags", slug: "bags", desc: "Curated leather bags for every occasion" },
  { name: "Clothes", slug: "clothes", desc: "Elegant outfits styled to perfection" },
  { name: "Jewelry", slug: "jewelry", desc: "Statement pieces that shine" },
];

/* ══════════════════════════════ HOME ══════════════════════════════ */
export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 10);
  const heroImg = products[0]?.images?.[0] || "";
  const heroImg2 = products[2]?.images?.[0] || "";

  return (
    <div>
      {/* ════════════ HERO ════════════ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {heroImg && (
          <img src={heroImg} alt="Wangaré Luxe" className="absolute inset-0 w-full h-full object-cover animate-slow-zoom" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/50 to-charcoal/70" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-cream/60 text-xs tracking-[0.5em] uppercase mb-6 animate-fade-in">
            Kenyan Luxury Brand
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-[1.1] animate-fade-in animate-fade-in-delay-1">
            Wangaré <span className="text-shimmer">Luxe</span>
          </h1>
          <p className="mt-6 text-cream/70 text-sm md:text-base tracking-[0.3em] uppercase font-light animate-fade-in animate-fade-in-delay-2">
            Luxury in Every Detail
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-fade-in-delay-3">
            <Link to="/shop" className="bg-gold text-white px-10 py-4 text-sm tracking-[0.25em] uppercase hover:bg-gold-dark transition-all duration-500 hover:px-12">
              Shop Collection
            </Link>
            <Link to="/reels" className="border border-cream/30 text-cream px-10 py-4 text-sm tracking-[0.25em] uppercase hover:bg-cream/10 hover:border-cream/60 transition-all duration-500">
              View Reels
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-cream/40" />
          <span className="text-cream/40 text-[9px] tracking-[0.4em] uppercase">Discover</span>
        </div>
      </section>

      {/* ════════════ MARQUEE STRIP ════════════ */}
      <div className="bg-charcoal py-4 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="mx-8 text-cream/20 text-xs tracking-[0.5em] uppercase">
              Premium Quality &nbsp;&bull;&nbsp; Handcrafted &nbsp;&bull;&nbsp; Kenyan Heritage &nbsp;&bull;&nbsp; Timeless Elegance &nbsp;&bull;&nbsp; Free Delivery Nairobi &nbsp;&bull;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ════════════ SHOP BY CATEGORY ════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <SectionIntro overline="Collections" title="Shop by Category" subtitle="Explore our curated collections crafted for the modern, elegant woman" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {CATEGORIES.map((cat, i) => {
            const catProducts = products.filter((p) => p.category === cat.slug);
            const img = catProducts[0]?.images?.[0];
            return (
              <CategoryCard key={cat.slug} cat={cat} img={img} index={i} />
            );
          })}
        </div>
      </section>

      {/* ════════════ FEATURED COLLECTION ════════════ */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <SectionIntro overline="Curated Selection" title="Featured Collection" subtitle="Handpicked pieces chosen for their exceptional craftsmanship and timeless appeal" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {featured.map((product, i) => (
              <div key={product.id} className="opacity-0 animate-scale-reveal" style={{ animationDelay: `${i * 0.08}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/shop" className="group inline-flex items-center gap-3 text-charcoal hover:text-gold transition-colors duration-300">
              <span className="text-sm tracking-[0.25em] uppercase">View All Products</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ NEW ARRIVALS — THE SHOWSTOPPER ════════════ */}
      <NewArrivalsSection products={newArrivals} />

      {/* ════════════ SPLIT BRAND STORY ════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <BrandStoryImage img={products[4]?.images?.[0]} />
          <BrandStoryText />
        </div>
      </section>

      {/* ════════════ PARALLAX QUOTE ════════════ */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        {heroImg2 && (
          <img src={heroImg2} alt="Luxury" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
        )}
        <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-[2px]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <svg className="w-10 h-10 text-gold mx-auto mb-8 animate-float" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="font-serif text-2xl md:text-4xl text-cream leading-relaxed italic">
            "Elegance is not about being noticed, it's about being remembered."
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Wangaré Luxe</span>
            <div className="w-8 h-px bg-gold" />
          </div>
        </div>
      </section>

      {/* ════════════ INSTAGRAM / SOCIAL CTA ════════════ */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <SectionIntro overline="Join the Community" title="Follow the Luxe Life" subtitle="Stay inspired — connect with us on social media" />

          <div className="flex justify-center gap-6 md:gap-10">
            {[
              { name: "Instagram", href: "https://www.instagram.com/wangareluxe?igsh=MWpmbDhqMno2OHY1ag==", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
              { name: "TikTok", href: "https://tiktok.com/@wangare.luxe?_t=ZM-8w2yg6CUQwp&_r=1", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
              { name: "WhatsApp", href: "https://wa.me/254747622490", icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
            ].map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-charcoal/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full border border-charcoal/10 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/5 transition-all duration-300">
                  <svg className="w-6 h-6 text-charcoal/50 group-hover:text-gold transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                </div>
                <span className="text-xs tracking-[0.2em] uppercase text-charcoal/40 group-hover:text-gold transition-colors">{s.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   NEW ARRIVALS — Simple auto-playing image slideshow
   ════════════════════════════════════════════════════════════ */
function NewArrivalsSection({ products }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const total = products.length;

  useEffect(() => {
    if (total < 2) return;
    timerRef.current = setInterval(() => setActive((p) => (p + 1) % total), 4000);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const go = (i) => {
    setActive(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((p) => (p + 1) % total), 4000);
  };

  if (total === 0) return null;

  const p = products[active];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <SectionIntro overline="Just Arrived" title="New Arrivals" subtitle="Be the first to own our latest pieces" />

        {/* Slideshow */}
        <div className="relative w-full -mx-6 px-0" style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
          {/* Main image + info */}
          <Link to={`/product/${p.id}`} className="group block overflow-hidden">
            <div className="relative aspect-[5/2] overflow-hidden bg-cream-dark">
              {products.map((prod, i) => (
                <img
                  key={prod.id}
                  src={prod.images[0]}
                  alt={prod.name}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-charcoal/50 to-transparent" />
              {/* Product info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between">
                <div>
                  <span className="inline-block bg-gold text-white text-[9px] tracking-[0.25em] uppercase px-2.5 py-1 mb-3">New Arrival</span>
                  <h3 className="font-serif text-xl md:text-2xl text-cream">{p.name}</h3>
                  <p className="text-cream/70 text-sm mt-1">KSh {p.price.toLocaleString()}</p>
                </div>
                <span className="hidden md:block bg-white/90 backdrop-blur-sm text-charcoal px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop Now
                </span>
              </div>
            </div>
          </Link>

          {/* Prev / Next arrows */}
          <button onClick={() => go((active - 1 + total) % total)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-charcoal/50 hover:text-gold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={() => go((active + 1) % total)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-charcoal/50 hover:text-gold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>

        {/* Thumbnail dots */}
        <div className="flex justify-center gap-2 mt-6">
          {products.map((_, i) => (
            <button key={i} onClick={() => go(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === active ? "bg-gold w-6" : "bg-charcoal/15 hover:bg-charcoal/30"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   CATEGORY CARD with hover reveal
   ════════════════════════════════════════════════════════════ */
function CategoryCard({ cat, img, index }) {
  const [ref, visible] = useInView(0.1);
  return (
    <Link
      ref={ref}
      to={`/shop/${cat.slug}`}
      className={`group relative overflow-hidden aspect-[3/4] bg-cream-dark ${visible ? "animate-scale-reveal" : "opacity-0"}`}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {img && (
        <img src={img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-charcoal/10 group-hover:from-charcoal/90 transition-all duration-500" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="overflow-hidden">
          <p className="text-gold text-[10px] tracking-[0.35em] uppercase mb-2 translate-y-0 group-hover:-translate-y-0.5 transition-transform duration-300">{cat.desc}</p>
        </div>
        <h3 className="font-serif text-3xl md:text-4xl text-cream">{cat.name}</h3>
        <div className="mt-4 flex items-center gap-2 text-cream/60 group-hover:text-gold transition-colors duration-300">
          <span className="text-xs tracking-[0.25em] uppercase">Explore</span>
          <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
        </div>
        {/* Underline reveal */}
        <div className="mt-3 h-px bg-gold/0 group-hover:bg-gold/40 transition-all duration-500 w-0 group-hover:w-full" />
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════
   BRAND STORY — Split layout
   ════════════════════════════════════════════════════════════ */
function BrandStoryImage({ img }) {
  const [ref, visible] = useInView(0.1);
  return (
    <div ref={ref} className={`relative ${visible ? "animate-slide-left" : "opacity-0"}`}>
      <div className="aspect-[4/5] overflow-hidden">
        {img && <img src={img} alt="Our Story" className="w-full h-full object-cover" />}
      </div>
      {/* Decorative frame */}
      <div className="absolute -bottom-4 -right-4 w-full h-full border border-gold/20 -z-10" />
    </div>
  );
}

function BrandStoryText() {
  const [ref, visible] = useInView(0.1);
  return (
    <div ref={ref} className={`${visible ? "animate-slide-right" : "opacity-0"}`}>
      <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Our Philosophy</p>
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal leading-snug">
        Where Kenyan Craftsmanship Meets Global Elegance
      </h2>
      <div className="mt-6 w-12 h-px bg-gold" />
      <p className="mt-6 text-charcoal/50 text-sm md:text-base leading-relaxed">
        Every Wangaré Luxe piece is a celebration of African artistry — handpicked materials,
        meticulous detailing, and designs that transcend trends.
      </p>
      <p className="mt-4 text-charcoal/40 text-sm leading-relaxed">
        From the heart of Kenya to your wardrobe, we bring you luxury that tells a story.
        Each bag, each accessory carries the warmth of our heritage and the polish of modern design.
      </p>
      <Link to="/shop" className="mt-10 inline-flex items-center gap-3 group">
        <span className="btn-gold">Discover More</span>
      </Link>
    </div>
  );
}
