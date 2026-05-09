import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Instagram, ArrowRight } from "lucide-react";
import ig1 from "@/assets/ig1.jpg";
import ig2 from "@/assets/ig2.jpg";
import ig3 from "@/assets/ig3.jpg";
import ig4 from "@/assets/ig4.jpg";
import ig5 from "@/assets/ig5.jpg";
import ig6 from "@/assets/ig6.jpg";

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
            {post.src && <img src={post.src} alt={post.caption} width={200} height={200} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
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

export default InstagramFeed;
