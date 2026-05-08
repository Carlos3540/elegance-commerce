import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import { MapPin, Phone, Mail, Clock, ArrowRight, Instagram, Send } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

// ── Ticker ──────────────────────────────────────────────────────
const TICKER = ["CONTÁCTANOS", "ESTAMOS PARA AYUDARTE", "BOGOTÁ · COLOMBIA", "RESPUESTA EN 24H", "SOPORTE EXCLUSIVO"];
const Ticker = () => (
  <div style={{ background: "#111", overflow: "hidden", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <motion.div
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      style={{ display: "flex", whiteSpace: "nowrap" }}
    >
      {[...TICKER, ...TICKER].map((t, i) => (
        <span key={i} style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.55)", padding: "0 32px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
          {t} <span style={{ color: "#C4395A", marginLeft: 16 }}>✦</span>
        </span>
      ))}
    </motion.div>
  </div>
);

// ── Hero ────────────────────────────────────────────────────────
const ContactHero = () => {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} style={{ position: "relative", background: "#111", overflow: "hidden", padding: isMobile ? "110px 20px 80px" : "140px 80px 100px" }}>
      {/* Grid texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)", backgroundSize: "36px 36px", pointerEvents: "none" }} />

      {/* Ambient blobs */}
      <motion.div animate={{ opacity: [0.4, 0.7, 0.4], x: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity }}
        style={{ position: "absolute", top: -100, right: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,57,90,0.14) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
      <motion.div animate={{ opacity: [0.3, 0.55, 0.3], y: [0, -20, 0] }} transition={{ duration: 13, repeat: Infinity, delay: 3 }}
        style={{ position: "absolute", bottom: -60, left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

      {/* Vertical side text */}
      {!isMobile && (
        <div style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", color: "rgba(255,255,255,0.12)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            EVOLET · BOGOTÁ · COLOMBIA · 2026
          </span>
        </div>
      )}

      <motion.div style={{ y, opacity, position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <div style={{ width: 24, height: 2, background: "#C4395A", borderRadius: 2 }} />
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.25em", color: "#C4395A", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
            Atención al cliente
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          style={{ fontSize: isMobile ? "clamp(44px, 12vw, 72px)" : "clamp(64px, 9vw, 112px)", fontWeight: 900, fontFamily: "'DM Sans', sans-serif", color: "#fff", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 28 }}
        >
          <span style={{ fontStyle: "italic", fontWeight: 300 }}>Hablemos</span><br />
          Contigo<span style={{ color: "#C4395A" }}>.</span>
        </motion.h1>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.6 }}
          style={{ width: 60, height: 2, background: "linear-gradient(to right, #C4395A, transparent)", marginBottom: 24, transformOrigin: "left" }} />

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, maxWidth: 420 }}>
          Estamos aquí para ayudarte. Escríbenos, llámanos o visítanos. Respuesta garantizada en menos de 24 horas.
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}
        style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 2 }}>
        <span style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>Scroll</span>
        <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)" }} />
      </motion.div>
    </section>
  );
};

