import { ShoppingCart, Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <div className="relative overflow-hidden mb-3">
        <Link to={`/producto/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {product.isSale && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 uppercase">
            Oferta
          </span>
        )}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 uppercase">
            Nuevo
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => addItem(product)}
            className="flex-1 bg-primary text-primary-foreground py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
          <button className="bg-background text-foreground p-2.5 hover:bg-secondary transition-colors">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>
      <Link to={`/producto/${product.id}`}>
        <h3 className="text-sm font-medium mb-1 group-hover:text-accent transition-colors">{product.name}</h3>
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">${product.price.toFixed(2)}</span>
        {product.originalPrice && (
          <span className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
