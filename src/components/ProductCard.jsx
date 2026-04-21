import { Link } from "react-router-dom";
import SafeImg from "./SafeImg";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden bg-cream-dark aspect-[3/4]">
        <SafeImg
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500" />
        {product.newArrival && (
          <span className="absolute top-4 left-4 bg-gold text-white text-[10px] tracking-[0.2em] uppercase px-3 py-1">
            New
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-serif text-base text-charcoal group-hover:text-gold transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-sm text-charcoal/60 font-light">
          KSh {product.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
