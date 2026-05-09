import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import brand from "@/assets/evolet-brand.png";

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

        <motion.div 
          style={{ x: isMobile ? 0 : imageX, position: "relative" }}
          initial={{ opacity: 0, x: 32 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <div style={{ position: "absolute", top: -20, right: -20, bottom: 20, left: 20, borderRadius: 24, background: "linear-gradient(135deg, #f0e6ea 0%, #fafaf9 100%)", zIndex: 0 }} />
          <motion.div style={{ scale: imageScale, position: "relative", zIndex: 1, borderRadius: 20, overflow: "hidden" }}>
            <img src={brand} alt="Evolet Brand" width={600} height={400} style={{ width: "100%", objectFit: "cover", display: "block" }} />
          </motion.div>
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

export default AboutEvolet;
