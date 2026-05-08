// src/pages/Favoritos.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useFavorites, FavoriteProduct } from "@/hooks/useFavorites";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";

/* ─── Ticker ──────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "MIS FAVORITOS", "PRENDAS GUARDADAS",
  "LISTA DE DESEOS", "MI SELECCIÓN", "COLECCIÓN PERSONAL",
];

const Ticker = () => (
  <div style={{ background: "#111", overflow: "hidden", padding: "8px 0" }}>
    <motion.div
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      style={{ display: "flex", whiteSpace: "nowrap" }}
    >
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
        <span key={i} style={{
          fontSize: 9, fontWeight: 800, letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.4)", padding: "0 28px",
          fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
        }}>
          {t} <span style={{ color: "rgba(255,255,255,0.15)", marginLeft: 16 }}>✦</span>
        </span>
      ))}
    </motion.div>
  </div>
);

/* ─── Skeleton ────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{
    background: "#fff", border: "1.5px solid #f0f0f0",
    borderRadius: 20, overflow: "hidden",
  }}>
    <div style={{
      aspectRatio: "3/4", background: "#f5f5f5",
      animation: "fav-pulse 1.5s ease-in-out infinite",
    }} />
    <div style={{ padding: 18 }}>
      {[50, 80, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 1 ? 14 : 10,
          width: `${w}%`, background: "#f0f0f0",
          borderRadius: 6, marginBottom: 8,
          animation: "fav-pulse 1.5s ease-in-out infinite",
        }} />
      ))}
    </div>
  </div>
);

/* ─── FavCard ─────────────────────────────────────────────── */
const FavCard = ({
  fav, index, onRemove, onAddToCart, format,
}: {
  fav: FavoriteProduct;
  index: number;
  onRemove: (productId: string) => void;
  onAddToCart: (product: any) => void;
  format: (n: number) => string;
}) => {
  const p = fav.product;
  if (!p) return null;

  const hasDiscount = p.compare_price != null && p.compare_price > p.price;
  const discountPct = hasDiscount
    ? Math.round(((p.compare_price! - p.price) / p.compare_price!) * 100)
    : 0;
  const outOfStock = p.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: index * 0.04 }}
      style={{
        background: "#fff", border: "1.5px solid #f0f0f0",
        borderRadius: 20, overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Image ── */}
      <div style={{
        position: "relative", aspectRatio: "3/4",
        background: "#f5f4f2", overflow: "hidden",
      }}>
        <Link to={`/producto/${p.slug}`}>
          <motion.img
            src={p.image_url || "/assets/placeholder.svg"}
            alt={p.name}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </Link>

        {/* Badges */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          display: "flex", flexDirection: "column", gap: 5,
        }}>
          {hasDiscount && (
            <span style={{
              background: "#bb3838", color: "#fff",
              fontSize: 10, fontWeight: 800,
              padding: "3px 8px", borderRadius: 6,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              -{discountPct}%
            </span>
          )}
          {outOfStock && (
            <span style={{
              background: "#555", color: "#fff",
              fontSize: 10, fontWeight: 800,
              padding: "3px 8px", borderRadius: 6, textTransform: "uppercase",
            }}>
              Agotado
            </span>
          )}
        </div>

        {/* Heart remove */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => onRemove(p.id)}
          title="Quitar de favoritos"
          style={{
            position: "absolute", top: 12, right: 12,
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
          }}
        >
          <Heart size={15} style={{ fill: "#ef4444", color: "#ef4444" }} />
        </motion.button>
      </div>

      {/* ── Info ── */}
      <div style={{ padding: "16px 18px 18px" }}>
        {p.categories?.name && (
          <p style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.16em",
            color: "#bbb", textTransform: "uppercase",
            fontFamily: "'DM Sans', sans-serif", marginBottom: 5,
          }}>
            {p.categories.name}
          </p>
        )}

        <Link to={`/producto/${p.slug}`} style={{ textDecoration: "none" }}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: "#111",
            lineHeight: 1.3, letterSpacing: "-0.01em",
            fontFamily: "'DM Sans', sans-serif", marginBottom: 8,
          }}>
            {p.name}
          </h3>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{
            fontSize: 16, fontWeight: 900, color: "#111",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {format(p.price)}
          </span>
          {hasDiscount && (
            <span style={{
              fontSize: 12, color: "#bbb",
              textDecoration: "line-through",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {format(p.compare_price!)}
            </span>
          )}
        </div>

        {/* Sizes preview */}
        {p.metadata?.sizes?.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
            {(p.metadata.sizes as string[]).slice(0, 5).map(s => (
              <span key={s} style={{
                fontSize: 10, fontWeight: 700, color: "#555",
                border: "1px solid #e5e7eb", borderRadius: 5,
                padding: "2px 7px", letterSpacing: "0.04em",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            to={`/producto/${p.slug}`}
            style={{
              flex: 1, padding: "10px 0",
              background: "#111",
              color: "#fff",
              border: "none", borderRadius: 10,
              cursor: "pointer",
              fontSize: 11, fontWeight: 800,
              letterSpacing: "0.07em", textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "background 0.18s",
              textDecoration: "none"
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#333";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#111";
            }}
          >
            <ArrowRight size={13} />
            Ver producto
          </Link>

          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(p.id)}
            title="Eliminar de favoritos"
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: "#fef2f2", border: "1.5px solid #fecaca",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.18s",
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
          >
            <Trash2 size={14} color="#ef4444" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Empty state ─────────────────────────────────────────── */
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "80px 24px", textAlign: "center",
    }}
  >
    <div style={{
      width: 80, height: 80, borderRadius: 24,
      background: "#fef2f2",
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: 24,
    }}>
      <Heart size={36} color="#fca5a5" />
    </div>
    <h2 style={{
      fontSize: 22, fontWeight: 900, color: "#111",
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: "-0.03em", marginBottom: 8,
    }}>
      Sin favoritos aún
    </h2>
    <p style={{
      fontSize: 14, color: "#aaa", fontFamily: "'DM Sans', sans-serif",
      lineHeight: 1.6, maxWidth: 300, marginBottom: 32,
    }}>
      Dale al corazón en cualquier prenda para guardarla aquí y encontrarla fácil.
    </p>
    <Link
      to="/tienda"
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "12px 28px", borderRadius: 100,
        background: "#111", color: "#fff",
        fontSize: 12, fontWeight: 800,
        letterSpacing: "0.07em", textTransform: "uppercase",
        fontFamily: "'DM Sans', sans-serif", textDecoration: "none",
      }}
    >
      Explorar tienda <ArrowRight size={14} />
    </Link>
  </motion.div>
);

/* ─── Not logged in ───────────────────────────────────────── */
const NotLoggedIn = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "80px 24px", textAlign: "center",
    }}
  >
    <div style={{
      width: 80, height: 80, borderRadius: 24,
      background: "#f5f5f5",
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: 24,
    }}>
      <Heart size={36} color="#ccc" />
    </div>
    <h2 style={{
      fontSize: 22, fontWeight: 900, color: "#111",
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: "-0.03em", marginBottom: 8,
    }}>
      Inicia sesión para ver tus favoritos
    </h2>
    <p style={{
      fontSize: 14, color: "#aaa", fontFamily: "'DM Sans', sans-serif",
      lineHeight: 1.6, maxWidth: 300, marginBottom: 32,
    }}>
      Guarda tus prendas favoritas y accédelas desde cualquier dispositivo.
    </p>
    <Link
      to="/tienda"
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "12px 28px", borderRadius: 100,
        background: "#111", color: "#fff",
        fontSize: 12, fontWeight: 800,
        letterSpacing: "0.07em", textTransform: "uppercase",
        fontFamily: "'DM Sans', sans-serif", textDecoration: "none",
      }}
    >
      Ver tienda <ArrowRight size={14} />
    </Link>
  </motion.div>
);

