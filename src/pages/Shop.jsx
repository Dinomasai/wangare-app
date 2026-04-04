import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchProducts } from "../api";
import ProductCard from "../components/ProductCard";

const categories = ["all", "bags", "clothes", "jewelry"];

export default function Shop() {
  const { category: urlCategory } = useParams();
  const [active, setActive] = useState(urlCategory || "all");
  const [sort, setSort] = useState("default");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (urlCategory) setActive(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    setLoading(true);
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = active === "all" ? products : products.filter((p) => p.category === active);
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [active, sort, products]);

  return (
    <div className="pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14 animate-fade-in">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Our Collection</p>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal">Shop</h1>
          <p className="mt-3 text-sm text-charcoal/50 tracking-wider max-w-md mx-auto">
            Explore our curated selection of luxury bags, clothes & jewelry
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex gap-3 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 text-xs tracking-[0.2em] uppercase transition-colors duration-300 ${
                  active === cat
                    ? "bg-charcoal text-cream"
                    : "border border-charcoal/20 text-charcoal/60 hover:border-charcoal"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border border-charcoal/20 px-4 py-2 text-xs tracking-wider text-charcoal/70 focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="default">Sort By</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="name">Name: A – Z</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filtered.map((product, i) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-charcoal/40 py-20 text-sm tracking-wider">
            No products found in this category.
          </p>
        )}
      </div>
    </div>
  );
}