// ── Stats bar ───────────────────────────────────────────────────
const StatsBar = () => {
  const isMobile = useIsMobile();
  const stats = [
    { value: "< 24h", label: "Tiempo de respuesta" },
    { value: "98%", label: "Clientes satisfechos" },
    { value: "L–V", label: "8AM – 6PM atención" },
    { value: "Col.", label: "Bogotá, Colombia" },
  ];
  return (
    <section style={{ background: "#fafaf9", borderBottom: "1px solid #ebebeb" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "20px 0" : 0 }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            style={{ textAlign: "center", padding: "0 16px", borderRight: isMobile ? (i % 2 === 0 ? "1px solid #ebebeb" : "none") : (i < 3 ? "1px solid #ebebeb" : "none") }}>
            <p style={{ fontSize: 26, fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.04em" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#999", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ── Contact info cards ──────────────────────────────────────────
const INFO_ITEMS = [
  {
    icon: MapPin,
    title: "Dirección",
    lines: ["Calle 123 #45-67", "Bogotá, Colombia"],
    accent: "#C4395A",
  },
  {
    icon: Phone,
    title: "Teléfono",
    lines: ["+57 1 234 5678", "+57 300 123 4567"],
    accent: "#7c3aed",
  },
  {
    icon: Mail,
    title: "Correo",
    lines: ["soporte@evolet96.com"],
    accent: "#2563eb",
  },
  {
    icon: Clock,
    title: "Horario",
    lines: ["Lun–Vie: 8AM – 6PM", "Sáb: 9AM – 2PM"],
    accent: "#C4395A",
  },
];

// ── Main Contact page ───────────────────────────────────────────
const Contact = () => {
  const isMobile = useIsMobile();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9" }}>
      <Ticker />



      {/* Hero */}
      <ContactHero />

      {/* Stats */}
      <StatsBar />

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "52px 16px" : "80px 80px" }}>

        {/* Info cards row */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12, marginBottom: 64 }}>
          {INFO_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4 }}
              style={{
                background: "#fff", border: "1px solid #ebebeb",
                borderRadius: 20, padding: "24px 20px",
                transition: "all 0.3s",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Top accent line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, ${item.accent}, transparent)` }} />

              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.accent}15`, border: `1px solid ${item.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <item.icon size={18} color={item.accent} />
              </div>

              <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: item.accent, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>
                {item.title}
              </p>
              {item.lines.map((line, j) => (
                <p key={j} style={{ fontSize: 13, color: "#666", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{line}</p>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Form + Map */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

          {/* ── Form ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 24, padding: isMobile ? "32px 24px" : "48px 44px", position: "relative", overflow: "hidden" }}
          >
            {/* Top accent */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(to right, #C4395A, #7c3aed, transparent)" }} />

            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.22em", color: "#C4395A", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>
                Formulario
              </p>
              <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Envíanos un<br />
                <span style={{ fontStyle: "italic", fontWeight: 300 }}>mensaje.</span>
              </h2>
            </motion.div>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: "linear-gradient(135deg, #111 0%, #1a1a2e 100%)",
                  borderRadius: 16, padding: "40px 32px", textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>¡Mensaje enviado!</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>Te responderemos en menos de 24 horas.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                  {[
                    { key: "name", placeholder: "Nombre completo", type: "text" },
                    { key: "email", placeholder: "Correo electrónico", type: "email" },
                  ].map(({ key, placeholder, type }) => (
                    <input
                      key={key}
                      type={type}
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      required
                      style={{
                        padding: "14px 18px",
                        background: "#fafaf9",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        fontSize: 13, color: "#111",
                        fontFamily: "'DM Sans', sans-serif",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = "#C4395A")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    />
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Asunto"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                  style={{
                    padding: "14px 18px",
                    background: "#fafaf9", border: "1px solid #e5e7eb",
                    borderRadius: 12, fontSize: 13, color: "#111",
                    fontFamily: "'DM Sans', sans-serif", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C4395A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />

                <textarea
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                  style={{
                    padding: "14px 18px",
                    background: "#fafaf9", border: "1px solid #e5e7eb",
                    borderRadius: 12, fontSize: 13, color: "#111",
                    fontFamily: "'DM Sans', sans-serif", outline: "none",
                    resize: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C4395A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#111", color: "#fff",
                    padding: "15px 32px", borderRadius: 100,
                    fontSize: 11, fontWeight: 900, letterSpacing: "0.14em",
                    textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
                    border: "none", cursor: "pointer",
                  }}
                >
                  <Send size={13} /> Enviar Mensaje
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* ── Map + Social ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Map */}
            <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid #ebebeb", flex: 1, minHeight: 340 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.8!2d-74.06!3d4.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMzknMDAuMCJOIDc0wrAwMycwMC4wIlc!5e0!3m2!1ses!2sco!4v1234567890"
                width="100%"
                height="100%"
                style={{ minHeight: 340, border: 0, display: "block", filter: "grayscale(20%) contrast(1.05)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación EVOLET"
              />
            </div>

            {/* Dark card — WhatsApp CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{
                background: "#111", borderRadius: 20, padding: "28px 32px",
                position: "relative", overflow: "hidden",
                display: "flex", flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between", gap: 20,
              }}
            >
              {/* Blob decoration */}
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%", background: "linear-gradient(135deg, rgba(196,57,90,0.15), rgba(124,58,237,0.1), transparent)", filter: "blur(12px)", pointerEvents: "none" }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 6 }}>
                  Respuesta inmediata
                </p>
                <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>
                  Escríbenos por WhatsApp
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                  Disponible Lun–Sáb durante horario de atención
                </p>
              </div>
              <motion.a
                href="https://wa.me/573001234567"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#25D366", color: "#fff",
                  padding: "13px 22px", borderRadius: 100,
                  fontSize: 11, fontWeight: 900, letterSpacing: "0.1em",
                  textTransform: "uppercase", textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap", flexShrink: 0,
                  position: "relative", zIndex: 1,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </motion.a>
            </motion.div>

            {/* Social row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 20, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
            >
              <div>
                <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#999", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 4 }}>Síguenos</p>
                <p style={{ fontSize: 14, fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>@EVOLET_96</p>
              </div>
              <motion.a
                href="https://instagram.com/EVOLET_96"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  color: "#fff", padding: "11px 20px", borderRadius: 100,
                  fontSize: 11, fontWeight: 900, letterSpacing: "0.1em",
                  textTransform: "uppercase", textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Instagram size={13} /> Instagram
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;