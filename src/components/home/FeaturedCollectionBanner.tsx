import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Instagram } from "lucide-react";
import ig1 from "@/assets/ig1.jpg";
import ig2 from "@/assets/ig2.jpg";

const FeaturedCollectionBanner = () => {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const leftX = useTransform(scrollYProgress, [0, 1], ["-8%", "4%"]);
  const rightX = useTransform(scrollYProgress, [0, 1], ["8%", "-4%"]);
  const titleY = useTransform(scrollYProgress, [0.2, 0.7], [40, -20]);
  const titleOpacity = useTransform(scrollYProgress, [0.15, 0.4, 0.8, 1], [0, 1, 1, 0.3]);

  const circles = [
    { size: 120, color: "#8B1A4A", top: "8%", left: "25%", opacity: 0.85 },
    { size: 80, color: "#D63B7A", top: "12%", right: "22%", opacity: 1 },
    { size: 55, color: "#D63B7A", bottom: "15%", left: "30%", opacity: 0.5, border: true },
    { size: 65, color: "#D63B7A", bottom: "20%", right: "28%", opacity: 0.35, border: true },
    { size: 40, color: "#8B1A4A", top: "40%", left: "18%", opacity: 0.6, border: true },
  ];

  return (
    <section ref={ref} style={{ position: "relative", background: "#fff", overflow: "hidden", padding: isMobile ? "60px 0" : "80px 0", minHeight: isMobile ? 500 : 560 }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)", backgroundSize: "28px 28px" }} />

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
            bottom: (c as any).bottom,
            pointerEvents: "none",
          }}
        />
      ))}

      <div style={{ position: "absolute", bottom: 30, left: "30%", opacity: 0.15 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ width: 60, height: 8, borderBottom: "2px solid #111", marginBottom: 6, borderRadius: "0 0 50% 50%" }} />
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 32 : 0, alignItems: "center" }}>
          
          <motion.div
            style={{ x: isMobile ? 0 : leftX }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={{ position: "relative", borderRadius: isMobile ? 20 : "50% 50% 50% 50% / 40% 40% 60% 60%", overflow: "hidden", maxWidth: isMobile ? "70%" : 280, margin: isMobile ? "0 auto" : "0 auto", aspectRatio: "0.75" }}>
              <img src={ig1} alt="Colección Mitology" width={280} height={373} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.05)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(139,26,74,0.2) 0%, transparent 60%)" }} />
            </div>
          </motion.div>

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

          <motion.div
            style={{ x: isMobile ? 0 : rightX }}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={{ position: "relative", borderRadius: isMobile ? 20 : "50% 50% 50% 50% / 40% 40% 60% 60%", overflow: "hidden", maxWidth: isMobile ? "70%" : 280, margin: isMobile ? "0 auto" : "0 auto", aspectRatio: "0.75" }}>
              <img src={ig2} alt="Colección Mitology" width={280} height={373} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.05)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(139,26,74,0.2) 0%, transparent 60%)" }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollectionBanner;
