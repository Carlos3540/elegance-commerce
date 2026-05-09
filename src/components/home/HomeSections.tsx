import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Star, RotateCcw, Truck, RefreshCw, Shield } from "lucide-react";

export const StatsBar = () => {
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

export const Testimonials = () => {
  const isMobile = useIsMobile();
  const testimonials = [
    { name: "Valentina R.", location: "Bogotá", rating: 5, text: "La calidad supera mis expectativas. El tejido es increíble y el envío llegó rapidísimo. Ya hice mi segundo pedido.", avatar: "V" },
    { name: "María C.", location: "Medellín", rating: 5, text: "Me encanta cómo cada prenda tiene un diseño tan pensado. Se nota la dedicación. Mis amigas siempre me preguntan dónde compro.", avatar: "M" },
    { name: "Laura P.", location: "Cali", rating: 5, text: "El configurador 3D es una pasada, pude ver exactamente cómo quedaba antes de comprar. Totalmente diferente a otras tiendas.", avatar: "L" },
    { name: "Andrea M.", location: "Cartagena", rating: 5, text: "Servicio al cliente excepcional. Tuve una duda con mi talla y me ayudaron al instante. La prenda llegó perfecta.", avatar: "A" },
  ];
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
        {testimonials.map((t, i) => (
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

export const ConfiguradorBanner = () => {
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

export const Benefits = () => {
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
