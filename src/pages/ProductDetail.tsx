// src/pages/ProductDetail.tsx
import { useParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import {
  ShoppingCart, Heart, Star, Minus, Plus,
  ChevronRight, Check, AlertCircle, Send,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────
interface ProductImage {
  id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  color: string | null;
}

interface ReviewRow {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Review extends ReviewRow {
  authorName: string;
  authorAvatar: string | null;
}

// ── StarRating — pure CSS, sin framer para evitar removeChild ─────────────
const StarRating = ({
  value,
  onChange,
  size = 18,
  interactive = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  interactive?: boolean;
}) => {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || value) : value;
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={`star-${star}`}
          size={size}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{
            fill: display >= star ? "#f59e0b" : "transparent",
            color: display >= star ? "#f59e0b" : "#d1d5db",
            cursor: interactive ? "pointer" : "default",
            transition: "fill 0.1s, color 0.1s",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
};

// ── Avatar ─────────────────────────────────────────────────────────────────
const Avatar = ({ name, url, size = 36 }: { name: string; url?: string | null; size?: number }) => {
  const initials = name.split(" ").map((n) => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  return url ? (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1.5px solid #e5e7eb" }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: Math.round(size * 0.35), fontWeight: 700, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
      {initials}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
const ProductDetail = () => {
  const { id }                         = useParams<{ id: string }>();
  const { product, isLoading, error }  = useProduct(id ?? "");
  const { addItem, setIsOpen }         = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user }                       = useAuth();
  const { format }                     = useCurrency();
  const isMobile                       = useIsMobile();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize]         = useState<string | null>(null);
  const [selectedColor, setSelectedColor]       = useState<string | null>(null);
  const [qty, setQty]                           = useState(1);
  const [addedAnim, setAddedAnim]               = useState(false);
  const [sizeError, setSizeError]               = useState(false);

  // ── Images state ──────────────────────────────────────────────────────────
  const [allImages, setAllImages]         = useState<ProductImage[]>([]);
  const [displayImages, setDisplayImages] = useState<string[]>([]);

  // ── Reviews state ─────────────────────────────────────────────────────────
  const [reviews, setReviews]               = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userReview, setUserReview]         = useState<Review | null>(null);
  const [newRating, setNewRating]           = useState(0);
  const [newComment, setNewComment]         = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [submitSuccess, setSubmitSuccess]   = useState(false);
  const [reviewError, setReviewError]       = useState<string | null>(null);
  const [isAdding, setIsAdding]             = useState(false);

  // ── Fetch images (single query, filter client-side) ───────────────────────
  useEffect(() => {
    if (!product?.id) return;
    supabase
      .from("product_images")
      .select("id, url, alt_text, sort_order, is_primary, color")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })
      .then(({ data, error: err }) => {
        if (err) console.error("product_images error:", err.message);
        setAllImages((data as ProductImage[]) ?? []);
      });
  }, [product?.id]);

  // ── Derive displayed images when color or allImages changes ──────────────
  useEffect(() => {
    const fallback =
      allImages.length > 0
        ? allImages.map((i) => i.url)
        : product?.image_url
        ? [product.image_url]
        : ["/assets/placeholder.svg"];

    if (!selectedColor) {
      setDisplayImages(fallback);
      setSelectedImageIdx(0);
      return;
    }
    const matched = allImages.filter(
      (img) => img.color?.trim().toLowerCase() === selectedColor.trim().toLowerCase()
    );
    setDisplayImages(matched.length > 0 ? matched.map((i) => i.url) : fallback);
    setSelectedImageIdx(0);
  }, [selectedColor, allImages, product?.image_url]);

  // ── Fetch reviews — DOS QUERIES SEPARADAS para evitar el join roto ────────
  // El problema: reviews.user_id → auth.users (no public.profiles)
  // Supabase no puede resolver el join automático → 400.
  // Solución: 1) traer reviews, 2) traer profiles por los user_ids obtenidos.
  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;
    setReviewsLoading(true);

    try {
      // Paso 1: reseñas sin join
      const { data: rawReviews, error: reviewsErr } = await supabase
        .from("reviews")
        .select("id, user_id, rating, comment, created_at")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false });

      if (reviewsErr) throw reviewsErr;
      if (!rawReviews || rawReviews.length === 0) {
        setReviews([]);
        setReviewsLoading(false);
        return;
      }

      // Paso 2: perfiles de los autores
      const userIds = [...new Set((rawReviews as ReviewRow[]).map((r) => r.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .in("id", userIds);

      const profileMap: Record<string, { full_name: string; avatar_url: string | null; email: string }> = {};
      (profilesData ?? []).forEach((p: any) => { profileMap[p.id] = p; });

      // Paso 3: combinar — cadena: full_name → email (antes del @) → fallback
      const merged: Review[] = (rawReviews as ReviewRow[]).map((r) => {
        const profileInfo = profileMap[r.user_id];
        const fullName = profileInfo?.full_name?.trim();
        const emailPart = profileInfo?.email?.split("@")[0]?.replace(/[._-]/g, " ");
        return {
          ...r,
          authorName:   fullName || emailPart || "Cliente Evolet",
          authorAvatar: profileInfo?.avatar_url || null,
        };
      });

      setReviews(merged);

      if (user) {
        const mine = merged.find((r) => r.user_id === user.id) ?? null;
        setUserReview(mine);
        if (mine) { setNewRating(mine.rating); setNewComment(mine.comment); }
      }
    } catch (err: any) {
      console.error("fetchReviews error:", err.message);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [product?.id, user]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const sizes       = (product?.metadata?.sizes  as string[]) ?? [];
  const colors      = (product?.metadata?.colors as string[]) ?? [];
  const favorite    = isFavorite(product?.id ?? "");
  const inStock     = (product?.stock ?? 0) > 0;
  const hasDiscount = !!(product?.compare_price && product.compare_price > product.price);
  const discountPct = hasDiscount ? Math.round((1 - product!.price / product!.compare_price!) * 100) : 0;
  const needsSize   = sizes.length > 0;
  const avgRating   = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const currentImage = displayImages[selectedImageIdx] ?? displayImages[0] ?? "/assets/placeholder.svg";

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (needsSize && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2500);
      return;
    }
    setIsAdding(true);
    try {
      await addItem(product!, qty);
      setAddedAnim(true);
      setTimeout(() => { setAddedAnim(false); setIsOpen(true); }, 900);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !product) return;
    await toggleFavorite(product.id);
  };

  // FIX #4 upsert — sin join roto, sin 409
  const handleSubmitReview = async () => {
    setReviewError(null);
    if (!user)              { setReviewError("Debes iniciar sesión para dejar una reseña."); return; }
    if (newRating === 0)    { setReviewError("Selecciona una calificación (1-5 estrellas)."); return; }
    if (!newComment.trim()) { setReviewError("Escribe un comentario antes de publicar."); return; }

    setSubmitting(true);
    try {
      const { error: upsertErr } = await supabase
        .from("reviews")
        .upsert(
          { product_id: product!.id, user_id: user.id, rating: newRating, comment: newComment.trim() },
          { onConflict: "product_id,user_id" }
        );
      if (upsertErr) throw upsertErr;

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      // Re-fetch DESPUÉS de que Supabase confirme — sin tocar el DOM antes
      await fetchReviews();
    } catch (err: any) {
      console.error("review submit error:", err.message);
      setReviewError(err.message ?? "Error al enviar la reseña.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / error ────────────────────────────────────────────────────────
  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 140 }}>
        <div style={{ width: 36, height: 36, border: "2.5px solid #e5e7eb", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !product) return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center", paddingTop: 140 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 16 }}>Producto no encontrado</p>
        <Link to="/tienda" style={{ color: "#111", fontSize: 14, textDecoration: "underline" }}>Volver a la tienda</Link>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes imgFade { from { opacity:0; transform:scale(0.99); } to { opacity:1; transform:scale(1); } }
        .thumb-btn:hover  { border-color: #6b7280 !important; }
        .size-btn:hover   { background: #f3f4f6 !important; }
        .color-btn:hover  { border-color: #6b7280 !important; }
        .fav-btn:hover    { border-color: #fca5a5 !important; background: #fff1f2 !important; }
        .cta-btn:hover    { opacity: 0.88; }
        .submit-btn:hover { background: #222 !important; }
        .review-ta:focus  { outline: none; border-color: #111 !important; }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af" }}>
          <Link to="/"       style={{ color: "#9ca3af", textDecoration: "none" }}>Inicio</Link>
          <ChevronRight size={12} />
          <Link to="/tienda" style={{ color: "#9ca3af", textDecoration: "none" }}>Tienda</Link>
          {product.categories && (
            <>
              <ChevronRight size={12} />
              <Link to={`/tienda?categoria=${product.categories.slug}`} style={{ color: "#9ca3af", textDecoration: "none" }}>
                {product.categories.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span style={{ color: "#111", fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: isMobile ? "16px 16px 0" : "28px 28px 0" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) minmax(0,1fr)", 
          gap: isMobile ? 32 : 60, 
          alignItems: "start" 
        }}>

          {/* LEFT — Gallery */}
          <div>
            <div style={{ 
              position: "relative", 
              borderRadius: isMobile ? 16 : 20, 
              overflow: "hidden", 
              background: "#f0ede8", 
              aspectRatio: "3 / 4", 
              marginBottom: isMobile ? 10 : 14 
            }}>
              {/* key={currentImage} dispara CSS animation, sin framer → sin removeChild */}
              <img
                key={currentImage}
                src={currentImage}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: 16, boxSizing: "border-box", animation: "imgFade 0.22s ease" }}
              />
              {!inStock && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase" }}>Agotado</span>
                </div>
              )}
              {hasDiscount && (
                <span style={{ position: "absolute", top: 14, left: 14, background: "#bb3838", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase" }}>
                  -{discountPct}%
                </span>
              )}
            </div>

            {displayImages.length > 1 && (
              <div style={{ 
                display: "flex", 
                gap: 8, 
                flexWrap: isMobile ? "nowrap" : "wrap",
                overflowX: isMobile ? "auto" : "visible",
                paddingBottom: isMobile ? 8 : 0,
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none"
              }}>
                {displayImages.map((imgUrl, idx) => {
                  const record = allImages.find((img) => img.url === imgUrl);
                  const stableKey = record ? `thumb-${record.id}` : `thumb-url-${idx}`;
                  return (
                    <button key={stableKey} className="thumb-btn" onClick={() => setSelectedImageIdx(idx)}
                      style={{ 
                        width: isMobile ? 64 : 76, 
                        height: isMobile ? 64 : 76, 
                        flexShrink: 0, 
                        borderRadius: 12, 
                        overflow: "hidden", 
                        border: `2px solid ${selectedImageIdx === idx ? "#111" : "#e5e7eb"}`, 
                        cursor: "pointer", 
                        padding: 0, 
                        background: "#f0ede8", 
                        transition: "border-color 0.15s" 
                      }}>
                      <img src={imgUrl} alt={`Vista ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT — Info */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} style={{ paddingTop: 4 }}>

            {product.categories && (
              <p style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>
                {product.categories.name}
              </p>
            )}

            <h1 style={{ 
              fontSize: isMobile ? 24 : 28, 
              fontWeight: 900, 
              color: "#111", 
              letterSpacing: "-0.03em", 
              lineHeight: 1.15, 
              marginBottom: 12 
            }}>
              {product.name}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <StarRating value={Math.round(avgRating)} size={15} />
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {reviews.length > 0 ? `${avgRating.toFixed(1)} · ${reviews.length} ${reviews.length === 1 ? "reseña" : "reseñas"}` : "Sin reseñas aún"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <span style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, color: "#111", letterSpacing: "-0.03em" }}>{format(product.price)}</span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: isMobile ? 15 : 17, color: "#9ca3af", textDecoration: "line-through" }}>{format(product.compare_price!)}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, background: "#fee2e2", color: "#bb3838", padding: "3px 9px", borderRadius: 7 }}>-{discountPct}%</span>
                </>
              )}
            </div>

            {product.description && (
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, marginBottom: 24 }}>{product.description}</p>
            )}

            {/* Sizes */}
            {needsSize && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#111", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Talla{selectedSize && <span style={{ color: "#6b7280", fontWeight: 600, marginLeft: 6 }}>— {selectedSize}</span>}
                  </p>
                  {sizeError && <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>Elige una talla</span>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {sizes.map((s, sIdx) => (
                    <button key={`size-${s}-${sIdx}`} className="size-btn" onClick={() => setSelectedSize(s)}
                      style={{ minWidth: 48, height: 48, padding: "0 12px", border: `2px solid ${selectedSize === s ? "#111" : sizeError ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: selectedSize === s ? "#fff" : "#111", background: selectedSize === s ? "#111" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#111", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
                  Color{selectedColor && <span style={{ color: "#6b7280", fontWeight: 600, marginLeft: 6 }}>— {selectedColor}</span>}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {colors.map((c, cIdx) => (
                    <button key={`color-${c}-${cIdx}`} className="color-btn" onClick={() => setSelectedColor(selectedColor === c ? null : c)}
                      style={{ padding: "7px 16px", border: `2px solid ${selectedColor === c ? "#111" : "#e5e7eb"}`, borderRadius: 100, fontSize: 12, fontWeight: 600, color: selectedColor === c ? "#fff" : "#555", background: selectedColor === c ? "#111" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <p style={{ fontSize: 13, marginBottom: 22 }}>
              <span style={{ fontWeight: 700, color: inStock ? "#16a34a" : "#ef4444" }}>
                {inStock ? `✓ ${product.stock} disponibles` : "✗ Agotado"}
              </span>
              {inStock && product.stock <= product.low_stock_threshold && (
                <span style={{ color: "#f97316", fontWeight: 700, marginLeft: 10 }}>¡Últimas unidades!</span>
              )}
            </p>

            {/* Qty */}
            {inStock && (
              <div style={{ display: "flex", alignItems: "center", marginBottom: 22, width: "fit-content" }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 42, height: 46, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #e5e7eb", borderRadius: "10px 0 0 10px", background: "#fff", cursor: "pointer" }}><Minus size={14} /></button>
                <span style={{ width: 52, height: 46, display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1.5px solid #e5e7eb", borderBottom: "1.5px solid #e5e7eb", fontSize: 15, fontWeight: 800, color: "#111" }}>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} style={{ width: 42, height: 46, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #e5e7eb", borderRadius: "0 10px 10px 0", background: "#fff", cursor: "pointer" }}><Plus size={14} /></button>
              </div>
            )}

            {/* Special order banner */}
            <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 12, padding: "13px 16px", marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AlertCircle size={17} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12.5, color: "#92400e", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ fontWeight: 800 }}>Aviso:</strong> Este producto se fabrica bajo pedido. El tiempo estimado de entrega es de{" "}
                <strong style={{ fontWeight: 800 }}>8 a 10 días hábiles</strong>, sujeto a disponibilidad de stock. Agradecemos su comprensión.
              </p>
            </div>

            {/* CTA */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <button 
                onClick={handleAddToCart} 
                disabled={!inStock || isAdding} 
                className="cta-btn"
                style={{ 
                  flex: 1, 
                  padding: "15px 0", 
                  background: addedAnim ? "#16a34a" : inStock ? "#111" : "#e5e7eb", 
                  color: !inStock ? "#9ca3af" : "#fff", 
                  border: "none", 
                  borderRadius: 12, 
                  fontSize: 13, 
                  fontWeight: 800, 
                  letterSpacing: "0.07em", 
                  textTransform: "uppercase", 
                  cursor: inStock ? "pointer" : "not-allowed", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: 8, 
                  transition: "background 0.25s, opacity 0.2s" 
                }}
              >
                {addedAnim ? (
                  <span key="added" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Check size={16} /> ¡Agregado!
                  </span>
                ) : (
                  <span key="normal" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ShoppingCart size={16} /> {inStock ? "Agregar al carrito" : "Sin stock"}
                  </span>
                )}
              </button>
              <button onClick={handleToggleFavorite} className="fav-btn"
                style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${favorite ? "#fecaca" : "#e5e7eb"}`, borderRadius: 12, background: favorite ? "#fff1f2" : "#fff", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}>
                <Heart size={18} style={{ fill: favorite ? "#ef4444" : "transparent", color: favorite ? "#ef4444" : "#9ca3af" }} />
              </button>
            </div>

            {product.sku && <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>Ref: {product.sku}</p>}
            {product.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {product.tags.map((tag: string, tIdx: number) => (
                  <span key={`tag-${tag}-${tIdx}`} style={{ fontSize: 10, color: "#9ca3af", border: "1px solid #e5e7eb", padding: "2px 9px", borderRadius: 6 }}>{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ══ REVIEWS ══════════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1240, margin: isMobile ? "40px auto 60px" : "72px auto 80px", padding: isMobile ? "0 16px" : "0 28px" }}>
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: isMobile ? 32 : 52 }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) minmax(0,2fr)", 
            gap: isMobile ? 40 : 56, 
            alignItems: "start" 
          }}>

            {/* Summary */}
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#111", letterSpacing: "-0.02em", marginBottom: 16 }}>Reseñas</p>
              {reviews.length > 0 ? (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: isMobile ? 42 : 54, fontWeight: 900, color: "#111", letterSpacing: "-0.04em", lineHeight: 1 }}>{avgRating.toFixed(1)}</span>
                    <span style={{ fontSize: 14, color: "#9ca3af" }}>/ 5</span>
                  </div>
                  <StarRating value={Math.round(avgRating)} size={20} />
                  <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8, marginBottom: 22 }}>
                    Basado en {reviews.length} {reviews.length === 1 ? "opinión" : "opiniones"}
                  </p>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct   = Math.round((count / reviews.length) * 100);
                    return (
                      <div key={`bar-${star}`} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#6b7280", width: 10, textAlign: "right" }}>{star}</span>
                        <Star size={11} style={{ fill: "#f59e0b", color: "#f59e0b", flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#9ca3af", width: 30 }}>{pct}%</span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.65 }}>Aún no hay reseñas. ¡Sé el primero en opinar!</p>
              )}
            </div>

            {/* Form + list */}
            <div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "22px 24px", marginBottom: 28 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 16 }}>
                  {userReview ? "Tu reseña" : "Deja tu opinión"}
                </p>
                {!user ? (
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>
                    <Link to="/login" style={{ color: "#111", fontWeight: 700 }}>Inicia sesión</Link> para dejar una reseña.
                  </p>
                ) : (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Calificación</p>
                      <StarRating value={newRating} onChange={setNewRating} size={26} interactive />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Comentario</p>
                      <textarea className="review-ta" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                        placeholder="¿Qué te pareció el producto? Comparte tu experiencia..." rows={3}
                        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#111", resize: "vertical", boxSizing: "border-box" }} />
                    </div>
                    {reviewError && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>⚠ {reviewError}</p>}
                    <button 
                      onClick={handleSubmitReview} 
                      disabled={submitting || submitSuccess} 
                      className="submit-btn"
                      style={{ 
                        padding: "10px 22px", 
                        background: submitSuccess ? "#16a34a" : "#111", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: 10, 
                        fontSize: 13, 
                        fontWeight: 800, 
                        cursor: submitting || submitSuccess ? "default" : "pointer", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 8, 
                        opacity: submitting ? 0.7 : 1, 
                        transition: "background 0.2s" 
                      }}
                    >
                      {submitSuccess ? (
                        <span key="success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Check size={15} /> ¡Gracias por tu reseña!
                        </span>
                      ) : submitting ? (
                        <span key="loading">Enviando...</span>
                      ) : (
                        <span key="idle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Send size={14} /> {userReview ? "Actualizar reseña" : "Publicar reseña"}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* List — divs planos con key para estabilidad */}
              {reviewsLoading ? (
                <div key="loading-reviews" style={{ textAlign: "center", padding: "28px 0" }}>
                  <div style={{ width: 28, height: 28, margin: "0 auto", border: "2px solid #e5e7eb", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                </div>
              ) : (
                <div key="reviews-list" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {reviews.map((review) => (
                    <div key={review.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <Avatar name={review.authorName} url={review.authorAvatar} size={36} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 800, color: "#111", margin: 0 }}>
                              {review.authorName}
                              {user?.id === review.user_id && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", background: "#f3f4f6", padding: "1px 7px", borderRadius: 5, marginLeft: 8 }}>Tú</span>
                              )}
                            </p>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>
                              {new Date(review.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <StarRating value={review.rating} size={13} />
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, margin: "0 0 0 46px" }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;