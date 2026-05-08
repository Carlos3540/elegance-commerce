// src/pages/Configurador.tsx
// ──────────────────────────────────────────────────────────
// Diseño 100% coherente con Index.tsx:
//  • Ticker animado igual al de la home
//  • Hero con eyebrow badge, título dual y línea decorativa
//  • Background oscuro #111 / gradients radiales
//  • Acento #C4395A, fuentes DM Sans + Playfair Display
//  • Features strip con iconos estilo benefits del Index
//  • Conectado al CartContext real (useCart)
//  • Lazy + Suspense con spinner en colores de marca
// ──────────────────────────────────────────────────────────

import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ChevronRight, RotateCcw, Sparkles, Zap,
  Palette, Layers, Type, Ruler, ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import { useCart } from "@/context/CartContext";

const ProductConfigurator3D = lazy(
  () => import("@/components/store/ProductConfigurator3D"),
);

// ── Ticker (idéntico al de Index) ─────────────────────────
const TICKER_ITEMS = [
  "CONFIGURADOR 3D PREMIUM",
  "PERSONALIZA TU HOODIE",
  "ARRASTRA TEXTO Y LOGO",
  "ENVÍO GRATIS +$150.000",
  "DISEÑO EXCLUSIVO",
  "HECHO EN COLOMBIA 🇨🇴",
];

const Ticker = () => (
  <div
    style={{
      background: "#111",
      overflow: "hidden",
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <motion.div
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      style={{ display: "flex", gap: 0, whiteSpace: "nowrap" }}
    >
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span
          key={i}
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.9)",
            padding: "0 32px",
            fontFamily: "'DM Sans', sans-serif",
            textTransform: "uppercase",
          }}
        >
          {item}{" "}
          <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: 18 }}>
            ✦
          </span>
        </span>
      ))}
    </motion.div>
  </div>
);

// ── Features strip (estilo Benefits del Index) ────────────
const FEATURES = [
  {
    icon: Palette,
    title: "8 colores premium",
    desc: "Desde obsidiana hasta mostaza",
  },
  {
    icon: Layers,
    title: "6 texturas reales",
    desc: "Liso, algodón, seda, mezclilla…",
  },
  {
    icon: Type,
    title: "Texto & logo libre",
    desc: "Arrastra donde quieras en la prenda",
  },
  {
    icon: Ruler,
    title: "XS a XXL",
    desc: "Guía de tallas incluida",
  },
];

