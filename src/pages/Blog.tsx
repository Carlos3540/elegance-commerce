// src/pages/Blog.tsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import { supabase } from "@/lib/supabase";

// ── Types ───────────────────────────────────────────────────────
interface BlogPost {
  id: string; title: string; slug: string; excerpt: string;
  cover_url: string; category: string; author_name: string;
  read_time: string; is_featured: boolean; published_at: string;
}
interface Banner { title: string; subtitle: string; image_url: string; }

// ── Mobile hook ────────────────────────────────────────────────
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

// ── Midnight Luxury Styles ───────────────────────────────────────
const CATEGORIES = ["Todo", "Tendencias", "Consejos", "Sostenibilidad", "Estilo", "Cultura", "General"];

const BORDER = "1px solid #E5E5E5";
const SHADOW = "0 4px 20px rgba(0,0,0,0.04)";
const HOVER_SHADOW = "0 8px 30px rgba(0,0,0,0.08)";

// ── Ticker ─────────────────────────────────────────────────────
const TICKER = ["★ THE GAZETTE ★", "DISEÑO COLOMBIANO", "LUXURY FASHION", "NUEVAS COLECCIONES", "TENDENCIAS 2026", "ESTILO ÚNICO"];
const BlogTicker = () => (
  <div style={{ background: "#1A1C20", overflow: "hidden", padding: "12px 0", marginTop: 0 }}>
    <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{ display: "flex", whiteSpace: "nowrap", alignItems: "center" }}>
      {[...TICKER, ...TICKER].map((t, i) => (
        <span key={i} style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.15em", color: "#B8860B", padding: "0 40px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
          {t}
        </span>
      ))}
    </motion.div>
  </div>
);

