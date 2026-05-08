import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Mail, Phone, MapPin, ArrowUpRight, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

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

const LINKS_TIENDA = [
  { label: "Mujer", to: "/tienda" },
  { label: "Hombre", to: "/tienda" },
  { label: "Accesorios", to: "/tienda" },
  { label: "Outlet", to: "/tienda" },
  { label: "Nuevas llegadas", to: "/tienda" },
];

const LINKS_EMPRESA = [
  { label: "Nosotros", to: "/" },
  { label: "Contacto", to: "/contacto" },
  { label: "Blog", to: "/blog" },
  { label: "Configurador 3D", to: "/configurador" },
  { label: "Política de privacidad", to: "#" },
];

const Footer = () => {
  const isMobile = useIsMobile();

  return (
    <footer style={{
      background: "linear-gradient(160deg, #0a0a0a 0%, #111118 50%, #0d0d14 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* ── Background mesh ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)",
        backgroundSize: "36px 36px",
      }} />
      <motion.div
        animate={{ opacity: [0.3, 0.55, 0.3], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: -120, left: "30%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,57,90,0.1) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          position: "absolute", bottom: 0, right: "10%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,57,196,0.08) 0%, transparent 70%)",
          filter: "blur(50px)", pointerEvents: "none",
        }}
      />

      {/* ── Newsletter banner ── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: isMobile ? "40px 20px" : "52px 0",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0" : "0 48px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
            gap: isMobile ? 28 : 48,
            alignItems: "center",
          }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.22em", color: "#C4395A", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 10 }}>
                Newsletter
              </p>
              <h3 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Recibe las nuevas colecciones<br />
                <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300, fontStyle: "italic" }}>antes que nadie.</span>
              </h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              style={{ display: "flex", gap: 0, maxWidth: 420, width: "100%" }}
            >
              <input
                type="email"
                placeholder="tu@email.com"
                style={{
                  flex: 1, padding: "14px 20px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRight: "none",
                  borderRadius: "8px 0 0 8px",
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  minWidth: 0,
                }}
              />
              <button style={{
                padding: "14px 22px",
                background: "#C4395A",
                border: "none",
                borderRadius: "0 8px 8px 0",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                color: "#fff", fontSize: 12, fontWeight: 900,
                letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
              }}>
                Suscribir <ArrowRight size={13} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "52px 20px 40px" : "64px 48px 48px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1.4fr",
          gap: isMobile ? 40 : 48,
        }}>

          {/* ── Brand column ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Logo wordmark */}
            <div style={{ marginBottom: 20 }}>
              <span style={{
                fontSize: 32, fontWeight: 900, color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.04em", lineHeight: 1,
              }}>
                EVOLET
              </span>
              <span style={{
                display: "block", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.3em", color: "#C4395A",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase", marginTop: 2,
              }}>
                Colombia · Est. 2019
              </span>
            </div>

            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.75, marginBottom: 28, maxWidth: 280,
            }}>
              Moda contemporánea hecha en Colombia. Prendas que empoderan, diseños que se recuerdan.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: <Instagram size={15} />, href: "https://instagram.com/EVOLET_96", label: "Instagram" },
                {
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/></svg>,
                  href: "https://tiktok.com/@evolet96", label: "TikTok"
                },
                {
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
                  href: "https://wa.me/573001234567", label: "WhatsApp"
                },
              ].map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.12, background: "#C4395A" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.6)", textDecoration: "none",
                    transition: "background 0.2s",
                  }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ── Tienda column ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p style={{
              fontSize: 9, fontWeight: 900, letterSpacing: "0.26em",
              color: "#C4395A", fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase", marginBottom: 20,
            }}>
              Tienda
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {LINKS_TIENDA.map((link, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                >
                  <Link
                    to={link.to}
                    style={{
                      fontSize: 13, color: "rgba(255,255,255,0.45)",
                      fontFamily: "'DM Sans', sans-serif",
                      textDecoration: "none", display: "inline-flex",
                      alignItems: "center", gap: 6,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  >
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(196,57,90,0.5)", flexShrink: 0 }} />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ── Empresa column ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
          >
            <p style={{
              fontSize: 9, fontWeight: 900, letterSpacing: "0.26em",
              color: "#C4395A", fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase", marginBottom: 20,
            }}>
              Empresa
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {LINKS_EMPRESA.map((link, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                >
                  <Link
                    to={link.to}
                    style={{
                      fontSize: 13, color: "rgba(255,255,255,0.45)",
                      fontFamily: "'DM Sans', sans-serif",
                      textDecoration: "none", display: "inline-flex",
                      alignItems: "center", gap: 6,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  >
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(196,57,90,0.5)", flexShrink: 0 }} />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ── Contacto column ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.26 }}
          >
            <p style={{
              fontSize: 9, fontWeight: 900, letterSpacing: "0.26em",
              color: "#C4395A", fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase", marginBottom: 20,
            }}>
              Contacto
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: <MapPin size={14} />, text: "Calle 123 #45-67, Bogotá" },
                { icon: <Phone size={14} />, text: "+57 1 234 5678" },
                { icon: <Mail size={14} />, text: "soporte@evolet96.com" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.28 + i * 0.07 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: "rgba(196,57,90,0.12)",
                    border: "1px solid rgba(196,57,90,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#C4395A",
                  }}>
                    {item.icon}
                  </div>
                  <span style={{
                    fontSize: 13, color: "rgba(255,255,255,0.45)",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.5, paddingTop: 7,
                  }}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              href="https://wa.me/573001234567"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginTop: 24,
                background: "rgba(37,211,102,0.1)",
                border: "1px solid rgba(37,211,102,0.2)",
                borderRadius: 8, padding: "10px 18px",
                textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#25D366", fontFamily: "'DM Sans', sans-serif" }}>Escríbenos</span>
            </motion.a>
          </motion.div>
        </div>

        {/* ── Bottom bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: 56, paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <p style={{
            fontSize: 11, color: "rgba(255,255,255,0.25)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            © 2026 EVOLET. Todos los derechos reservados. Hecho con ❤️ en Colombia.
          </p>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Términos", "Privacidad", "Cookies"].map((item, i) => (
              <a
                key={i}
                href="#"
                style={{
                  fontSize: 11, color: "rgba(255,255,255,0.25)",
                  fontFamily: "'DM Sans', sans-serif",
                  textDecoration: "none", transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Back to top */}
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ scale: 1.08, background: "#C4395A" }}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.5)",
              transition: "background 0.2s", flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;