/* ═══════════════════ MAIN PAGE ══════════════════════════════ */
const Favoritos = () => {
  const { user } = useAuth();
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const { addItem, setIsOpen } = useCart();
  const { format } = useCurrency();

  // Inject styles once — avoids React DOM crash from inline <style>
  useEffect(() => {
    const id = "fav-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,300&display=swap');
      @keyframes fav-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      @media(max-width:1024px){ .fav-grid{ grid-template-columns: repeat(3,1fr) !important; } }
      @media(max-width:640px){
        .fav-grid{ grid-template-columns: repeat(2,1fr) !important; }
        .fav-title{ font-size: clamp(32px,9vw,60px) !important; }
      }
      @media(max-width:380px){ .fav-grid{ grid-template-columns: 1fr !important; } }
    `;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleAddToCart = async (product: any) => {
    try { 
      await addItem(product); 
      setIsOpen(true); // Abre el carrito para dar feedback visual
    } catch (e) { 
      console.error(e); 
    }
  };

  const count = favorites.length;

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div>
        <Ticker />

        {/* ── Hero ── */}
        <div style={{ padding: "60px 24px 65px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "0.2em",
                color: "#bbb", fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase", marginBottom: 12,
              }}
            >
              ✦ Mi colección
            </motion.p>

            <motion.h1
              className="fav-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
              style={{
                fontSize: "clamp(40px, 6.5vw, 76px)",
                fontWeight: 900, color: "#111",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 16,
              }}
            >
              Favoritos
              <span style={{
                fontStyle: "italic", fontWeight: 300, color: "#ccc",
                display: "block", fontSize: "0.54em", marginTop: 4,
              }}>
                guardados
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22 }}
              style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}
            >
              {user && !isLoading && (
                <span style={{
                  fontSize: 13, color: "#aaa",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {count === 0
                    ? "No tienes prendas guardadas"
                    : `${count} ${count === 1 ? "prenda guardada" : "prendas guardadas"}`}
                </span>
              )}
              {count > 0 && (
                <Link
                  to="/tienda"
                  style={{
                    fontSize: 11, fontWeight: 800, color: "#111",
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: 5,
                    borderBottom: "1.5px solid #111", paddingBottom: 1,
                  }}
                >
                  Seguir comprando <ArrowRight size={12} />
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "50px 24px 100px" }}>

          {!user && <NotLoggedIn />}

          {user && isLoading && (
            <div
              className="fav-grid"
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
                gap: "clamp(12px, 3vw, 24px)" 
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {user && !isLoading && count === 0 && <EmptyState />}

          {user && !isLoading && count > 0 && (
            <div
              className="fav-grid"
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
                gap: "clamp(12px, 3vw, 24px)" 
              }}
            >
              {favorites.map((fav, i) => (
                <FavCard
                  key={fav.id}
                  fav={fav}
                  index={i}
                  onRemove={removeFavorite}
                  onAddToCart={handleAddToCart}
                  format={format}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Favoritos;