// ── Blog Hero ───────────────────────────────────────────────────
const BlogHero = ({ banner }: { banner: Banner | null }) => {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: "#1A1C20", borderBottom: BORDER, padding: isMobile ? "60px 20px" : "100px 80px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: 40, position: "relative", overflow: "hidden" }}>
      
      {/* Animated Background Elements */}
      <motion.div animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(184,134,11,0.15) 0%, rgba(26,28,32,0) 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <motion.div animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: "absolute", bottom: -150, right: -50, width: 500, height: 500, background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(26,28,32,0) 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      {/* Col 1 */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ flex: 1, zIndex: 1 }}>
        <div style={{ display: "inline-block", background: "transparent", color: "#B8860B", border: "1px solid rgba(184,134,11,0.5)", borderRadius: "100px", padding: "8px 20px", fontWeight: 700, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.1em", marginBottom: 24 }}>
          Diario de Moda '26
        </div>
        <h1 style={{ fontSize: isMobile ? "clamp(44px, 12vw, 64px)" : "clamp(60px, 8vw, 110px)", fontWeight: 300, fontFamily: "'Playfair Display', serif", color: "#FFFFFF", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em" }}>
          {banner?.title || "Blog Evolet Innova."}
        </h1>
        <p style={{ fontSize: isMobile ? 15 : 18, color: "#A0A0A0", fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: 1.6, maxWidth: 500, marginBottom: 40 }}>
          {banner?.subtitle || "Historias, tendencias y la esencia pura detrás de cada prenda que creamos."}
        </p>
        <Link to="/tienda" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#B8860B", color: "#fff", padding: "16px 36px", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s", borderRadius: "2px" }}
           onMouseEnter={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#1A1C20"; }}
           onMouseLeave={(e) => { e.currentTarget.style.background = "#B8860B"; e.currentTarget.style.color = "#FFFFFF"; }}>
          Ver Colección <ArrowRight size={16} />
        </Link>
      </motion.div>

      {/* Col 2 - Banner Image */}
      {banner?.image_url && !isMobile && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
          style={{ flex: 1, height: 500, position: "relative", overflow: "hidden", borderRadius: "4px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          <motion.img animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            src={banner.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </motion.div>
      )}
    </section>
  );
};

// ── CategoryFilter ──────────────────────────────────────────────
const CategoryFilter = ({ active, onChange }: { active: string; onChange: (c: string) => void }) => {
  const isMobile = useIsMobile();
  return (
    <div style={{ background: "#FFFFFF", borderBottom: BORDER, padding: isMobile ? "20px 16px" : "24px 80px", overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 16, minWidth: "max-content" }}>
        {CATEGORIES.map((cat, i) => {
          const isActive = active === cat;
          return (
            <button key={i} onClick={() => onChange(cat)}
              style={{ background: isActive ? "#1A1C20" : "transparent", color: isActive ? "#fff" : "#4A4A4A", border: isActive ? "1px solid #1A1C20" : "1px solid #E5E5E5", borderRadius: "100px", cursor: "pointer", padding: "8px 24px", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s", flexShrink: 0 }}>
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── FeaturedCard ────────────────────────────────────────────────
const FeaturedCard = ({ post }: { post: BlogPost }) => {
  const isMobile = useIsMobile();
  return (
    <motion.article initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ background: "#FFFFFF", border: BORDER, borderRadius: "8px", overflow: "hidden", gridColumn: isMobile ? "1" : "1 / 3", display: "flex", flexDirection: isMobile ? "column" : "row", cursor: "pointer", transition: "box-shadow 0.3s" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = HOVER_SHADOW; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
      
      {/* Image Block */}
      <div style={{ flex: 1, borderRight: isMobile ? "none" : BORDER, borderBottom: isMobile ? BORDER : "none", background: "#f5f5f5", position: "relative", minHeight: 350 }}>
        {post.cover_url && (
          <img src={post.cover_url} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
        )}
      </div>

      {/* Content Block */}
      <div style={{ flex: 1, padding: isMobile ? "32px 24px" : "56px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <span style={{ color: "#B8860B", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{post.category}</span>
          <span style={{ color: "#4A4A4A", fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}><Star size={10} fill="#B8860B" color="#B8860B" /> Destacado</span>
        </div>
        <h2 style={{ fontSize: isMobile ? "clamp(28px, 6vw, 36px)" : "clamp(36px, 4vw, 52px)", fontWeight: 400, color: "#1A1C20", fontFamily: "'Playfair Display', serif", lineHeight: 1.1, marginBottom: 20 }}>
          {post.title}
        </h2>
        <p style={{ fontSize: 15, color: "#4A4A4A", fontWeight: 400, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 40 }}>{post.excerpt}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginTop: "auto" }}>
          <Link to={`/blog/${post.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#B8860B", color: "#fff", padding: "14px 32px", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", borderRadius: "2px", transition: "background 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1A1C20"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#B8860B"; }}>
            Leer Artículo <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

// ── PostCard ────────────────────────────────────────────────────
const PostCard = ({ post, index }: { post: BlogPost; index: number }) => {
  return (
    <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
      style={{ background: "#FFFFFF", border: BORDER, borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", transition: "box-shadow 0.3s" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = HOVER_SHADOW; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
      
      {/* Image Block */}
      <div style={{ height: 240, borderBottom: BORDER, position: "relative", background: "#f9f9f9", overflow: "hidden" }}>
        {post.cover_url && (
          <img src={post.cover_url} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} 
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"} />
        )}
        <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "4px 12px", fontSize: 10, fontWeight: 600, color: "#1A1C20", textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: "100px" }}>
          {post.category}
        </div>
      </div>

      <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", flex: 1, background: "#FFFFFF" }}>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: "#1A1C20", fontFamily: "'Playfair Display', serif", lineHeight: 1.3, marginBottom: 12 }}>{post.title}</h2>
        <p style={{ fontSize: 14, color: "#4A4A4A", fontWeight: 400, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 24, flex: 1 }}>{post.excerpt}</p>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid #E5E5E5", marginTop: "auto" }}>
          <span style={{ fontSize: 12, fontWeight: 400, color: "#4A4A4A", fontFamily: "'DM Sans', sans-serif" }}>
            {post.published_at ? new Date(post.published_at).toLocaleDateString("es-CO", { day: "numeric", month: "long" }) : ""}
          </span>
          <Link to={`/blog/${post.slug}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#B8860B", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", textDecoration: "none", letterSpacing: "0.05em", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#1A1C20"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#B8860B"}>
            Leer más <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

// ── Skeleton card ───────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: "#FFFFFF", border: BORDER, borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
    <div style={{ height: 240, borderBottom: BORDER, background: "#f5f5f5", animation: "pulse 1.5s ease-in-out infinite" }} />
    <div style={{ padding: "28px 24px" }}>
      <div style={{ height: 28, background: "#f0f0f0", width: "80%", marginBottom: 16, borderRadius: "2px" }} />
      <div style={{ height: 14, background: "#f5f5f5", width: "100%", marginBottom: 8, borderRadius: "2px" }} />
      <div style={{ height: 14, background: "#f5f5f5", width: "60%", borderRadius: "2px" }} />
    </div>
  </div>
);

// ── Newsletter ──────────────────────────────────────────────────
const Newsletter = () => {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ background: "#1A1C20", border: BORDER, borderRadius: "8px", padding: isMobile ? "40px 24px" : "80px", textAlign: "center", position: "relative", overflow: "hidden", marginBottom: 64, marginTop: 32 }}>
      
      {/* Background Decor */}
      <div style={{ position: "absolute", top: -50, left: -50, border: "1px solid rgba(255,255,255,0.05)", width: 200, height: 200, borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: -50, right: -50, border: "1px solid rgba(255,255,255,0.05)", width: 300, height: 300, borderRadius: "50%", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ display: "inline-block", background: "transparent", color: "#B8860B", border: "1px solid #B8860B", borderRadius: "100px", padding: "6px 16px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 24 }}>SUSCRÍBETE</p>
        <h3 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 300, color: "#fff", fontFamily: "'Playfair Display', serif", lineHeight: 1.1, marginBottom: 16 }}>
          Acceso Exclusivo<br/>a Colecciones.
        </h3>
        <p style={{ fontSize: 15, fontWeight: 400, color: "#A0A0A0", fontFamily: "'DM Sans', sans-serif", maxWidth: 450, margin: "0 auto 40px", lineHeight: 1.6 }}>Únete a The Gazette y recibe contenido sobre estilo, diseño y acceso anticipado a nuestras prendas.</p>
        
        {sent ? (
          <div style={{ background: "#B8860B", color: "#fff", padding: "16px 32px", display: "inline-block", fontWeight: 600, fontSize: 14, borderRadius: "2px", letterSpacing: "0.05em" }}>
            BIENVENIDO A LA LISTA
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, maxWidth: 500, margin: "0 auto" }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Tu correo electrónico"
              style={{ flex: 1, padding: "16px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "2px", fontSize: 14, fontWeight: 400, color: "#fff", fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.3s" }} 
              onFocus={(e) => e.target.style.borderColor = "#B8860B"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.2)"}/>
            <button onClick={() => { if (email) setSent(true); }}
              style={{ padding: "16px 36px", background: "#B8860B", border: "none", borderRadius: "2px", color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "background 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1A1C20"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#B8860B"; e.currentTarget.style.color = "#fff"; }}>
              SUSCRIBIRME
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Blog ───────────────────────────────────────────────────
const Blog = () => {
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [posts, setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner]   = useState<Banner | null>(null);

  useEffect(() => {
    supabase.from("blog_posts")
      .select("id,title,slug,excerpt,cover_url,category,author_name,read_time,is_featured,published_at")
      .eq("is_published", true).order("published_at", { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false); });

    supabase.from("blog_banners").select("*").eq("key", "hero").single()
      .then(({ data }) => { if (data) setBanner(data); });

    const channel = supabase.channel("blog-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, () => {
        supabase.from("blog_posts").select("id,title,slug,excerpt,cover_url,category,author_name,read_time,is_featured,published_at").eq("is_published", true).order("published_at", { ascending: false })
          .then(({ data }) => setPosts(data || []));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = activeCategory === "Todo" ? posts : posts.filter(p => p.category === activeCategory);
  const featured = filtered.find(p => p.is_featured) || filtered[0];
  const rest = filtered.filter(p => p.id !== featured?.id);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8" }}>
      <BlogTicker />

      <BlogHero banner={banner} />
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "40px 16px" : "64px 80px" }}>
        
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "#FFFFFF", border: BORDER, borderRadius: "8px" }}>
            <div style={{ fontSize: 48, marginBottom: 20, color: "#E5E5E5" }}>🪶</div>
            <h2 style={{ fontSize: 24, fontWeight: 400, fontFamily: "'Playfair Display', serif", color: "#1A1C20", marginBottom: 12 }}>Sin Artículos</h2>
            <p style={{ fontSize: 15, color: "#4A4A4A", fontWeight: 400, fontFamily: "'DM Sans', sans-serif" }}>
              {activeCategory === "Todo" ? "Aún no hay artículos publicados en el blog." : `No hemos publicado sobre "${activeCategory}" todavía.`}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32, marginBottom: 32 }}>
              {featured && <FeaturedCard post={featured} />}
              {rest.slice(0, 2).map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
            </div>

            {rest.length > 2 && (
              <>
                <div style={{ borderBottom: "1px solid #E5E5E5", paddingBottom: 16, margin: "64px 0 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: 24, fontWeight: 400, fontFamily: "'Playfair Display', serif", color: "#1A1C20", margin: 0 }}>Más Entradas</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 32, marginBottom: 64 }}>
                  {rest.slice(2).map((p, i) => <PostCard key={p.id} post={p} index={i + 2} />)}
                </div>
              </>
            )}
          </>
        )}

        <Newsletter />
      </div>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
    </div>
  );
};

export default Blog;