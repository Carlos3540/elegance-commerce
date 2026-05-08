// src/components/store/ProductCard.tsx
import { useState } from "react";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { Product } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductCardProps {
  product: Product & {
    reviews?: Review[];
    avg_rating?: number;
    review_count?: number;
  };
}

const StarRating = ({ rating, size = 12 }: { rating: number; size?: number }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={size}
        style={{
          fill: i <= Math.round(rating) ? "#f59e0b" : "transparent",
          color: i <= Math.round(rating) ? "#f59e0b" : "#d1d5db",
          flexShrink: 0,
        }}
      />
    ))}
  </div>
);

// Mock reviews for demo — en producción vendrían de Supabase
const MOCK_REVIEWS: Review[] = [
  { id: "1", author: "María G.", rating: 5, comment: "Increíble calidad, el tela es suave y el corte queda perfecto. Lo recomiendo totalmente.", date: "hace 2 días" },
  { id: "2", author: "Laura M.", rating: 4, comment: "Muy bonito, el color es exactamente como en la foto. Talla un poco grande.", date: "hace 1 semana" },
  { id: "3", author: "Valentina R.", rating: 5, comment: "Ya es mi tercera compra de esta marca. Siempre excelente.", date: "hace 2 semanas" },
];

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem }                    = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user }                       = useAuth();
  const { format }                     = useCurrency();

  const [showReviews, setShowReviews] = useState(false);
  const [addedAnim, setAddedAnim]     = useState(false);

  const favorite    = isFavorite(product.id);
  const reviews     = product.reviews || MOCK_REVIEWS;
  const avgRating   = product.avg_rating ?? 4.6;
  const reviewCount = product.review_count ?? reviews.length;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    await addItem(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    await toggleFavorite(product.id);
  };

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      style={{ fontFamily: "'DM Sans', sans-serif", position: "relative" }}
    >
      {/* ── Imagen ── */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, marginBottom: 14, background: "#f5f4f2" }}>
        <Link to={`/producto/${product.slug}`}>
          <motion.img
            src={product.image_url || "/assets/placeholder.svg"}
            alt={product.name}
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            style={{ 
              width: "100%", 
              aspectRatio: "3/4", 
              objectFit: "cover", 
              display: "block",
              maxHeight: "none" 
            }}
          />
        </Link>

        {/* Badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {hasDiscount && (
            <span style={{ background: "#bb3838", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              -{discountPct}%
            </span>
          )}
          {product.is_featured && (
            <span style={{ background: "#111", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Nuevo
            </span>
          )}
        </div>

        {/* Stock badge */}
        {product.stock > 0 && product.stock <= product.low_stock_threshold && (
          <span style={{ position: "absolute", top: 12, right: 12, background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, textTransform: "uppercase" }}>
            Últimas {product.stock}
          </span>
        )}

        {/* Agotado overlay */}
        {product.stock === 0 && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16 }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>Agotado</span>
          </div>
        )}

        {/* Favorito */}
        <motion.button
          onClick={handleToggleFavorite}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "absolute", bottom: 10, right: 10,
            width: "clamp(32px, 8vw, 36px)", height: "clamp(32px, 8vw, 36px)", borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          }}
        >
          <Heart
            size={14}
            style={{
              fill: favorite ? "#ef4444" : "transparent",
              color: favorite ? "#ef4444" : "#555",
              transition: "all 0.2s",
            }}
          />
        </motion.button>

        {/* Ver producto */}
        <Link to={`/producto/${product.slug}`}>
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              position: "absolute", bottom: 10, left: 10,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              borderRadius: 8, padding: "6px 10px",
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 700, color: "#111",
              cursor: "pointer", letterSpacing: "0.03em",
            }}
          >
            <Eye size={12} /> <span className="hidden sm:inline">Ver</span>
          </motion.div>
        </Link>
      </div>

      {/* ── Info ── */}
      <div style={{ paddingLeft: 2 }}>

        {/* Rating */}
        <button
          onClick={() => setShowReviews(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 6 }}
        >
          <StarRating rating={avgRating} />
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
            {avgRating.toFixed(1)} ({reviewCount})
          </span>
        </button>

        {/* Nombre */}
        <Link to={`/producto/${product.slug}`} style={{ textDecoration: "none" }}>
          <h3 style={{ 
            fontSize: "clamp(13px, 3.5vw, 14px)", 
            fontWeight: 600, 
            color: "#111", 
            marginBottom: 6, 
            lineHeight: 1.35, 
            letterSpacing: "-0.01em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: "2.7em"
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Precio */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: "clamp(14px, 4vw, 16px)", fontWeight: 800, color: "#111" }}>
            {format(product.price)}
          </span>
          {hasDiscount && (
            <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through" }}>
              {format(product.compare_price!)}
            </span>
          )}
        </div>

        {/* Tallas disponibles */}
        {product.metadata?.sizes?.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
            {product.metadata.sizes.slice(0, 5).map((s: string) => (
              <span key={s} style={{ fontSize: 10, fontWeight: 700, color: "#555", border: "1px solid #e5e7eb", borderRadius: 5, padding: "2px 7px", letterSpacing: "0.04em" }}>
                {s}
              </span>
            ))}
          </div>
        )}

        <Link 
          to={`/producto/${product.slug}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            height: "clamp(36px, 9vw, 42px)",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: "clamp(9px, 2.5vw, 11px)",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
            textDecoration: "none",
            marginTop: 8
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#333"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#111"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
        >
          <Eye size={14} />
          Detalles
        </Link>
      </div>

      {/* ── Panel de reseñas ── */}
      <AnimatePresence>
        {showReviews && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 14, padding: "16px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0" }}>

              {/* Header reseñas */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: "-0.04em" }}>
                    {avgRating.toFixed(1)}
                  </span>
                  <div>
                    <StarRating rating={avgRating} size={14} />
                    <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, display: "block" }}>
                      {reviewCount} reseñas
                    </span>
                  </div>
                </div>
                <Link
                  to={`/producto/${product.slug}#reviews`}
                  style={{ fontSize: 11, fontWeight: 700, color: "#111", textDecoration: "underline", letterSpacing: "0.03em" }}
                >
                  Ver todas →
                </Link>
              </div>

              {/* Lista de reseñas */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reviews.slice(0, 2).map(review => (
                  <div key={review.id} style={{ paddingBottom: 12, borderBottom: "1px solid #ebebeb" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                          {review.author[0]}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{review.author}</span>
                      </div>
                      <span style={{ fontSize: 10, color: "#bbb" }}>{review.date}</span>
                    </div>
                    <StarRating rating={review.rating} size={11} />
                    <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5, marginTop: 5 }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;