// src/pages/BlogPost.tsx
// Ruta: /blog/:slug
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Calendar, ArrowRight } from "lucide-react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import { supabase } from "@/lib/supabase";

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string;
  content: string; cover_url: string; category: string;
  author_name: string; read_time: string; published_at: string;
}

const BORDER = "1px solid #E5E5E5";
const SHADOW = "0 4px 20px rgba(0,0,0,0.04)";
const HOVER_SHADOW = "0 8px 30px rgba(0,0,0,0.08)";

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

const BlogPostPage = () => {
  const isMobile = useIsMobile();
  const { slug }       = useParams<{ slug: string }>();
  const navigate       = useNavigate();
  const [post, setPost]         = useState<BlogPost | null>(null);
  const [related, setRelated]   = useState<BlogPost[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase.from("blog_posts")
      .select("*").eq("slug", slug).eq("is_published", true).single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return; }
        setPost(data);
        setLoading(false);
        // Fetch related
        supabase.from("blog_posts")
          .select("id,title,slug,excerpt,content,cover_url,category,author_name,read_time,published_at")
          .eq("is_published", true).eq("category", data.category)
          .neq("id", data.id).limit(3)
          .then(({ data: rel }) => setRelated(rel || []));
      });
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 400, fontFamily: "'Playfair Display', serif", color: "#1A1C20", textTransform: "uppercase", letterSpacing: "0.1em" }}>Cargando</h2>
        <div style={{ width: 60, height: 2, background: "#B8860B", margin: "20px auto 0", animation: "pulse 1.5s infinite" }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );

  if (notFound || !post) return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <Navbar />
      <div style={{ paddingTop: 120, textAlign: "center", padding: "160px 24px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ background: "#FFFFFF", border: BORDER, borderRadius: "8px", padding: "64px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 20, color: "#E5E5E5" }}>🪶</div>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: "#1A1C20", fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Artículo no encontrado</h1>
          <p style={{ fontSize: 15, color: "#4A4A4A", fontWeight: 400, fontFamily: "'DM Sans', sans-serif", marginBottom: 32 }}>Es posible que haya sido eliminado o que la URL sea incorrecta.</p>
          <Link to="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1A1C20", color: "#fff", padding: "14px 32px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", borderRadius: "2px", letterSpacing: "0.08em" }}>
            <ArrowLeft size={16} /> Volver al Blog
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );


  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const paragraphs = post.content.split(/\n\n+/).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ paddingBottom: 80 }}>
        {/* Cover Hero - Luxury Layout */}
        <div style={{ padding: "120px 5vw 64px", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          
          <button onClick={() => navigate(-1)}
            style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: "#4A4A4A", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif", padding: 0, transition: "color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1A1C20"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4A4A4A"; }}>
            <ArrowLeft size={16} /> Volver
          </button>

          <div style={{ position: "relative" }}>
            {/* Image Box */}
            <div style={{ width: "100%", height: "60vh", minHeight: 400, background: "#f9f9f9", borderRadius: "4px", position: "relative", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              {post.cover_url && (
                <img src={post.cover_url} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              )}
            </div>

            {/* Title Box - Overlapping */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              style={{ background: "#FFFFFF", padding: "40px clamp(20px, 5vw, 64px)", maxWidth: 900, margin: "-100px auto 0", position: "relative", zIndex: 10, boxShadow: "0 10px 40px rgba(0,0,0,0.08)", borderRadius: "4px" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ border: "1px solid #E5E5E5", borderRadius: "100px", color: "#B8860B", padding: "6px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{post.category}</span>
                {formattedDate && <span style={{ color: "#4A4A4A", padding: "6px 0", fontSize: 12, fontWeight: 400, fontFamily: "'DM Sans', sans-serif" }}>{formattedDate}</span>}
              </div>
              
              <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 300, color: "#1A1C20", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 32 }}>
                {post.title}
              </h1>

              <div style={{ borderTop: "1px solid #E5E5E5", paddingTop: 20, display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap", fontWeight: 400, fontSize: 13, color: "#4A4A4A", fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <User size={16} color="#B8860B" /> <span>Por {post.author_name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={16} color="#B8860B" /> <span>{post.read_time} de lectura</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "40px 24px" }}>
          
          {post.excerpt && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ background: "#FDFDFD", borderLeft: "4px solid #B8860B", padding: "32px 40px", fontSize: 18, fontStyle: "italic", fontWeight: 400, color: "#4A4A4A", fontFamily: "'Playfair Display', serif", lineHeight: 1.6, marginBottom: 56 }}>
              "{post.excerpt}"
            </motion.div>
          )}

          <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="blog-body"
            style={{ fontSize: 17, color: "#4A4A4A", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8 }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ marginBottom: 32, position: "relative" }}>
                {/* Drop cap effect for first paragraph */}
                {i === 0 && (
                   <span style={{ float: "left", fontSize: 64, lineHeight: 0.8, fontWeight: 300, fontFamily: "'Playfair Display', serif", marginRight: 16, color: "#B8860B", marginTop: 8 }}>
                     {para.charAt(0)}
                   </span>
                )}
                {i === 0 ? <span>{para.slice(1)}</span> : para}
              </p>
            ))}
          </motion.article>

          <style>{`
            .blog-body p { margin-bottom: 32px; }
            .blog-body b, .blog-body strong { font-weight: 600; color: "#1A1C20"; }
            .blog-body a { color: #B8860B; text-decoration: none; border-bottom: 1px solid #B8860B; transition: opacity 0.2s; }
            .blog-body a:hover { opacity: 0.7; }
          `}</style>
          
          {/* Post Footer */}
          <div style={{ marginTop: 80, borderTop: "1px solid #E5E5E5", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <span style={{ display: "inline-block", color: "#A0A0A0", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
               FIN DEL ARTÍCULO
             </span>
             <Link to="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 600, color: "#1A1C20", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#B8860B"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#1A1C20"}>
                Volver <ArrowRight size={16} />
             </Link>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div style={{ background: "#F9F9F9", padding: "80px clamp(20px, 5vw, 80px)", marginTop: 64 }}>
            <div style={{ maxWidth: 1400, margin: "0 auto" }}>
              <div style={{ borderBottom: "1px solid #E5E5E5", paddingBottom: 16, marginBottom: 48 }}>
                <h2 style={{ fontSize: 28, fontWeight: 400, fontFamily: "'Playfair Display', serif", color: "#1A1C20", margin: 0 }}>Sigue Leyendo</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 32 }}>
                {related.map((rel, i) => {
                  return (
                    <motion.div key={rel.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                      <Link to={`/blog/${rel.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", background: "#FFFFFF", border: BORDER, borderRadius: "6px", overflow: "hidden", transition: "box-shadow 0.3s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = HOVER_SHADOW; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
                        
                        {rel.cover_url && (
                          <div style={{ height: 220, borderBottom: BORDER, overflow: "hidden" }}>
                            <img src={rel.cover_url} alt={rel.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} 
                              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}/>
                          </div>
                        )}
                        <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                          <span style={{ alignSelf: "flex-start", color: "#B8860B", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{rel.category}</span>
                          <h3 style={{ fontSize: 20, fontWeight: 400, color: "#1A1C20", fontFamily: "'Playfair Display', serif", lineHeight: 1.3, marginBottom: 16 }}>{rel.title}</h3>
                          
                          <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid #E5E5E5", display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 500, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif" }}>
                            <span>{rel.read_time} Lectura</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#B8860B" }}>Leer <ArrowRight size={14}/></span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;