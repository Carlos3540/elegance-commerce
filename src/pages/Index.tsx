// src/pages/Index.tsx
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, RotateCcw, Star, TrendingUp, Shield, Truck, RefreshCw, Instagram } from "lucide-react";
import { useRef, useState, useEffect } from "react";
const bannerVideo = "https://aioiaitkycmypvdialek.supabase.co/storage/v1/object/public/assets/banner7.2.mp4";
import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import collectionEveryday from "@/assets/collection-everyday.jpg";
import ProductCard from "@/components/store/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import ig1 from "@/assets/ig1.jpg";
import ig2 from "@/assets/ig2.jpg";
import ig3 from "@/assets/ig3.jpg";
import ig4 from "@/assets/ig4.jpg";
import ig5 from "@/assets/ig5.jpg";
import ig6 from "@/assets/ig6.jpg";
import stefania from "@/assets/stefania.jpg";
import brand from "@/assets/evolet-brand.png";
import configuradorBg from "@/assets/configurador-bg.png";

// ── Responsive hook ────────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

// ── Marquee ticker ─────────────────────────────────────────────
const TICKER_ITEMS = [
  "NUEVA COLECCIÓN 2026", "ENVÍO GRATIS +$150.000",
  "CONFIGURADOR 3D", "MODA SOSTENIBLE",
  "NUEVAS LLEGADAS", "DISEÑO EXCLUSIVO",
];

const Ticker = () => (
  <div style={{ background: "#111", overflow: "hidden", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <motion.div
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      style={{ display: "flex", gap: 0, whiteSpace: "nowrap" }}
    >
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span key={i} style={{ fontSize: window.innerWidth > 600 ? 13 : 11, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)", padding: "0 36px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
          {item} <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: 20 }}>✦</span>
        </span>
      ))}
    </motion.div>
  </div>
);

