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

import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile                       = useIsMobile();

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
      style={{ 
        fontFamily: "'DM Sans', sans-serif", 
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* ── Imagen ── */}
      <div style={{ 
        position: "relative", 
        overflow: "hidden", 
        borderRadius: isMobile ? 12 : 16, 
        marginBottom: isMobile ? 10 : 14, 
        background: "#f5f4f2",
        aspectRatio: "3/4"
      }}>
        <Link to={`/producto/${product.slug}`}>
          <motion.img
            src={product.image_url || "/assets/placeholder.svg"}
            alt={product.name}
            whileHover={!isMobile ? { scale: 1.06 } : {}}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            style={{ 
              width: "100%", 
              height: "100%",
              objectFit: "cover", 
              display: "block",
            }}
          />
        </Link>

        {/* Badges */}
        <div style={{ position: "absolute", top: isMobile ? 8 : 12, left: isMobile ? 8 : 12, display: "flex", flexDirection: "column", gap: 4 }}>
          {hasDiscount && (
            <span style={{ 
              background: "#bb3838", 
              color: "#fff", 
              fontSize: isMobile ? 9 : 10, 
              fontWeight: 800, 
              padding: isMobile ? "2px 6px" : "3px 8px", 
              borderRadius: 4, 
              letterSpacing: "0.06em", 
              textTransform: "uppercase" 
            }}>
              -{discountPct}%
            </span>
          )}
          {product.is_featured && (
            <span style={{ 
              background: "#111", 
              color: "#fff", 
              fontSize: isMobile ? 9 : 10, 
              fontWeight: 800, 
              padding: isMobile ? "2px 6px" : "3px 8px", 
              borderRadius: 4, 
              letterSpacing: "0.06em", 
              textTransform: "uppercase" 
            }}>
              Nuevo
            </span>
          )}
        </div>

        {/* Stock badge */}
        {product.stock > 0 && product.stock <= product.low_stock_threshold && (
          <span style={{ 
            position: "absolute", 
            top: isMobile ? 8 : 12, 
            right: isMobile ? 8 : 12, 
            background: "#f97316", 
            color: "#fff", 
            fontSize: isMobile ? 9 : 10, 
            fontWeight: 800, 
            padding: isMobile ? "2px 6px" : "3px 8px", 
            borderRadius: 4, 
            textTransform: "uppercase" 
          }}>
            Últimas {product.stock}
          </span>
        )}

        {/* Agotado overlay */}
        {product.stock === 0 && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: isMobile ? 12 : 16 }}>
            <span style={{ color: "#fff", fontSize: isMobile ? 10 : 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>Agotado</span>
          </div>
        )}

        {/* Favorito */}
        <motion.button
          onClick={handleToggleFavorite}
          whileHover={!isMobile ? { scale: 1.12 } : {}}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "absolute", bottom: isMobile ? 8 : 10, right: isMobile ? 8 : 10,
            width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, 
            borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            zIndex: 10
          }}
        >
          <Heart
            size={isMobile ? 13 : 14}
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
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileHover={!isMobile ? { opacity: 1, y: 0 } : {}}
            style={{
              position: "absolute", bottom: isMobile ? 8 : 10, left: isMobile ? 8 : 10,
              background: isMobile ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              borderRadius: 6, 
              padding: isMobile ? "4px 8px" : "6px 10px",
              display: "flex", alignItems: "center", gap: 4,
              fontSize: isMobile ? 9 : 10, 
              fontWeight: 700, color: "#111",
              cursor: "pointer", letterSpacing: "0.03em",
              boxShadow: isMobile ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
            }}
          >
            <Eye size={isMobile ? 11 : 12} /> <span>Ver</span>
          </motion.div>
        </Link>
      </div>

      {/* ── Info ── */}
      <div style={{ paddingLeft: isMobile ? 0 : 2, display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Rating */}
        <button
          onClick={() => setShowReviews(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: isMobile ? 4 : 6 }}
        >
          <StarRating rating={avgRating} size={isMobile ? 10 : 12} />
          <span style={{ fontSize: isMobile ? 10 : 11, color: "#9ca3af", fontWeight: 600 }}>
            {avgRating.toFixed(1)} ({reviewCount})
          </span>
        </button>

        {/* Nombre */}
        <Link to={`/producto/${product.slug}`} style={{ textDecoration: "none" }}>
          <h3 style={{ 
            fontSize: isMobile ? "13px" : "clamp(13px, 3.5vw, 14px)", 
            fontWeight: 600, 
            color: "#111", 
            marginBottom: isMobile ? 4 : 6, 
            lineHeight: 1.3, 
            letterSpacing: "-0.01em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: isMobile ? "2.6em" : "2.7em"
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Precio */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: isMobile ? 8 : 12 }}>
          <span style={{ fontSize: isMobile ? "14px" : "clamp(14px, 4vw, 16px)", fontWeight: 800, color: "#111" }}>
            {format(product.price)}
          </span>
          {hasDiscount && (
            <span style={{ fontSize: isMobile ? 10 : 12, color: "#9ca3af", textDecoration: "line-through" }}>
              {format(product.compare_price!)}
            </span>
          )}
        </div>

        {/* Tallas disponibles - Ocultar en móvil para ahorrar espacio si es necesario o simplificar */}
        {product.metadata?.sizes?.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: isMobile ? 10 : 12 }}>
            {product.metadata.sizes.slice(0, isMobile ? 3 : 5).map((s: string) => (
              <span key={s} style={{ 
                fontSize: 9, 
                fontWeight: 700, 
                color: "#555", 
                border: "1px solid #e5e7eb", 
                borderRadius: 4, 
                padding: "1px 6px", 
                letterSpacing: "0.04em" 
              }}>
                {s}
              </span>
            ))}
            {isMobile && product.metadata.sizes.length > 3 && (
              <span style={{ fontSize: 9, color: "#999", alignSelf: "center" }}>+</span>
            )}
          </div>
        )}

        {/* Spacer to push button down */}
        <div style={{ flex: 1 }} />

        <Link 
          to={`/producto/${product.slug}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            height: isMobile ? 36 : 42,
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: isMobile ? 10 : 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
            textDecoration: "none",
            marginTop: isMobile ? 4 : 8,
            width: "100%"
          }}
          onMouseEnter={e => { if (!isMobile) { (e.currentTarget as HTMLAnchorElement).style.background = "#333"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; } }}
          onMouseLeave={e => { if (!isMobile) { (e.currentTarget as HTMLAnchorElement).style.background = "#111"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; } }}
        >
          <Eye size={isMobile ? 12 : 14} />
          {isMobile ? "Ver" : "Detalles"}
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
            <div style={{ 
              marginTop: isMobile ? 10 : 14, 
              padding: isMobile ? "12px" : "16px", 
              background: "#fafafa", 
              borderRadius: 12, 
              border: "1px solid #f0f0f0" 
            }}>

              {/* Header reseñas */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? 10 : 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8 }}>
                  <span style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: "#111", letterSpacing: "-0.04em" }}>
                    {avgRating.toFixed(1)}
                  </span>
                  <div>
                    <StarRating rating={avgRating} size={isMobile ? 12 : 14} />
                    <span style={{ fontSize: isMobile ? 10 : 11, color: "#9ca3af", marginTop: 2, display: "block" }}>
                      {reviewCount} reseñas
                    </span>
                  </div>
                </div>
                <Link
                  to={`/producto/${product.slug}#reviews`}
                  style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, color: "#111", textDecoration: "underline", letterSpacing: "0.03em" }}
                >
                  Ver todas →
                </Link>
              </div>

              {/* Lista de reseñas */}
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 12 }}>
                {reviews.slice(0, 2).map(review => (
                  <div key={review.id} style={{ paddingBottom: isMobile ? 10 : 12, borderBottom: "1px solid #ebebeb" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ 
                          width: isMobile ? 24 : 28, 
                          height: isMobile ? 24 : 28, 
                          borderRadius: "50%", 
                          background: "#111", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          color: "#fff", 
                          fontSize: isMobile ? 10 : 11, 
                          fontWeight: 800, 
                          flexShrink: 0 
                        }}>
                          {review.author[0]}
                        </div>
                        <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, color: "#111" }}>{review.author}</span>
                      </div>
                      <span style={{ fontSize: 9, color: "#bbb" }}>{review.date}</span>
                    </div>
                    <StarRating rating={review.rating} size={isMobile ? 10 : 11} />
                    <p style={{ fontSize: isMobile ? 11 : 12, color: "#555", lineHeight: 1.4, marginTop: 4 }}>
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