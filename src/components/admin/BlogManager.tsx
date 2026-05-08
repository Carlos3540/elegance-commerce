// src/components/admin/BlogManager.tsx
// Agregar esta sección al AdminDashboard — ver instrucciones al final
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star, ImageIcon, Upload, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BlogModal, { type BlogPost } from "@/components/admin/BlogModal";

const CATEGORY_COLORS: Record<string, string> = {
  Tendencias: "#C4395A", Consejos: "#7c3aed", Sostenibilidad: "#2563eb",
  Estilo: "#C4395A", Cultura: "#7c3aed", General: "#6b7280",
};

// ── Banner Manager ─────────────────────────────────────────────
const DEFAULT_TITLE    = "Nuestra Gazette";
const DEFAULT_SUBTITLE = "Historias, tendencias y la esencia detrás de cada prenda que creamos en Colombia.";

const BannerManager = () => {
  const [mode, setMode]               = useState<"default" | "custom">("default");
  const [bannerUrl, setBannerUrl]     = useState("");
  const [uploading, setUploading]     = useState(false);
  const [saved, setSaved]             = useState(false);
  const [bannerTitle, setBannerTitle] = useState(DEFAULT_TITLE);
  const [bannerSub, setBannerSub]     = useState(DEFAULT_SUBTITLE);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("blog_banners").select("*").eq("key", "hero").single()
      .then(({ data }) => {
        if (data) {
          setBannerTitle(data.title || DEFAULT_TITLE);
          setBannerSub(data.subtitle || DEFAULT_SUBTITLE);
          setBannerUrl(data.image_url || "");
          setMode(data.image_url ? "custom" : "default");
        }
      });
  }, []);

  const uploadBanner = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const path = `banners/hero-${Date.now()}.${file.name.split(".").pop()}`;
    await supabase.storage.from("blog").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("blog").getPublicUrl(path);
    setBannerUrl(data.publicUrl);
    setUploading(false);
  };

  const saveBanner = async () => {
    await supabase.from("blog_banners").upsert({
      key: "hero",
      image_url: mode === "default" ? "" : bannerUrl,
      title: bannerTitle,
      subtitle: bannerSub,
      is_active: true,
    }, { onConflict: "key" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const lbl = (text: string) => (
    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" as const, fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 6 }}>{text}</label>
  );
  const inputSt: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "#0c0e1a", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ background: "#0f1120", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 18, padding: "24px 28px", marginBottom: 28 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <ImageIcon size={16} color="#7da4ff" />
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>Banner del Blog</h3>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>— hero principal</span>
      </div>

      {/* Selector de modo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {([
          { key: "default", emoji: "🎨", label: "Diseño original", desc: "Blobs animados (predeterminado)" },
          { key: "custom",  emoji: "🖼️", label: "Imagen personalizada", desc: "Sube tu propia foto de fondo" },
        ] as const).map(opt => (
          <button key={opt.key} onClick={() => setMode(opt.key)}
            style={{ padding: "14px 18px", borderRadius: 12, border: "1.5px solid", textAlign: "left", cursor: "pointer", transition: "all 0.18s", borderColor: mode === opt.key ? "#7da4ff" : "rgba(255,255,255,0.08)", background: mode === opt.key ? "rgba(125,164,255,0.1)" : "transparent" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: mode === opt.key ? "#7da4ff" : "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>
              {opt.emoji} {opt.label}
            </p>
            <p style={{ fontSize: 11, color: mode === opt.key ? "rgba(125,164,255,0.55)" : "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>{opt.desc}</p>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mode === "custom" ? "260px 1fr" : "1fr", gap: 24, alignItems: "start" }}>

        {/* Imagen — solo en modo custom */}
        {mode === "custom" && (
          <div>
            {lbl("Imagen de fondo")}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => e.target.files?.[0] && uploadBanner(e.target.files[0])} />
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 150, background: "#0c0e1a", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}
              onClick={() => fileRef.current?.click()}>
              {bannerUrl
                ? <img src={bannerUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Upload size={20} color="rgba(255,255,255,0.2)" />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>Click para subir</span>
                  </div>
              }
              {uploading && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader2 size={24} color="#7da4ff" style={{ animation: "spin 0.8s linear infinite" }} />
                </div>
              )}
              {bannerUrl && !uploading && (
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "4px 8px" }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>Click para cambiar</span>
                </div>
              )}
            </div>
            <input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)}
              placeholder="O pega una URL de imagen..."
              style={{ width: "100%", marginTop: 8, padding: "8px 12px", background: "#0c0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}

        {/* Textos — siempre visibles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "default" && (
            <div style={{ background: "rgba(125,164,255,0.06)", border: "1px solid rgba(125,164,255,0.14)", borderRadius: 10, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <p style={{ fontSize: 12, color: "rgba(125,164,255,0.7)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                Se usará el fondo animado original. Solo se actualizarán el título y subtítulo que escribas abajo.
              </p>
            </div>
          )}
          <div>
            {lbl("Título")}
            <input value={bannerTitle} onChange={e => setBannerTitle(e.target.value)}
              placeholder={DEFAULT_TITLE} style={inputSt} />
          </div>
          <div>
            {lbl("Subtítulo")}
            <input value={bannerSub} onChange={e => setBannerSub(e.target.value)}
              placeholder={DEFAULT_SUBTITLE} style={inputSt} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={saveBanner}
              style={{ padding: "10px 24px", borderRadius: 10, background: saved ? "rgba(52,211,153,0.15)" : "#7da4ff", color: saved ? "#34d399" : "#0c0e1a", fontSize: 13, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", border: saved ? "1px solid rgba(52,211,153,0.3)" : "none", cursor: "pointer", transition: "all 0.3s" }}>
              {saved ? "✓ Guardado" : "Guardar cambios"}
            </button>
            {mode === "default" && (
              <button onClick={() => { setBannerTitle(DEFAULT_TITLE); setBannerSub(DEFAULT_SUBTITLE); }}
                style={{ padding: "10px 18px", borderRadius: 10, background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                Restaurar textos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main BlogManager ───────────────────────────────────────────
const BlogManager = () => {
  const [posts, setPosts]         = useState<BlogPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"all" | "published" | "draft">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPost, setEditPost]   = useState<BlogPost | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    fetchPosts();
  };

  const togglePublish = async (post: BlogPost) => {
    await supabase.from("blog_posts").update({
      is_published: !post.is_published,
      published_at: !post.is_published ? new Date().toISOString() : null,
    }).eq("id", post.id!);
    fetchPosts();
  };

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : filter === "published" ? p.is_published : !p.is_published;
    return matchSearch && matchFilter;
  });

  const published = posts.filter(p => p.is_published).length;
  const drafts    = posts.filter(p => !p.is_published).length;

  return (
    <div style={{ padding: "30px 36px" }}>
      <BlogModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditPost(null); }}
        onSuccess={fetchPosts}
        post={editPost}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>Blog / Gazette</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
            {loading ? "Cargando..." : `${published} publicados · ${drafts} borradores`}
          </p>
        </div>
        <button onClick={() => { setEditPost(null); setModalOpen(true); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, background: "#7da4ff", color: "#0c0e1a", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
          <Plus size={16} /> Nuevo artículo
        </button>
      </div>

      {/* Banner manager */}
      <BannerManager />

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.22)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar artículos..."
            style={{ width: "100%", padding: "11px 16px 11px 42px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#0f1120", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
        </div>
        {(["all", "published", "draft"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid", borderColor: filter === f ? "#7da4ff" : "rgba(255,255,255,0.08)", background: filter === f ? "rgba(125,164,255,0.1)" : "transparent", color: filter === f ? "#7da4ff" : "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>
            {f === "all" ? "Todos" : f === "published" ? "Publicados" : "Borradores"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#0f1120", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 18, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ width: 32, height: 32, border: "2px solid rgba(99,153,255,0.3)", borderTopColor: "#7da4ff", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
                {["Artículo", "Categoría", "Estado", "Fecha", "Acciones"].map((h, i) => (
                  <th key={h} style={{ padding: "14px 22px", textAlign: i === 4 ? "right" : "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 50, textAlign: "center", color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  {search ? `Sin resultados para "${search}"` : "No hay artículos. ¡Crea el primero!"}
                </td></tr>
              ) : filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.032)" }}>
                  {/* Artículo */}
                  <td style={{ padding: "14px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#0c0e1a", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {p.cover_url
                          ? <img src={p.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon size={16} color="rgba(255,255,255,0.15)" /></div>
                        }
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: p.is_published ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{p.title}</p>
                          {p.is_featured && <Star size={12} color="#fbbf24" fill="#fbbf24" />}
                        </div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                          {p.author_name} · {p.read_time} de lectura
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Categoría */}
                  <td style={{ padding: "14px 22px" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: CATEGORY_COLORS[p.category] || "#6b7280", background: (CATEGORY_COLORS[p.category] || "#6b7280") + "18", padding: "4px 12px", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>
                      {p.category}
                    </span>
                  </td>
                  {/* Estado */}
                  <td style={{ padding: "14px 22px" }}>
                    <button onClick={() => togglePublish(p)}
                      style={{ fontSize: 12, fontWeight: 700, color: p.is_published ? "#34d399" : "rgba(255,255,255,0.3)", background: p.is_published ? "rgba(52,211,153,0.09)" : "rgba(255,255,255,0.05)", padding: "5px 14px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      {p.is_published ? <><Eye size={11} /> Publicado</> : <><EyeOff size={11} /> Borrador</>}
                    </button>
                  </td>
                  {/* Fecha */}
                  <td style={{ padding: "14px 22px", fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
                      : "—"
                    }
                  </td>
                  {/* Acciones */}
                  <td style={{ padding: "14px 22px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      {p.is_published && (
                        <a href={`/blog/${p.slug}`} target="_blank"
                          style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", color: "#34d399", padding: "7px 10px", borderRadius: 8, display: "flex", alignItems: "center", textDecoration: "none" }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button onClick={() => { setEditPost(p); setModalOpen(true); }}
                        style={{ background: "rgba(99,153,255,0.08)", border: "1px solid rgba(99,153,255,0.15)", cursor: "pointer", color: "#7da4ff", padding: "7px 10px", borderRadius: 8 }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => deletePost(p.id!, p.title)}
                        style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", cursor: "pointer", color: "#f87171", padding: "7px 10px", borderRadius: 8 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default BlogManager;