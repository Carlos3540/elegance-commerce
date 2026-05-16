// src/pages/Index.tsx
import { lazy, Suspense, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { optimizeSupabaseImage } from "@/utils/imageOptimization";

// URLs de assets pesados
const bannerVideo = "https://aioiaitkycmypvdialek.supabase.co/storage/v1/object/public/assets/banner7.2.mp4";
const bannerPoster = "https://aioiaitkycmypvdialek.supabase.co/storage/v1/object/public/assets/banner-poster.jpg";

// Componentes Lazy para Code Splitting (Reduce el JS inicial)
const StatsBar = lazy(() => import("@/components/home/HomeSections").then(m => ({ default: m.StatsBar })));
const CategoriesGrid = lazy(() => import("@/components/home/CategoriesGrid"));
const NewArrivals = lazy(() => import("@/components/home/NewArrivals"));
const FeaturedCollectionBanner = lazy(() => import("@/components/home/FeaturedCollectionBanner"));
const ConfiguradorBanner = lazy(() => import("@/components/home/HomeSections").then(m => ({ default: m.ConfiguradorBanner })));
const AboutEvolet = lazy(() => import("@/components/home/AboutEvolet"));
const StefaniaCEO = lazy(() => import("@/components/home/StefaniaCEO"));
const InstagramFeed = lazy(() => import("@/components/home/InstagramFeed"));
const Testimonials = lazy(() => import("@/components/home/HomeSections").then(m => ({ default: m.Testimonials })));
const Benefits = lazy(() => import("@/components/home/HomeSections").then(m => ({ default: m.Benefits })));

// ── Ticker (Above the fold, no lazy) ───────────────────────────
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
        <span key={i} style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)", padding: "0 36px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
          {item} <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: 20 }}>✦</span>
        </span>
      ))}
    </motion.div>
  </div>
);

// ── Parallax Hero (Above the fold, optimizado) ──────────────────
const ParallaxHero = () => {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", isMobile ? "15%" : "30%"]);

  // Asegurar que el video intente reproducirse al montar (evita el bug de F5)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Autoplay bloqueado o falló:", err);
      });
    }
  }, []);

  return (
    <section ref={ref} style={{ position: "relative", height: isMobile ? "100svh" : "92vh", overflow: "hidden" }}>
      <motion.div style={{ y, position: "absolute", inset: 0 }}>
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline 
          poster={optimizeSupabaseImage(bannerPoster, { width: isMobile ? 800 : 1600, quality: 70 })}
          preload="metadata"
          width="100%"
          height="100%"
          style={{ 
            width: "100%", 
            height: "115%", 
            objectFit: "cover", 
            filter: "brightness(0.82) contrast(1.12) saturate(1.1)",
            willChange: "transform",
            transform: "translate3d(0,0,0)" // Forzar aceleración GPU
          }}
        >
          <source src={bannerVideo} type="video/mp4" />
        </video>
      </motion.div>

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.6) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)" }} />

      <motion.div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: isMobile ? "120px 20px 100px" : "100px 20px 180px" }}>
        <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 100, padding: "8px 20px" }}
          >
            <Sparkles size={12} style={{ color: "#f59e0b" }} />
            <span style={{ fontSize: 10, fontWeight: "bold", letterSpacing: "1px", color: "rgba(255,255,255,0.95)", textTransform: "uppercase" }}>
              Colección 2026 · Exclusivo
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}
            style={{ fontSize: isMobile ? "clamp(32px, 10vw, 54px)" : "clamp(48px, 5.5vw, 88px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em", maxWidth: 900 }}
          >
            Diseñado<br />
            <span style={{ fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>especialmente</span><br />
            para ti
          </motion.h1>

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, width: isMobile ? "100%" : "auto", maxWidth: isMobile ? 300 : "none", marginTop: 20 }}>
            <Link to="/tienda" style={{ background: "#fff", color: "#111", padding: "14px 26px", borderRadius: 100, fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              Explorar Colección <ArrowRight size={13} />
            </Link>
            <Link to="/configurador" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "14px 26px", borderRadius: 100, fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <RotateCcw size={12} /> Configurador 3D
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// ── Main ───────────────────────────────────────────────────────
const Index = () => (
  <div className="min-h-screen bg-background">
    <Ticker />
    <ParallaxHero />
    
    {/* Suspense maneja la carga de secciones pesadas fuera del fold inicial */}
    <Suspense fallback={<div style={{ height: 400, background: "#fafaf9" }} />}>
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
    </Suspense>
  </div>
);

export default Index;