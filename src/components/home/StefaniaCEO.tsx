import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import stefania from "@/assets/stefania.jpg";

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
      <div style={{
        position: "absolute", inset: 0, opacity: 0.035, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "128px 128px",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "80px 24px" : "100px 24px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 60 : 100, alignItems: "center", position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative" }}>
          <motion.div style={{ position: "absolute", top: -40, left: -40, fontSize: isMobile ? 80 : 180, fontWeight: 900, color: "rgba(255,255,255,0.03)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.05em", y: verticalTextY, pointerEvents: "none", zIndex: 0, whiteSpace: "nowrap" }}>
            CREATIVE
          </motion.div>
          <motion.div style={{ x: isMobile ? 0 : imageX, scale: imageScale, borderRadius: isMobile ? 24 : 32, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", position: "relative", zIndex: 1 }}>
            <img src={stefania} alt="Stefania - Creative Director" width={600} height={800} style={{ width: "100%", height: isMobile ? "auto" : 700, objectFit: "cover", filter: "contrast(1.1) brightness(0.9)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)" }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} style={{ position: "absolute", bottom: -20, right: isMobile ? 20 : -30, background: "#C4395A", borderRadius: 100, width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, boxShadow: "0 20px 40px rgba(196,57,90,0.3)" }}>
            <p style={{ fontSize: isMobile ? 10 : 12, fontWeight: 900, color: "#fff", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: 1.2 }}>Evolet<br />96</p>
          </motion.div>
        </div>

        <motion.div style={{ x: isMobile ? 0 : textX }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.25em", color: "#C4395A", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Nuestra Directora</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ fontSize: isMobile ? "clamp(34px, 8vw, 48px)" : "clamp(42px, 5vw, 68px)", fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display', serif", fontStyle: "italic", lineHeight: 1.1, marginBottom: 32 }}>
            Stephanie
          </motion.h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ fontSize: isMobile ? 16 : 18, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, fontWeight: 300 }}>
              "Diseñamos para una mujer que no tiene miedo de ser el centro de atención. Cada prenda de Evolet es una extensión de la personalidad de quien la lleva."
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8 }}>
              Mi visión siempre ha sido elevar el diseño colombiano a un estándar internacional, donde la sofisticación se encuentra con la comodidad y el lujo es accesible para todas las que buscan algo excepcional.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} style={{ marginTop: 48, display: "flex", alignItems: "center", gap: 24 }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.05em" }}>Stefania</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 4 }}>Creative Director & Founder</p>
            </div>
            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <img src="/assets/signature.png" alt="Signature" width={100} height={40} style={{ opacity: 0.6, filter: "invert(1)", height: 40, objectFit: "contain" }} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StefaniaCEO;