// ── Configurador page ─────────────────────────────────────
const Configurador = () => {
  const { addItem } = useCart();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const handleAddToCart = (config: Record<string, unknown>) => {
    addItem?.({
      id: `hoodie-custom-${Date.now()}`,
      name: "Hoodie Personalizado",
      price: 259900,
      image: "",
      ...config,
    } as any);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Top ticker ── */}
      <style>{`
        .cfg-hero-grid { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 40px; }
        .cfg-cta-box { display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 40px; }
        @media (max-width: 768px) {
          .cfg-hero-grid { grid-template-columns: 1fr; text-align: center; }
          .cfg-cta-box { flex-direction: column; text-align: center; }
        }
      `}</style>
      <Ticker />

      {/* ── Hero con parallax ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "clamp(60px, 15vh, 120px) 0 clamp(40px, 8vh, 80px)",
          background: "#111",
        }}
      >
        {/* Mesh gradient background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Orb acento */}
        <motion.div
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(196,57,90,0.22) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          style={{
            y: heroY,
            opacity: heroOpacity,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            zIndex: 1,
            textAlign: "center",
          }}
        >


          {/* Eyebrow badge — igual que en Index */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 100,
              padding: "6px 18px",
              marginBottom: 24,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={12} style={{ color: "#C4395A" }} />
            </motion.div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.75)",
                textTransform: "uppercase",
              }}
            >
              Configurador 3D · Exclusivo Evolet
            </span>
          </motion.div>

          {/* Título — mismo estilo dual del Index */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              marginBottom: 20,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Diseñado
            <br />
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                color: "rgba(255,255,255,0.55)",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              especialmente
            </span>
            <br />
            para ti
          </motion.h1>

          {/* Línea decorativa — idéntica al Index */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{
              width: 60,
              height: 2,
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
              margin: "0 auto 20px",
            }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 420,
              margin: "0 auto 40px",
              lineHeight: 1.65,
            }}
          >
            Elige color, textura y talla. Coloca tu texto y logo donde quieras.
            <br />
            Vista en 3D en tiempo real.
          </motion.p>

          {/* CTA pills — igual que en el hero del Index */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <motion.a
              href="#configurador"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: "#C4395A",
                color: "#fff",
                padding: "14px 34px",
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 8px 28px rgba(196,57,90,0.38)",
              }}
            >
              <RotateCcw size={13} /> Comenzar diseño
            </motion.a>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/tienda"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.8)",
                  padding: "14px 34px",
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Ver colección <ArrowRight size={13} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features strip ── */}
      <section
        style={{
          background: "#0d0d0d",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "22px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRight: window.innerWidth >= 1024 && i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(196,57,90,0.1)",
                  border: "1px solid rgba(196,57,90,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <f.icon size={16} style={{ color: "#C4395A" }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: 2,
                  }}
                >
                  {f.title}
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Configurador 3D ── */}
      <section
        id="configurador"
        style={{
          background: "#111",
          padding: "56px 0 80px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <Suspense
            fallback={
              <div
                style={{
                  height: 520,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  background: "#0e0e0e",
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "2px solid rgba(196,57,90,0.2)",
                    borderTopColor: "#C4395A",
                    animation: "spin 0.9s linear infinite",
                  }}
                />
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Cargando configurador 3D…
                </p>
                <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
              </div>
            }
          >
            <ProductConfigurator3D onAddToCart={handleAddToCart} />
          </Suspense>
        </div>
      </section>

      {/* ── Social proof strip — idéntico al Index ── */}
      <section
        style={{
          background: "#0d0d0d",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 32,
          }}
        >
          {[
            { value: "+2.400", label: "Clientes felices" },
            { value: "4.9★", label: "Calificación promedio" },
            { value: "100%", label: "Materiales premium" },
            { value: "+180", label: "Modelos disponibles" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                textAlign: "center",
                padding: "0 16px",
                borderRight:
                  window.innerWidth >= 1024 && i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  marginTop: 4,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA final — estilo ConfiguradorBanner del Index ── */}
      <section
        style={{
          background: "#111",
          padding: "0 24px 80px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <motion.div
            className="cfg-cta-box"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: "#0d0d0d",
              borderRadius: 24,
              padding: "clamp(30px, 8vw, 52px) clamp(20px, 5vw, 48px)",
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Background glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              <motion.div
                animate={{ x: [0, 28, 0], y: [0, -18, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  top: -80,
                  right: 100,
                  width: 340,
                  height: 340,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(196,57,90,0.12) 0%, transparent 70%)",
                }}
              />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 100,
                  padding: "5px 14px",
                  marginBottom: 20,
                }}
              >
                <Zap size={11} style={{ color: "#C4395A" }} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.45)",
                    textTransform: "uppercase",
                  }}
                >
                  ¿Tienes dudas?
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(22px, 3.5vw, 40px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  marginBottom: 14,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Explora toda
                <br />
                <span
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontWeight: 300,
                    fontStyle: "italic",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  nuestra colección
                </span>
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                  lineHeight: 1.6,
                  maxWidth: 420,
                }}
              >
                Más de 180 modelos disponibles. Si no quieres personalizar, tenemos
                prendas listas para ti.
              </p>
            </div>

            <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/tienda"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#fff",
                    color: "#111",
                    padding: "16px 32px",
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <ShoppingBag size={14} /> Ver colección completa
                </Link>
              </motion.div>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.2)",
                  textAlign: "center",
                  marginTop: 10,
                  letterSpacing: "0.06em",
                }}
              >
                Envío gratis +$150.000
              </p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Configurador;