// ── Parallax Hero — MEJORADO ────────────────────────────────────
const ParallaxHero = () => {
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", isMobile ? "15%" : "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} style={{ position: "relative", height: isMobile ? "100svh" : "92vh", overflow: "hidden" }}>
      <motion.div style={{ y, position: "absolute", inset: 0 }}>
        <video autoPlay muted loop playsInline style={{ width: "100%", height: "115%", objectFit: "cover", filter: "brightness(0.82) contrast(1.12) saturate(1.1)" }}>
          <source src={bannerVideo} type="video/mp4" />
        </video>
      </motion.div>

      {/* Gradient layers for cinematic feel */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.6) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)" }} />
      {/* Subtle vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)" }} />

      <motion.div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: isMobile ? "120px 20px 100px" : "100px 20px 180px" }}>
        <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
          {/* Eyebrow badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 100, padding: "8px 20px" }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
              <Sparkles size={12} style={{ color: "#f59e0b" }} />
            </motion.div>
            <span style={{ fontSize: 10, fontWeight: "bold", letterSpacing: "1px", color: "rgba(255,255,255,0.95)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
              Colección 2026 · Exclusivo
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            style={{ fontSize: isMobile ? "clamp(32px, 10vw, 54px)" : "clamp(48px, 5.5vw, 88px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em", fontFamily: "'DM Sans', sans-serif", maxWidth: 900, textAlign: "center" }}
          >
            Diseñado<br />
          <span style={{ fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>especialmente</span><br />
          para ti
        </motion.h1>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ width: 60, height: 2, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent)", marginBottom: 24 }}
        />

        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.9 }}
          style={{ fontSize: isMobile ? 16 : 19, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif", marginBottom: 10, maxWidth: 500, lineHeight: 1.6 }}
        >
          Moda contemporánea con carácter propio.<br />Prendas que hablan por ti.
        </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 1.1 }}
            style={{ 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row", 
              gap: 12, 
              width: isMobile ? "100%" : "auto",
              maxWidth: isMobile ? 300 : "none",
              margin: isMobile ? "20px auto 0" : "10px 0 0",
              justifyContent: "center" 
            }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ width: isMobile ? "100%" : "auto" }}>
              <Link to="/tienda" style={{ background: "#fff", color: "#111", padding: isMobile ? "14px 22px" : "12px 26px", borderRadius: 100, fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
                Explorar Colección <ArrowRight size={13} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ width: isMobile ? "100%" : "auto" }}>
              <Link to="/configurador" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: isMobile ? "14px 22px" : "12px 26px", borderRadius: 100, fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <RotateCcw size={12} /> Configurador 3D
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }} 
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
      >
        <span style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>Scroll</span>
        <motion.div
          animate={{ scaleY: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          style={{ width: 1, height: 44, background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)" }}
        />
      </motion.div>
    </section>
  );
};

// ── Stats Bar ──────────────────────────────────────────────────
const StatsBar = () => {
  const isMobile = useIsMobile();
  const stats = [
    { value: "+2.400", label: "Clientes felices" },
    { value: "4.9★", label: "Calificación promedio" },
    { value: "100%", label: "Materiales premium" },
    { value: "+180", label: "Modelos disponibles" },
  ];
  return (
    <section style={{ background: "#fafaf9", borderTop: "1px solid #ebebeb", borderBottom: "1px solid #ebebeb" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "20px 0" : 0 }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            style={{ textAlign: "center", padding: "0 16px", borderRight: isMobile ? (i % 2 === 0 ? "1px solid #ebebeb" : "none") : (i < 3 ? "1px solid #ebebeb" : "none") }}>
            <p style={{ fontSize: isMobile ? 28 : 34, fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.04em" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#999", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ── Categories Grid ────────────────────────────────────────────
const CategoriesGrid = () => {
  const isMobile = useIsMobile();
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "60px 16px" : "80px 24px" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#999", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>Explorar por categoría</p>
        <h2 style={{ fontSize: isMobile ? "clamp(26px, 7vw, 40px)" : "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Encuentra tu estilo
        </h2>
      </motion.div>

      {isMobile ? (
        // Mobile layout: stacked
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Mujer */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer" }}>
            <Link to="/tienda" style={{ display: "block" }}>
              <img src={categoryWomen} alt="Mujer" style={{ width: "100%", height: 280, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 24, left: 24 }}>
                <h3 style={{ fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>Mujer</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>Colección 2026</p>
              </div>
            </Link>
          </motion.div>
          {/* Hombre */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer" }}>
            <Link to="/tienda" style={{ display: "block" }}>
              <img src={categoryMen} alt="Hombre" style={{ width: "100%", height: 220, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20 }}>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>Hombre</h3>
              </div>
            </Link>
          </motion.div>
          {/* Configurador */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer", background: "#111", minHeight: 180 }}>
            <Link to="/configurador" style={{ display: "block", padding: "28px", position: "relative", minHeight: 180 }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <img src={configuradorBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.95, filter: "grayscale(30%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 6 }}>Exclusivo</p>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>Configurador 3D Premium</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>Diseña tu prenda personalizada.</p>
              </div>
            </Link>
          </motion.div>
          {/* Everyday */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} style={{ position: "relative", overflow: "hidden", borderRadius: 20 }}>
            <Link to="/tienda" style={{ display: "block" }}>
              <img src={collectionEveryday} alt="Everyday" style={{ width: "100%", height: 260, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 24, left: 24 }}>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>Lo esencial, reinventado</h3>
              </div>
            </Link>
          </motion.div>
        </div>
      ) : (
        // Desktop layout
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 12 }}>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ gridRow: "1 / 3", position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer" }}>
            <Link to="/tienda" style={{ display: "block", height: "100%", minHeight: 520 }}>
              <img src={categoryWomen} alt="Mujer" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 28, left: 28 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Colección 2026</span>
                <h3 style={{ fontSize: 36, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", lineHeight: 1 }}>Mujer</h3>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 100, padding: "6px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>Ver colección</span>
                  <ArrowRight size={12} color="#fff" />
                </div>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ gridColumn: "2 / 3", position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer" }}>
            <Link to="/tienda" style={{ display: "block" }}>
              <img src={categoryMen} alt="Hombre" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", transition: "transform 0.7s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 24, left: 24 }}>
                <h3 style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>Hombre</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>Colección 2026</p>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            style={{ gridColumn: "2 / 3", position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer", background: "#111" }}>
            <Link to="/configurador" style={{ display: "block", padding: "32px", minHeight: 220, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                <img src={configuradorBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.95, filter: "grayscale(30%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,153,255,0.15) 0%, transparent 70%)" }} />
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <RotateCcw size={20} color="rgba(255,255,255,0.8)" />
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>Exclusivo</p>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 10 }}>Configurador<br />3D Premium</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, marginBottom: 20 }}>Diseña tu prenda personalizada con colores, texturas y tu logo.</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 100, padding: "7px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>Personalizar ahora</span>
                  <ArrowRight size={12} color="rgba(255,255,255,0.8)" />
                </div>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            style={{ gridColumn: "3 / 4", gridRow: "1 / 3", position: "relative", overflow: "hidden", borderRadius: 20 }}>
            <Link to="/tienda" style={{ display: "block", height: "100%", minHeight: 520 }}>
              <img src={collectionEveryday} alt="Everyday" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 28, left: 28 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Everyday 2026</span>
                <h3 style={{ fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", lineHeight: 1 }}>Lo esencial,<br />reinventado</h3>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 100, padding: "6px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>Ver colección</span>
                  <ArrowRight size={12} color="#fff" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      )}
    </section>
  );
};

// ── NEW: Featured Collection Banner (Inspired by reference image) ──
const FeaturedCollectionBanner = () => {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const leftX = useTransform(scrollYProgress, [0, 1], ["-8%", "4%"]);
  const rightX = useTransform(scrollYProgress, [0, 1], ["8%", "-4%"]);
  const titleY = useTransform(scrollYProgress, [0.2, 0.7], [40, -20]);
  const titleOpacity = useTransform(scrollYProgress, [0.15, 0.4, 0.8, 1], [0, 1, 1, 0.3]);

  // Floating circles animation
  const circles = [
    { size: 120, color: "#8B1A4A", top: "8%", left: "25%", opacity: 0.85 },
    { size: 80, color: "#D63B7A", top: "12%", right: "22%", opacity: 1 },
    { size: 55, color: "#D63B7A", bottom: "15%", left: "30%", opacity: 0.5, border: true },
    { size: 65, color: "#D63B7A", bottom: "20%", right: "28%", opacity: 0.35, border: true },
    { size: 40, color: "#8B1A4A", top: "40%", left: "18%", opacity: 0.6, border: true },
  ];

  return (
    <section ref={ref} style={{ position: "relative", background: "#fff", overflow: "hidden", padding: isMobile ? "60px 0" : "80px 0", minHeight: isMobile ? 500 : 560 }}>
      {/* Decorative pattern background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)", backgroundSize: "28px 28px" }} />

      {/* Animated floating circles */}
      {circles.map((c, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          style={{
            position: "absolute",
            width: c.size,
            height: c.size,
            borderRadius: "50%",
            background: c.border ? "transparent" : c.color,
            border: c.border ? `3px solid ${c.color}` : "none",
            opacity: c.opacity,
            top: c.top,
            left: (c as any).left,
            right: (c as any).right,
            bottom: c.bottom,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Wave decoration bottom-left */}
      <div style={{ position: "absolute", bottom: 30, left: "30%", opacity: 0.15 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ width: 60, height: 8, borderBottom: "2px solid #111", marginBottom: 6, borderRadius: "0 0 50% 50%" }} />
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 32 : 0, alignItems: "center" }}>
          
          {/* Left image */}
          <motion.div
            style={{ x: isMobile ? 0 : leftX }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={{ position: "relative", borderRadius: isMobile ? 20 : "50% 50% 50% 50% / 40% 40% 60% 60%", overflow: "hidden", maxWidth: isMobile ? "70%" : 280, margin: isMobile ? "0 auto" : "0 auto", aspectRatio: "0.75" }}>
              <img src={ig1} alt="Colección Mitology" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.05)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(139,26,74,0.2) 0%, transparent 60%)" }} />
            </div>
          </motion.div>

          {/* Center text */}
          <motion.div
            style={{ y: isMobile ? 0 : titleY, opacity: isMobile ? 1 : titleOpacity, textAlign: "center", padding: isMobile ? "0" : "0 20px" }}
          >
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", color: "#C4395A", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 16 }}
            >
              Nueva Colección
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
              style={{ fontSize: isMobile ? 52 : 72, fontWeight: 900, color: "#111", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 28 }}
            >
              Mitology
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ width: 60, height: 2, background: "#C4395A", margin: "0 auto 24px" }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              style={{ fontSize: 13, color: "#777", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 32, maxWidth: 260, margin: "0 auto 32px" }}
            >
              Inspirada en la fuerza y el misterio. Prendas que cuentan una historia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link to="/tienda" style={{ display: "inline-block", padding: "13px 36px", background: "#111", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", borderRadius: 100 }}>
                  Comprar Ahora
                </Link>
              </motion.div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'DM Sans', sans-serif" }}>
                  <Instagram size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />Evolet96
                </span>
                <span style={{ width: 1, height: 12, background: "#ddd" }} />
                <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'DM Sans', sans-serif" }}>www.Evolet96.com</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right image */}
          <motion.div
            style={{ x: isMobile ? 0 : rightX }}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={{ position: "relative", borderRadius: isMobile ? 20 : "50% 50% 50% 50% / 40% 40% 60% 60%", overflow: "hidden", maxWidth: isMobile ? "70%" : 280, margin: isMobile ? "0 auto" : "0 auto", aspectRatio: "0.75" }}>
              <img src={ig2} alt="Colección Mitology" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.05)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(139,26,74,0.2) 0%, transparent 60%)" }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ── New Arrivals ───────────────────────────────────────────────
const NewArrivals = () => {
  const isMobile = useIsMobile();
  const { products, isLoading } = useProducts({ limit: 4 });

  return (
    <section style={{ background: "#fafaf9", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#999", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 6 }}>
              <TrendingUp size={11} style={{ display: "inline", marginRight: 5 }} />Recién llegados
            </p>
            <h2 style={{ fontSize: isMobile ? "clamp(24px, 6vw, 36px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Nuevas llegadas
            </h2>
          </motion.div>
          <Link to="/tienda" style={{ fontSize: 12, fontWeight: 700, color: "#111", fontFamily: "'DM Sans', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, borderBottom: "2px solid #111", paddingBottom: 2 }}>
            Ver todo <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20 }}>
            {Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden" }}>
                <div style={{ aspectRatio: "3/4", background: "#ebebeb", borderRadius: 16, marginBottom: 12 }} />
                <div style={{ height: 14, background: "#ebebeb", borderRadius: 6, marginBottom: 8, width: "70%" }} />
                <div style={{ height: 14, background: "#ebebeb", borderRadius: 6, width: "40%" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(170px, 25vw, 300px), 1fr))", 
            gap: isMobile ? 16 : 32 
          }}>
            {products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Testimonials ───────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Valentina R.", location: "Bogotá", rating: 5, text: "La calidad supera mis expectativas. El tejido es increíble y el envío llegó rapidísimo. Ya hice mi segundo pedido.", avatar: "V" },
  { name: "María C.", location: "Medellín", rating: 5, text: "Me encanta cómo cada prenda tiene un diseño tan pensado. Se nota la dedicación. Mis amigas siempre me preguntan dónde compro.", avatar: "M" },
  { name: "Laura P.", location: "Cali", rating: 5, text: "El configurador 3D es una pasada, pude ver exactamente cómo quedaba antes de comprar. Totalmente diferente a otras tiendas.", avatar: "L" },
  { name: "Andrea M.", location: "Cartagena", rating: 5, text: "Servicio al cliente excepcional. Tuve una duda con mi talla y me ayudaron al instante. La prenda llegó perfecta.", avatar: "A" },
];

const Testimonials = () => {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: "80px 0", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", marginBottom: 48 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#999", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>Reseñas reales</p>
          <h2 style={{ fontSize: isMobile ? "clamp(24px, 6vw, 36px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>
            Lo que dicen nuestras clientas
          </h2>
        </motion.div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16, padding: "0 24px", maxWidth: 1200, margin: "0 auto" }}>
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            style={{ background: "#fafaf9", border: "1px solid #ebebeb", borderRadius: 20, padding: "28px 24px" }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
              {[...Array(t.rating)].map((_, j) => <Star key={j} size={13} style={{ fill: "#f59e0b", color: "#f59e0b" }} />)}
            </div>
            <p style={{ fontSize: 14, color: "#444", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{t.avatar}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>{t.name}</p>
                <p style={{ fontSize: 11, color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}>{t.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ── Configurador Banner ────────────────────────────────────────
const ConfiguradorBanner = () => {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? "0 16px 60px" : "0 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ background: "#111", borderRadius: 24, padding: isMobile ? "44px 28px" : "64px 56px", position: "relative", overflow: "hidden", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: isMobile ? 28 : 40, alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: -80, right: 100, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,153,255,0.12) 0%, transparent 70%)" }} />
          <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", bottom: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
            <RotateCcw size={12} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>Tecnología exclusiva</span>
          </div>
          <h2 style={{ fontSize: isMobile ? "clamp(26px, 7vw, 40px)" : "clamp(26px, 4vw, 50px)", fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            Diseña tu prenda<br />
            <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300, fontStyle: "italic" }}>en tiempo real</span>
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, maxWidth: 480 }}>
            Con nuestro configurador 3D puedes elegir el color, la textura, agregar texto grabado y tu logo.
          </p>
        </div>
        <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
          <Link to="/configurador" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", color: "#111", padding: "17px 34px", borderRadius: 100, fontSize: 12, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap" }}>
            <RotateCcw size={14} /> Abrir Configurador 3D
          </Link>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", textAlign: "center", marginTop: 12 }}>Sin costo adicional</p>
        </div>
      </motion.div>
    </section>
  );
};

// ── Benefits ───────────────────────────────────────────────────
const Benefits = () => {
  const isMobile = useIsMobile();
  const items = [
    { icon: Truck, title: "Envío a todo Colombia", desc: "Gratis en pedidos mayores a $150.000. Entrega en 2-4 días hábiles." },
    { icon: RefreshCw, title: "Cambios sin complicaciones", desc: "30 días para cambios o devoluciones. Sin preguntas." },
    { icon: Shield, title: "Pago 100% seguro", desc: "Tus datos están protegidos. Aceptamos PSE, tarjetas y contra entrega." },
    { icon: Star, title: "Calidad garantizada", desc: "Materiales seleccionados. Si no te gusta, te devolvemos tu dinero." },
  ];
  return (
    <section style={{ background: "#fafaf9", borderTop: "1px solid #ebebeb", padding: isMobile ? "48px 16px" : "60px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "28px 16px" : 32 }}>
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "#fff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <item.icon size={19} color="#111" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#111", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{item.title}</p>
              <p style={{ fontSize: 11, color: "#888", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.55 }}>{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ── About Evolet — MEJORADO con scroll animations ──────────────
const AboutEvolet = () => {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.04]);
  const imageX = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [30, -20]);

  return (
    <section ref={ref} style={{ padding: isMobile ? "70px 16px" : "90px 24px", maxWidth: 1200, margin: "0 auto", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 80, alignItems: "center" }}>
        
        {/* Text — left */}
        <motion.div 
          style={{ y: isMobile ? 0 : textY }}
          initial={{ opacity: 0, x: -32 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "#999", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 14 }}
          >
            Nuestra historia
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{ fontSize: isMobile ? "clamp(36px, 9vw, 54px)" : "clamp(32px, 4vw, 54px)", fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.06, marginBottom: 32 }}
          >
            ¿Qué es<br />
            <span style={{ fontStyle: "italic", fontWeight: 300 }}>Evolet?</span>
          </motion.h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              "Evolet es una marca colombiana de moda contemporánea nacida con un propósito claro: crear prendas que empoderen a la mujer moderna, combinando diseño con identidad propia.",
              "Cada colección es el resultado de un proceso creativo profundo — desde la selección de materiales premium hasta el corte final — donde la calidad no es opcional, es el estándar.",
              "Más que ropa, Evolet es una declaración. Creemos que vestirse bien es una forma de respetarse, de comunicar quién eres antes de decir una sola palabra.",
            ].map((text, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -16 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                <motion.span 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
                  style={{ fontSize: 10, color: "#C4395A", marginTop: 6, flexShrink: 0 }}
                >✦</motion.span>
                <p style={{ fontSize: 14, color: "#555", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.75 }}>{text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: 36, marginTop: 44 }}
          >
            {[{ n: "2019", l: "Fundación" }, { n: "12+", l: "Colecciones" }, { n: "Col.", l: "Hecho en Colombia" }].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <p style={{ fontSize: 28, fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.04em" }}>{s.n}</p>
                <p style={{ fontSize: 11, color: "#aaa", fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>{s.l}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Image — right with parallax */}
        <motion.div 
          style={{ x: isMobile ? 0 : imageX, position: "relative" }}
          initial={{ opacity: 0, x: 32 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="relative"
        >
          {/* Background accent */}
          <div style={{ position: "absolute", top: -20, right: -20, bottom: 20, left: 20, borderRadius: 24, background: "linear-gradient(135deg, #f0e6ea 0%, #fafaf9 100%)", zIndex: 0 }} />
          <motion.div style={{ scale: imageScale, position: "relative", zIndex: 1, borderRadius: 20, overflow: "hidden" }}>
            <img src={brand} alt="Evolet Brand" style={{ width: "100%", objectFit: "cover", display: "block" }} />
          </motion.div>
          {/* Floating Colombia tag */}
          <motion.div 
            initial={{ opacity: 0, x: -20, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
            style={{ position: "absolute", bottom: 24, left: -16, background: "#111", borderRadius: 14, padding: "14px 20px", boxShadow: "0 16px 48px rgba(0,0,0,0.25)", zIndex: 2 }}
          >
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>Fundada en</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>Colombia 🇨🇴</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ── Stefania CEO — MEJORADO con animaciones cinematicas ─────────
const StefaniaCEO = () => {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.0]);
  const verticalTextY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const imageX = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);
  const textX = useTransform(scrollYProgress, [0, 1], [20, -10]);

  return (
    <section
      ref={ref}
      style={{
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 40%, #16213e 70%, #0f0f0f 100%)",
        overflow: "hidden",
        position: "relative",
        minHeight: isMobile ? "auto" : "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* ── Grain overlay ── */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.035, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "128px 128px",
      }} />

      {/* ── Background gradient mesh ── */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "-20%", left: "30%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,57,90,0.15) 0%, rgba(99,57,196,0.08) 40%, transparent 70%)",
          pointerEvents: "none", filter: "blur(40px)",
        }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{
          position: "absolute", bottom: "-10%", right: "10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(57,130,196,0.12) 0%, transparent 70%)",
          pointerEvents: "none", filter: "blur(50px)",
        }}
      />

      {/* ── Vertical rotating text strip (like the reference) ── */}
      {!isMobile && (
        <motion.div
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: 56, background: "rgba(196,57,90,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 3, overflow: "hidden",
          }}
        >
          <motion.p
            style={{
              y: verticalTextY,
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.28em",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            STEFANIA · FUNDADORA · EVOLET · COLOMBIA · STEFANIA · FUNDADORA · EVOLET · COLOMBIA ·
          </motion.p>
        </motion.div>
      )}

      {/* ── Main content ── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: isMobile ? "70px 16px" : "90px 24px 90px 80px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 48 : 64,
        alignItems: "center",
        position: "relative", zIndex: 1, width: "100%",
      }}>

        {/* ── Photo column ── */}
        <motion.div
          style={{ x: isMobile ? 0 : imageX, position: "relative" }}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Corner accent brackets */}
          <div style={{ position: "absolute", top: -8, left: -8, width: 32, height: 32, borderTop: "2px solid #C4395A", borderLeft: "2px solid #C4395A", zIndex: 3 }} />
          <div style={{ position: "absolute", bottom: -8, right: -8, width: 32, height: 32, borderBottom: "2px solid #C4395A", borderRight: "2px solid #C4395A", zIndex: 3 }} />

          {/* Colored bg behind image */}
          <div style={{
            position: "absolute", top: 16, left: 16, right: -16, bottom: -16,
            background: "linear-gradient(135deg, #C4395A 0%, #7c3aed 100%)",
            borderRadius: 20, opacity: 0.3, zIndex: 0,
          }} />

          <motion.div
            style={{ scale: imageScale, position: "relative", zIndex: 1, borderRadius: 18, overflow: "hidden" }}
          >
            <img
              src={stefania}
              alt="Stefania CEO Evolet"
              style={{
                width: "100%", display: "block",
                objectFit: "cover",
                filter: "contrast(1.08) brightness(0.93) saturate(1.1)",
              }}
            />
            {/* Color grade overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(15,15,15,0.6) 0%, rgba(196,57,90,0.1) 50%, transparent 80%)",
            }} />
          </motion.div>

          {/* "MEGA DEAL" style tag — repurposed as founder tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring", stiffness: 140 }}
            style={{
              position: "absolute", top: 28, right: -20,
              background: "#C4395A",
              borderRadius: "0 10px 10px 0",
              padding: "10px 18px 10px 14px",
              zIndex: 4,
            }}
          >
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 2 }}>Fundadora</p>
            <p style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>EVOLET 96</p>
          </motion.div>

          {/* Floating quote */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, type: "spring", stiffness: 100 }}
            style={{
              position: "absolute", bottom: isMobile ? -20 : -24, right: isMobile ? -4 : -24,
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, padding: "16px 20px", maxWidth: 220, zIndex: 2,
            }}
          >
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", lineHeight: 1.6, marginBottom: 10 }}>
              "La moda no es solo ropa, es la forma en que le dices al mundo quién eres."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 1.5, background: "#C4395A", borderRadius: 2 }} />
              <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>STEFANIA, CEO</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Text column ── */}
        <motion.div
          style={{ x: isMobile ? 0 : textX }}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85 }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}
          >
            <div style={{ width: 28, height: 2, background: "#C4395A", borderRadius: 2 }} />
            <p style={{
              fontSize: 10, fontWeight: 900, letterSpacing: "0.26em",
              color: "#C4395A", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
            }}>Detrás de la marca</p>
          </motion.div>

          {/* Headline — big & bold like the reference */}
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.75 }}
            style={{
              fontSize: isMobile ? "clamp(38px, 10vw, 56px)" : "clamp(40px, 4.5vw, 64px)",
              fontWeight: 900,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            CONOCE A
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.28, duration: 0.75 }}
            style={{
              fontSize: isMobile ? "clamp(42px, 11vw, 64px)" : "clamp(46px, 5.5vw, 72px)",
              fontWeight: 900,
              color: "transparent",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              marginBottom: 28,
              WebkitTextStroke: "2px #C4395A",
              textTransform: "uppercase",
            }}
          >
            STEFANIA
          </motion.h2>

          {/* Accent bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.38, duration: 0.55 }}
            style={{
              height: 3,
              background: "linear-gradient(to right, #C4395A, #7c3aed, transparent)",
              marginBottom: 32, transformOrigin: "left", borderRadius: 4,
              maxWidth: 280,
            }}
          />

          {/* Body text */}
          {[
            "Desde pequeña, Stefania entendió que la ropa tiene el poder de transformar cómo te sientes y cómo te perciben.",
            "Con formación en diseño de moda fundó Evolet con una misión: hacer que cada mujer se sienta extraordinaria en su día a día.",
            "Hoy lidera un equipo apasionado desde Colombia — construyendo una marca que no sigue tendencias, las define.",
          ].map((text, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.32 + i * 0.14 }}
              style={{
                fontSize: 14, color: "rgba(255,255,255,0.5)",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.8, marginBottom: 16,
              }}
            >
              {text}
            </motion.p>
          ))}

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 36, alignItems: "center" }}
          >
            {/* Primary CTA — like "SHOP SALE" in reference */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/tienda"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "#C4395A",
                  color: "#fff",
                  padding: "14px 28px",
                  borderRadius: 4,
                  fontSize: 12, fontWeight: 900, letterSpacing: "0.12em",
                  textTransform: "uppercase", textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Ver Colección
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
              </Link>
            </motion.div>

            {/* Instagram link */}
            <motion.a
              href="https://instagram.com/EVOLET_96"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 4,
                padding: "14px 22px",
                textDecoration: "none",
              }}
            >
              <Instagram size={14} color="rgba(255,255,255,0.55)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>@EVOLET_96</span>
            </motion.a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.82 }}
            style={{ display: "flex", gap: 32, marginTop: 44, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[{ n: "2019", l: "Fundación" }, { n: "12+", l: "Colecciones" }, { n: "🇨🇴", l: "Made in Colombia" }].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.88 + i * 0.08 }}
              >
                <p style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.04em" }}>{s.n}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.l}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ── Instagram Feed ─────────────────────────────────────────────
const INSTAGRAM_URL = "https://instagram.com/EVOLET_96";
const IG_POSTS = [
  { id: 1, src: ig1, caption: "Nueva colección ✨" },
  { id: 2, src: ig2, caption: "Diseño exclusivo" },
  { id: 3, src: ig3, caption: "Hecho en Colombia 🇨🇴" },
  { id: 4, src: ig4, caption: "Calidad premium" },
  { id: 5, src: ig5, caption: "Moda con identidad" },
  { id: 6, src: ig6, caption: "Stefania x Evolet" },
];

const InstagramFeed = () => {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ display: "flex", alignItems: isMobile ? "flex-start" : "flex-end", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", marginBottom: 36, gap: 16 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#999", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>Síguenos</p>
          <h2 style={{ fontSize: isMobile ? "clamp(24px, 6vw, 36px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            @EVOLET_96 en Instagram
          </h2>
        </div>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", color: "#fff", padding: "12px 22px", borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textDecoration: "none", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          <Instagram size={14} /> Seguir en Instagram
        </a>
      </motion.div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)", gap: isMobile ? 6 : 8 }}>
        {IG_POSTS.map((post, i) => (
          <motion.a key={post.id} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.04, zIndex: 2 }}
            style={{ display: "block", borderRadius: 12, overflow: "hidden", aspectRatio: "1/1", background: "#f0eeeb", position: "relative", textDecoration: "none", cursor: "pointer" }}>
            {post.src && <img src={post.src} alt={post.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          </motion.a>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: "center", marginTop: 28 }}>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, fontWeight: 700, color: "#111", fontFamily: "'DM Sans', sans-serif", textDecoration: "none", borderBottom: "2px solid #111", paddingBottom: 2, display: "inline-flex", alignItems: "center", gap: 6 }}>
          Ver más en Instagram <ArrowRight size={13} />
        </a>
      </motion.div>
    </section>
  );
};

// ── Main ───────────────────────────────────────────────────────
const Index = () => (
  <div className="min-h-screen bg-background">
    <Ticker />
    <ParallaxHero />
    <StatsBar />
    <CategoriesGrid />
    <NewArrivals />
    <FeaturedCollectionBanner />
    <ConfiguradorBanner />
    <AboutEvolet />
    <StefaniaCEO />
    <InstagramFeed />
    <Testimonials />
    <Benefits />
 
  </div>
);

export default Index;