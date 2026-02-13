import { useParams } from "react-router-dom";
import { products } from "@/data/products";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Heart, Star, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl">Producto no encontrado</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <div className="container mx-auto px-4 lg:px-8 py-4">
        <p className="text-sm text-muted-foreground">
          🏠 Inicio &gt; Tienda &gt; <span className="text-foreground font-medium">{product.name}</span>
        </p>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col justify-center">
            <span className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">{product.category}</span>
            <h1 className="font-display text-3xl lg:text-4xl font-bold mb-3">{product.name}</h1>
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-warning text-warning" : "text-border"}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-2">({product.rating})</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            <p className="text-sm text-muted-foreground mb-2">SKU: {product.sku}</p>
            <p className="text-sm mb-6">
              Stock: <span className={product.stock > 10 ? "text-success font-medium" : "text-accent font-medium"}>{product.stock} disponibles</span>
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-secondary transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium border-x border-border">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { for (let i = 0; i < qty; i++) addItem(product); }}
                className="flex-1 bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="w-4 h-4" /> Agregar al Carrito
              </button>
              <button className="border border-border px-4 py-3 hover:bg-secondary transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
