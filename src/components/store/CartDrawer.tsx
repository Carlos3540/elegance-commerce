// src/components/store/CartDrawer.tsx
import { useState } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, LogIn } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useCurrency } from "@/hooks/useCurrency";
import LoginDialog from "@/components/auth/LoginDialog";

const CartDrawer = () => {
  const {
    items, isOpen, setIsOpen,
    removeItem, updateQuantity,
    subtotal, total, // Removido 'tax' que no se utilizaba
    isLoading, isGuest,
  } = useCart();

  const { format } = useCurrency();
  const navigate    = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  // 💥 SOLUCIÓN AL BUG: Función controladora para evitar colisiones de rutas y animaciones
  const handleCheckoutNavigation = (targetPath: string) => {
    // 1. Cerramos el drawer primero para gatillar la animación de salida de Framer Motion de forma natural
    setIsOpen(false);
    
    // 2. Retrasamos la navegación sutilmente para darle tiempo a React de procesar el desmontaje 
    // y evitar el bloqueo de operaciones en caché/renderizado del hilo principal.
    setTimeout(() => {
      navigate(targetPath);
    }, 200); 
  };

  return (
    <>
    <AnimatePresence mode="wait"> {/* 🔥 Optimización: "mode wait" fuerza a terminar animaciones antes de desmontar */}
      {isOpen && (
        <motion.div
          key="cart-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, backdropFilter: "blur(2px)" }}
          onClick={() => setIsOpen(false)}
        />
      )}
      {isOpen && (
        <motion.div
          key="cart-drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 350 }} // Ajustado levemente para mayor suavidad
          style={{
            position: "fixed", right: 0, top: 0,
            height: "100%", width: "100%", maxWidth: 420,
            background: "#fff", zIndex: 1000,
            display: "flex", flexDirection: "column",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShoppingBag size={18} style={{ color: "#111" }} />
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>
                Mi Carrito
              </h2>
              {items.length > 0 && (
                <span style={{ background: "#111", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 100 }}>
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            <button onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#111")}
              onMouseLeave={e => (e.currentTarget.style.color = "#888")}
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Banner guest ── */}
          {isGuest && items.length > 0 && (
            <div style={{ background: "#fdf8f0", borderBottom: "1px solid #f5e8cc", padding: "12px 24px", display: "flex", alignItems: "center", gap: 10 }}>
              <LogIn size={15} style={{ color: "#b45309", flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.45 }}>
                <strong>Inicia sesión</strong> para guardar tu carrito y finalizar la compra.{" "}
                <button
                  onClick={() => { setIsOpen(false); setLoginOpen(true); }}
                  style={{ color: "#b45309", fontWeight: 700, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0, fontFamily: "inherit" }}
                >
                  Entrar →
                </button>
              </p>
            </div>
          )}

          {/* ── Items ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {isLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
                <div style={{ width: 28, height: 28, border: "2px solid #e5e7eb", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              </div>
            ) : items.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, textAlign: "center" }}>
                <ShoppingBag size={48} style={{ color: "#d1d5db", marginBottom: 16 }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 6 }}>Tu carrito está vacío</p>
                <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 28 }}>Agrega productos para comenzar</p>
                <button onClick={() => handleCheckoutNavigation('/tienda')} // 💥 Cambiado a la función segura
                  style={{ background: "#111", color: "#fff", padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Ver Tienda
                </button>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {items.map((item, index) => {
                    const product = item.product;
                    const imageUrl = product?.image_url || "/assets/placeholder.svg";
                    const productName = product?.name || "Producto";

                    return (
                      <motion.div
                        key={item.id || `item-${item.product_id}-${index}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 80, transition: { duration: 0.2 } }}
                        style={{ display: "flex", gap: 14 }}
                      >
                        {/* Imagen */}
                        <Link to={`/producto/${product?.slug || ""}`} onClick={() => setIsOpen(false)}
                          style={{ flexShrink: 0 }}>
                          <img src={imageUrl} alt={productName}
                            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid #f0f0f0", display: "block" }} />
                        </Link>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={`/producto/${product?.slug || ""}`} onClick={() => setIsOpen(false)}
                            style={{ textDecoration: "none" }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {productName}
                            </p>
                          </Link>
                          <p style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 10 }}>
                            {format(item.unit_price)}
                          </p>

                          {/* Controles cantidad */}
                          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb", borderRadius: "8px 0 0 8px", background: "#fff", cursor: "pointer", transition: "background 0.15s" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ width: 36, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", fontSize: 13, fontWeight: 700, color: "#111" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={product?.stock !== undefined && item.quantity >= product.stock}
                              style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb", borderRadius: "0 8px 8px 0", background: "#fff", cursor: "pointer", transition: "background 0.15s", opacity: product?.stock !== undefined && item.quantity >= product.stock ? 0.4 : 1 }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Subtotal item */}
                          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                            Subtotal: {format(item.unit_price * item.quantity)}
                          </p>
                        </div>

                        {/* Eliminar */}
                        <button onClick={() => removeItem(item.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", alignSelf: "flex-start", padding: 4, transition: "color 0.15s", flexShrink: 0 }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#d1d5db")}
                        >
                          <Trash2 size={15} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* ── Footer totales ── */}
          {items.length > 0 && (
            <div style={{ borderTop: "1px solid #f0f0f0", padding: "20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280" }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>{format(subtotal)}</span>
                </div>
                <div style={{ height: 1, background: "#f0f0f0", margin: "4px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#111" }}>
                  <span>Total</span>
                  <span>{format(total)}</span>
                </div>
              </div>

              {isGuest ? (
                <button
                  onClick={() => { setIsOpen(false); setLoginOpen(true); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 0", background: "#111", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  <LogIn size={15} /> Iniciar Sesión para Pagar
                </button>
              ) : (
                <button
                  onClick={() => handleCheckoutNavigation('/checkout')} // 💥 Cambiado aquí por la función segura
                  style={{ width: "100%", padding: "14px 0", background: "#111", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", cursor: "pointer", transition: "opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Proceder al Pago
                </button>
              )}

              <button onClick={() => setIsOpen(false)}
                style={{ width: "100%", padding: "11px 0", background: "transparent", color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 10, letterSpacing: "0.04em", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#111"; e.currentTarget.style.borderColor = "#111"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
              >
                Seguir Comprando
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

    <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};

export default CartDrawer;