// src/components/store/Navbar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Menu, X, Search, ArrowRight, LogOut, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "@/components/auth/UserMenu";
import LoginDialog from "@/components/auth/LoginDialog";
import logoImg from "@/assets/logo.png";

const NAV_LINKS = [
  { label: "Inicio",   path: "/" },
  { label: "Tienda",   path: "/tienda" },
  { label: "Blog",     path: "/blog" },
  { label: "Contacto", path: "/contacto" },
];

// ── Heights (keep in sync with the spacer below) ───────────────
const NAV_H_DESKTOP_HERO  = 104;
const NAV_H_DESKTOP_SOLID = 92;
const NAV_H_MOBILE        = 76;

/* ── Search overlay ───────────────────────────────────────────── */
const SearchOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 80); }
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/tienda?search=${encodeURIComponent(q)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="sb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} />
          
          <motion.div key="sp" initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ 
              position: "fixed", top: 0, left: 0, right: 0, zIndex: 1001, 
              background: "#FFFFFF", padding: isMobile ? "32px 20px" : "60px 80px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}>
            
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 32, marginBottom: 32 }}>
                <Search size={isMobile ? 24 : 32} color="#000000" style={{ flexShrink: 0 }} />
                
                <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                  <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="¿Qué estás buscando?"
                    style={{ 
                      width: "100%", border: "none", outline: "none", 
                      fontSize: isMobile ? "24px" : "48px", 
                      fontWeight: 400, color: "#000000", 
                      fontFamily: "'Playfair Display', serif", 
                      background: "transparent",
                      letterSpacing: "-0.01em"
                    }} />
                </form>

                <button type="button" onClick={onClose}
                  style={{ 
                    width: 48, height: 48, borderRadius: "50%", 
                    background: "#000000", border: "none", 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    cursor: "pointer", transition: "all 0.2s" 
                  }}>
                  <X size={20} color="#FFFFFF" />
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Auth gate modal ──────────────────────────────────────────── */
const AuthGateModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="gb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} />
          <motion.div key="gm" initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 130, width: "min(420px,calc(100vw - 40px))", background: "#fff", borderRadius: 24, padding: "44px 36px 36px", boxShadow: "0 32px 80px rgba(0,0,0,0.18)", fontFamily: "'DM Sans', sans-serif" }}>
            <button type="button" onClick={onClose}
              style={{ position: "absolute", top: 18, right: 18, width: 34, height: 34, borderRadius: "50%", background: "#f5f5f5", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={14} color="#555" />
            </button>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
              <Heart size={28} color="#f87171" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111", letterSpacing: "-0.03em", marginBottom: 8 }}>Inicia sesión para guardar favoritos</h2>
            <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6, marginBottom: 28 }}>Guarda tus prendas favoritas y accédelas desde cualquier dispositivo.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link to="/login" onClick={onClose}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 100, background: "#111", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Iniciar sesión
              </Link>
              <Link to="/registro" onClick={onClose}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", borderRadius: 100, border: "1.5px solid #e5e5e5", color: "#555", textDecoration: "none", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Crear cuenta
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ══════════════════════ NAVBAR ══════════════════════════════════ */
const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const { user, signOut }         = useAuth();
  const { favorites }             = useFavorites();
  const location                  = useLocation();
  const navigate                  = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen,  setLoginOpen]  = useState(false);
  const [authGate,   setAuthGate]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);

  const isHeroPage    = ["/", "/configurador", "/contacto"].includes(location.pathname);
  const isTransparent = isHeroPage && !scrolled && !searchOpen && !mobileOpen;
  const favCount      = favorites.length;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 1024);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleFavClick = useCallback(() => {
    if (!user) { setAuthGate(true); return; }
    navigate("/favoritos");
  }, [user, navigate]);

  const navHeight  = isMobile ? (window.innerWidth > 600 ? 88 : NAV_H_MOBILE) : isTransparent ? NAV_H_DESKTOP_HERO : NAV_H_DESKTOP_SOLID;
  const logoHeight = isMobile ? (window.innerWidth > 600 ? 76 : 56) : isTransparent ? 84 : 72;
  const iconColor  = isTransparent ? "rgba(255,255,255,0.85)" : "#555";

  return (
    <>
      {/*
        ── SPACER ──────────────────────────────────────────────────
        FIX A: Always use NAV_H_DESKTOP_SOLID (68px) for the spacer,
        never the hero height. The hero height (80px) only applies while
        the nav is transparent over the homepage hero — it should never
        push down content on inner pages like /tienda.
      */}
      

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthGateModal open={authGate}   onClose={() => setAuthGate(false)} />
      <LoginDialog    open={loginOpen}  onOpenChange={setLoginOpen} />

      <header style={{
        position: "fixed", 
        top: isTransparent ? (isMobile ? 44 : 40) : 0, 
        left: 0, 
        right: 0, 
        zIndex: 50,
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        background: isTransparent ? "transparent" : "rgba(255,255,255,0.97)",
        backdropFilter: isTransparent ? "none" : "blur(18px)",
        boxShadow: isTransparent ? "none" : "0 1px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/*
          FIX B: maxWidth 1200 → 1080px + padding 24px → 32px.
          At 1200px the logo, nav links, and icon cluster were spread so
          far apart the gaps looked asymmetric. 1080px brings everything
          into a tighter, more coherent band while the extra padding gives
          breathing room at the edges.
        */}
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: isMobile ? "0 16px" : "0 32px",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: navHeight,
            transition: "height 0.4s cubic-bezier(0.23,1,0.32,1)",
          }}>

            {/* ── Left column: Logo ── */}
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}>
              <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                <div style={{ height: Math.round(logoHeight * 1.12), display: "flex", alignItems: "center" }}>
                  <img
                    src={logoImg}
                    alt="EVOLET"
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                      style={{
                        height: "100%",
                        width: "auto",
                        transition: "all 0.3s ease",
                        filter: isTransparent ? "brightness(0) invert(1)" : "none",
                        padding: "2px 0",
                        objectFit: "contain",
                        maxWidth: "230px",
                        imageRendering: "auto",
                        transform: "translateZ(0)",
                        willChange: "transform",
                      }}
                  />
                </div>
              </Link>
            </div>

            {/* ── Centre column: Nav links ── */}
            {!isMobile && (
              <nav style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
              }}>
                {NAV_LINKS.map(link => {
                  const active = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "8px 0",
                        fontSize: 14,
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        transition: "all 0.2s",
                        fontFamily: "'DM Sans', sans-serif",
                        color: isTransparent
                          ? (active ? "#fff" : "rgba(255,255,255,0.7)")
                          : (active ? "#111" : "#777"),
                        borderBottom: active ? `2px solid ${isTransparent ? "#fff" : "#111"}` : "2px solid transparent",
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* ── Right column: Icon cluster ── */}
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: isMobile ? 8 : 16,
            }}>

              {/* UserMenu — desktop only */}
              {!isMobile && <UserMenu isTransparent={isTransparent} />}

              {/* Search — desktop only */}
              {!isMobile && (
                <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setSearchOpen(true)}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: iconColor, transition: "color 0.2s, background 0.2s" }}
                  onMouseEnter={e => { if (!isTransparent) (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f5"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <Search size={16} />
                </motion.button>
              )}

              {/* Favorites — desktop only */}
              {!isMobile && (
                <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={handleFavClick}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", color: iconColor, transition: "color 0.2s, background 0.2s" }}
                  onMouseEnter={e => { if (!isTransparent) (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f5"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <Heart size={16} style={{ fill: user && favCount > 0 ? "#ef4444" : "transparent", color: user && favCount > 0 ? "#ef4444" : iconColor, transition: "all 0.2s" }} />
                  <AnimatePresence>
                    {user && favCount > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: `2px solid ${isTransparent ? "transparent" : "#fff"}` }} />
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Cart — always visible */}
              <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(true)}
                style={{ width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", color: isTransparent ? "rgba(255,255,255,0.9)" : "#111", transition: "color 0.2s, background 0.2s" }}
                onMouseEnter={e => { if (!isTransparent) (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f5"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                <ShoppingCart size={17} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      style={{ position: "absolute", top: -2, right: -2, minWidth: 16, height: 16, padding: "0 3px", background: isTransparent ? "rgba(255,255,255,0.9)" : "#111", color: isTransparent ? "#111" : "#fff", fontSize: 8, fontWeight: 900, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", border: `2px solid ${isTransparent ? "transparent" : "#fff"}` }}>
                      {totalItems > 9 ? "9+" : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile hamburger */}
              {isMobile && (
                <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setMobileOpen(v => !v)}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: mobileOpen ? "#f5f5f5" : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isTransparent && !mobileOpen ? "#fff" : "#111", transition: "all 0.2s", marginLeft: 2 }}>
                  <AnimatePresence mode="wait">
                    {mobileOpen
                      ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={18} /></motion.span>
                      : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={18} /></motion.span>
                    }
                  </AnimatePresence>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && isMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              style={{ overflow: "hidden", background: "rgba(255,255,255,0.99)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "8px 16px 24px" }}>
                <nav style={{ marginBottom: 16 }}>
                  {NAV_LINKS.map((link, i) => {
                    const active = location.pathname === link.path;
                    return (
                      <motion.div key={link.path} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <Link to={link.path} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 14px", borderRadius: 10,
                          fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                          textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
                          color: active ? "#111" : "#666",
                          background: active ? "#f5f5f5" : "transparent",
                          transition: "all 0.15s",
                        }}>
                          {link.label}
                          {active && <ArrowRight size={13} color="#bbb" />}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
                <div style={{ height: 1, background: "#f0f0f0", margin: "0 14px 16px" }} />
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button type="button" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                    style={{ flex: "1 1 calc(50% - 4px)", padding: "14px 0", borderRadius: "0", border: "1px solid #000000", background: "#FFFFFF", cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", color: "#000000", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Search size={14} color="#000000" /> Buscar
                  </button>
                  <button type="button" onClick={() => { setMobileOpen(false); handleFavClick(); }}
                    style={{ flex: "1 1 calc(50% - 4px)", padding: "14px 0", borderRadius: "0", border: "1px solid #000000", background: "#FFFFFF", cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", color: "#000000", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, position: "relative" }}>
                    <Heart size={14} style={{ fill: user && favCount > 0 ? "#000000" : "transparent", color: "#000000" }} />
                    Favoritos
                  </button>
                  {user ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                      <button type="button" onClick={() => { setMobileOpen(false); navigate("/perfil"); }}
                        style={{ width: "100%", padding: "16px 0", borderRadius: "12px", border: "none", background: "#000000", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <User size={14} /> Mi perfil
                      </button>
                      <button type="button" onClick={() => { setMobileOpen(false); signOut(); }}
                        style={{ width: "100%", padding: "14px 0", borderRadius: "12px", border: "1.5px solid #ef4444", background: "transparent", cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <LogOut size={14} /> Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setMobileOpen(false); setLoginOpen(true); }}
                      style={{ flex: "1 1 100%", padding: "16px 0", borderRadius: "0", border: "none", background: "#000000", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      Iniciar Sesión
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;