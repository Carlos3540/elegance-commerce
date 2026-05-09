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
import { optimizeSupabaseImage, getSupabaseSrcSet } from "@/utils/imageOptimization";


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

  // ── Responsive tokens ──────────────────────────────────────────────────────
  // Using a single source of truth so every measurement is consistent.
  const r = isMobile
    ? {
        // image
        imageRadius: 12,
        imageMarginBottom: 10,
        // badges
        badgeTop: 8, badgeLeft: 8, badgeRight: 8,
        badgeFontSize: 9, badgePadding: "2px 6px",
        // fav button
        favSize: 32, favIconSize: 13,
        // overlay button
        overlayBottom: 8, overlayLeft: 8,
        overlayPadding: "4px 8px", overlayFontSize: 9,
        // info
        infoLeft: 0,
        starSize: 10, ratingFont: 10,
        nameFont: "13px", nameHeight: "2.6em",
        priceFont: "15px",
        comparePriceFont: 11,
        sizeFont: 9, maxSizes: 3,
        ctaHeight: 32, ctaFont: 9,
        ctaIconSize: 11,
        // reviews panel
        reviewPadding: "10px",
        reviewMarginTop: 8,
        reviewBigFont: 18,
        reviewStarSize: 11,
        reviewMetaFont: 9,
        reviewLinkFont: 9,
        reviewAvatarSize: 22, reviewAvatarFont: 9,
        reviewAuthorFont: 10, reviewCommentFont: 10,
        reviewGap: 8,
        reviewItemPadding: 8,
      }
    : {
        imageRadius: 16,
        imageMarginBottom: 14,
        badgeTop: 12, badgeLeft: 12, badgeRight: 12,
        badgeFontSize: 10, badgePadding: "3px 8px",
        favSize: 36, favIconSize: 14,
        overlayBottom: 10, overlayLeft: 10,
        overlayPadding: "6px 10px", overlayFontSize: 10,
        infoLeft: 2,
        starSize: 12, ratingFont: 11,
        nameFont: "clamp(13px, 3.5vw, 14px)", nameHeight: "2.7em",
        priceFont: "clamp(14px, 4vw, 16px)",
        comparePriceFont: 12,
        sizeFont: 9, maxSizes: 5,
        ctaHeight: 42, ctaFont: 11,
        ctaIconSize: 14,
        reviewPadding: "16px",
        reviewMarginTop: 14,
        reviewBigFont: 26,
        reviewStarSize: 14,
        reviewMetaFont: 11,
        reviewLinkFont: 11,
        reviewAvatarSize: 28, reviewAvatarFont: 11,
        reviewAuthorFont: 12, reviewCommentFont: 12,
        reviewGap: 12,
        reviewItemPadding: 12,
      };

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
        flexDirection: "column",
        // Ensure the card never overflows its grid cell on mobile
        minWidth: 0,
        width: "100%",
      }}
    >
      {/* ── Imagen ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: r.imageRadius,
          marginBottom: r.imageMarginBottom,
          background: "#f5f4f2",
          aspectRatio: "3/4",
          // Prevent image from breaking layout on very small screens
          width: "100%",
        }}
      >
        <Link to={`/producto/${product.slug}`}>
          <motion.img
            src={optimizeSupabaseImage(product.image_url, { width: isMobile ? 400 : 600 })}
            srcSet={getSupabaseSrcSet(product.image_url, isMobile ? [200, 400, 600] : [400, 600, 800])}
            sizes="(max-width: 768px) 50vw, 33vw"
            alt={product.name}
            loading="lazy"
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

        {/* Badges ── left column */}
        <div
          style={{
            position: "absolute",
            top: r.badgeTop,
            left: r.badgeLeft,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {hasDiscount && (
            <span
              style={{
                background: "#bb3838",
                color: "#fff",
                fontSize: r.badgeFontSize,
                fontWeight: 800,
                padding: r.badgePadding,
                borderRadius: 4,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              -{discountPct}%
            </span>
          )}
          {product.metadata?.is_new && (
            <span
              style={{
                background: "#111",
                color: "#fff",
                fontSize: r.badgeFontSize,
                fontWeight: 800,
                padding: r.badgePadding,
                borderRadius: 4,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Nuevo
            </span>
          )}
        </div>

        {/* Stock badge ── right-top */}
        {product.stock > 0 && product.stock <= product.low_stock_threshold && (
          <span
            style={{
              position: "absolute",
              top: r.badgeTop,
              right: r.badgeRight,
              background: "#f97316",
              color: "#fff",
              fontSize: r.badgeFontSize,
              fontWeight: 800,
              padding: r.badgePadding,
              borderRadius: 4,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Últimas {product.stock}
          </span>
        )}

        {/* Agotado overlay */}
        {product.stock === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: r.imageRadius,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: r.badgeFontSize,
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Agotado
            </span>
          </div>
        )}

        {/* Favorito ── right-bottom */}
        <motion.button
          onClick={handleToggleFavorite}
          whileHover={!isMobile ? { scale: 1.12 } : {}}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "absolute",
            bottom: r.overlayBottom,
            right: r.badgeRight,
            width: r.favSize,
            height: r.favSize,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            zIndex: 10,
            // Prevent button from getting too small via touch target
            minWidth: 32,
            minHeight: 32,
          }}
        >
          <Heart
            size={r.favIconSize}
            style={{
              fill: favorite ? "#ef4444" : "transparent",
              color: favorite ? "#ef4444" : "#555",
              transition: "all 0.2s",
            }}
          />
        </motion.button>

        {/* Ver producto ── left-bottom */}
        <Link to={`/producto/${product.slug}`}>
          <motion.div
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={!isMobile ? { opacity: 1, y: 0 } : {}}
            style={{
              position: "absolute",
              bottom: r.overlayBottom,
              left: r.overlayLeft,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              borderRadius: 6,
              padding: r.overlayPadding,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: r.overlayFontSize,
              fontWeight: 700,
              color: "#111",
              cursor: "pointer",
              letterSpacing: "0.03em",
              boxShadow: isMobile ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              // Keep pill within image even on very small cards
              maxWidth: "calc(100% - 60px)",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <Eye size={isMobile ? 11 : 12} style={{ flexShrink: 0 }} />
            <span>Ver</span>
          </motion.div>
        </Link>
      </div>

      {/* ── Info ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          paddingLeft: r.infoLeft,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          // Prevent any child from stretching outside card width
          minWidth: 0,
        }}
      >
        {/* Nombre */}
        <Link to={`/producto/${product.slug}`} style={{ textDecoration: "none" }}>
          <h3
            style={{
              fontSize: r.nameFont,
              fontWeight: 600,
              color: "#111",
              marginBottom: 2,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              height: r.nameHeight,
              // Clip long words on tiny cards
              wordBreak: "break-word",
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Precio */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            marginBottom: isMobile ? 2 : 4,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: r.priceFont,
              fontWeight: 900,
              color: "#111",
              whiteSpace: "nowrap",
            }}
          >
            {format(product.price)}
          </span>
          {hasDiscount && (
            <span
              style={{
                fontSize: r.comparePriceFont,
                color: "#9ca3af",
                textDecoration: "line-through",
                whiteSpace: "nowrap",
              }}
            >
              {format(product.compare_price!)}
            </span>
          )}
        </div>

        {/* Rating */}
        <button
          onClick={() => setShowReviews(v => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginBottom: isMobile ? 6 : 8,
            // Ensure text doesn't overflow
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <StarRating rating={avgRating} size={r.starSize} />
          <span
            style={{
              fontSize: r.ratingFont,
              color: "#9ca3af",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {avgRating.toFixed(1)}
          </span>
        </button>

        {/* Tallas */}
        {product.metadata?.sizes?.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              marginBottom: isMobile ? 10 : 12,
            }}
          >
            {product.metadata.sizes.slice(0, r.maxSizes).map((s: string) => (
              <span
                key={s}
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#777",
                  border: "1px solid #eee",
                  borderRadius: 3,
                  padding: "1px 4px",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </span>
            ))}
            {isMobile && product.metadata.sizes.length > 3 && (
              <span style={{ fontSize: 9, color: "#999", alignSelf: "center" }}>
                +{product.metadata.sizes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Push CTA to bottom */}
        <div style={{ flex: 1 }} />

        {/* CTA */}
        <Link
          to={`/producto/${product.slug}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            height: r.ctaHeight,
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: r.ctaFont,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
            textDecoration: "none",
            marginTop: 4,
            width: "100%",
            // Prevent button from shrinking below readable size
            minHeight: 32,
            boxSizing: "border-box",
          }}
          onMouseEnter={e => {
            if (!isMobile) {
              (e.currentTarget as HTMLAnchorElement).style.background = "#333";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={e => {
            if (!isMobile) {
              (e.currentTarget as HTMLAnchorElement).style.background = "#111";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }
          }}
        >
          <Eye size={r.ctaIconSize} />
          {isMobile ? "Ver" : "Detalles"}
        </Link>
      </div>

      {/* ── Panel de reseñas ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showReviews && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: r.reviewMarginTop,
                padding: r.reviewPadding,
                background: "#fafafa",
                borderRadius: 12,
                border: "1px solid #f0f0f0",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: isMobile ? 10 : 14,
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8 }}>
                  <span
                    style={{
                      fontSize: r.reviewBigFont,
                      fontWeight: 900,
                      color: "#111",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {avgRating.toFixed(1)}
                  </span>
                  <div>
                    <StarRating rating={avgRating} size={r.reviewStarSize} />
                    <span
                      style={{
                        fontSize: r.reviewMetaFont,
                        color: "#9ca3af",
                        marginTop: 2,
                        display: "block",
                      }}
                    >
                      {reviewCount} reseñas
                    </span>
                  </div>
                </div>
                <Link
                  to={`/producto/${product.slug}#reviews`}
                  style={{
                    fontSize: r.reviewLinkFont,
                    fontWeight: 700,
                    color: "#111",
                    textDecoration: "underline",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Ver todas →
                </Link>
              </div>

              {/* Lista */}
              <div style={{ display: "flex", flexDirection: "column", gap: r.reviewGap }}>
                {reviews.slice(0, 2).map(review => (
                  <div
                    key={review.id}
                    style={{
                      paddingBottom: r.reviewItemPadding,
                      borderBottom: "1px solid #ebebeb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4,
                        gap: 6,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                        <div
                          style={{
                            width: r.reviewAvatarSize,
                            height: r.reviewAvatarSize,
                            borderRadius: "50%",
                            background: "#111",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: r.reviewAvatarFont,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {review.author[0]}
                        </div>
                        <span
                          style={{
                            fontSize: r.reviewAuthorFont,
                            fontWeight: 700,
                            color: "#111",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {review.author}
                        </span>
                      </div>
                      <span style={{ fontSize: 9, color: "#bbb", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {review.date}
                      </span>
                    </div>
                    <StarRating rating={review.rating} size={isMobile ? 10 : 11} />
                    <p
                      style={{
                        fontSize: r.reviewCommentFont,
                        color: "#555",
                        lineHeight: 1.4,
                        marginTop: 4,
                        // Avoid line overflow on narrow cards
                        wordBreak: "break-word",
                      }}
                    >
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