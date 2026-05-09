import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowRight, RotateCcw } from "lucide-react";
import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import collectionEveryday from "@/assets/collection-everyday.jpg";
import configuradorBg from "@/assets/configurador-bg.png";

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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer" }}>
            <Link to="/tienda" style={{ display: "block" }}>
              <img src={categoryWomen} alt="Mujer" width={600} height={280} style={{ width: "100%", height: 280, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 24, left: 24 }}>
                <h3 style={{ fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>Mujer</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>Colección 2026</p>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer" }}>
            <Link to="/tienda" style={{ display: "block" }}>
              <img src={categoryMen} alt="Hombre" width={600} height={220} style={{ width: "100%", height: 220, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20 }}>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>Hombre</h3>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer", background: "#111", minHeight: 180 }}>
            <Link to="/configurador" style={{ display: "block", padding: "28px", position: "relative", minHeight: 180 }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <img src={configuradorBg} alt="" width={600} height={180} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.95, filter: "grayscale(30%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 6 }}>Exclusivo</p>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>Configurador 3D Premium</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>Diseña tu prenda personalizada.</p>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} style={{ position: "relative", overflow: "hidden", borderRadius: 20 }}>
            <Link to="/tienda" style={{ display: "block" }}>
              <img src={collectionEveryday} alt="Everyday" width={600} height={260} style={{ width: "100%", height: 260, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 24, left: 24 }}>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>Lo esencial, reinventado</h3>
              </div>
            </Link>
          </motion.div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 12 }}>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ gridRow: "1 / 3", position: "relative", overflow: "hidden", borderRadius: 20, cursor: "pointer" }}>
            <Link to="/tienda" style={{ display: "block", height: "100%", minHeight: 520 }}>
              <img src={categoryWomen} alt="Mujer" width={400} height={600} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease" }}
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
              <img src={categoryMen} alt="Hombre" width={400} height={300} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", transition: "transform 0.7s ease" }}
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
                <img src={configuradorBg} alt="" width={400} height={220} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.95, filter: "grayscale(30%)" }} />
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
              <img src={collectionEveryday} alt="Everyday" width={400} height={600} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease" }}
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

export default CategoriesGrid;
