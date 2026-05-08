// src/components/admin/BlogModal.tsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ImageIcon, Eye, EyeOff, Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  category: string;
  author_name: string;
  read_time: string;
  is_published: boolean;
  is_featured: boolean;
  published_at?: string | null;
}

const CATEGORIES = ["Tendencias", "Consejos", "Sostenibilidad", "Estilo", "Cultura", "General"];

const EMPTY: BlogPost = {
  title: "", slug: "", excerpt: "", content: "",
  cover_url: "", category: "General",
  author_name: "Equipo Evolet", read_time: "5 min",
  is_published: false, is_featured: false,
};

const slugify = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post?: BlogPost | null;
}

const BlogModal = ({ isOpen, onClose, onSuccess, post }: Props) => {
  const [form, setForm]         = useState<BlogPost>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState("");
  const [preview, setPreview]   = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(post ? { ...post } : { ...EMPTY });
      setError("");
      setPreview(false);
    }
  }, [isOpen, post]);

  const set = (k: keyof BlogPost, v: any) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === "title" && !post) next.slug = slugify(v);
      return next;
    });
  };

  // ── Upload imagen ─────────────────────────────────────────
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Solo imágenes"); return; }
    if (file.size > 5 * 1024 * 1024)    { setError("Máximo 5MB");    return; }
    setUploading(true);
    const ext  = file.name.split(".").pop();
    const path = `covers/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("blog").upload(path, file, { upsert: true });
    if (upErr) { setError("Error subiendo imagen"); setUploading(false); return; }
    const { data } = supabase.storage.from("blog").getPublicUrl(path);
    set("cover_url", data.publicUrl);
    setUploading(false);
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async (publishNow?: boolean) => {
    if (!form.title.trim()) { setError("El título es obligatorio"); return; }
    if (!form.slug.trim())  { setError("El slug es obligatorio");   return; }
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      is_published: publishNow ?? form.is_published,
      published_at: (publishNow || form.is_published)
        ? (form.published_at || new Date().toISOString())
        : null,
    };

    let err;
    if (form.id) {
      ({ error: err } = await supabase.from("blog_posts").update(payload).eq("id", form.id));
    } else {
      ({ error: err } = await supabase.from("blog_posts").insert(payload));
    }

    setSaving(false);
    if (err) { setError(err.message); return; }
    onClose();
    setTimeout(() => onSuccess(), 100);
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: "#0f1120", border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10, color: "#fff", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box" as const,
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const,
    fontFamily: "'DM Sans', sans-serif", marginBottom: 7, display: "block",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 101, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, pointerEvents: "none" }}>
          {/* Overlay */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", pointerEvents: "all" }} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "relative", pointerEvents: "all",
              width: "min(900px, 95vw)", maxHeight: "90vh",
              background: "#0c0e1a", borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>
                  {post?.id ? "Editar artículo" : "Nuevo artículo"}
                </h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                  {form.is_published ? "● Publicado" : "○ Borrador"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={() => setPreview(v => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: preview ? "rgba(125,164,255,0.12)" : "transparent", color: preview ? "#7da4ff" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                  {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                  {preview ? "Editar" : "Preview"}
                </button>
                <button onClick={onClose}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.09)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              {preview ? (
                /* ── PREVIEW ── */
                <div style={{ maxWidth: 680, margin: "0 auto" }}>
                  {form.cover_url && (
                    <img src={form.cover_url} alt="" style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 16, marginBottom: 24 }} />
                  )}
                  <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#C4395A", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                    {form.category}
                  </span>
                  <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "12px 0 10px" }}>
                    {form.title || "Sin título"}
                  </h1>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
                    {form.author_name} · {form.read_time} de lectura
                  </p>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 24, fontStyle: "italic", borderLeft: "3px solid rgba(196,57,90,0.5)", paddingLeft: 16 }}>
                    {form.excerpt || "Sin descripción"}
                  </p>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {form.content || "Sin contenido"}
                  </div>
                </div>
              ) : (
                /* ── FORM ── */
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                  {/* Título */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Título *</label>
                    <input value={form.title} onChange={e => set("title", e.target.value)}
                      placeholder="Ej: Tendencias de Moda Primavera 2026"
                      style={inputStyle} />
                  </div>

                  {/* Slug */}
                  <div>
                    <label style={labelStyle}>Slug (URL)</label>
                    <input value={form.slug} onChange={e => set("slug", slugify(e.target.value))}
                      placeholder="tendencias-moda-primavera-2026"
                      style={{ ...inputStyle, color: "rgba(99,153,255,0.8)" }} />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label style={labelStyle}>Categoría</label>
                    <select value={form.category} onChange={e => set("category", e.target.value)}
                      style={{ ...inputStyle, cursor: "pointer" }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Autor */}
                  <div>
                    <label style={labelStyle}>Autor</label>
                    <input value={form.author_name} onChange={e => set("author_name", e.target.value)}
                      style={inputStyle} />
                  </div>

                  {/* Tiempo lectura */}
                  <div>
                    <label style={labelStyle}>Tiempo de lectura</label>
                    <input value={form.read_time} onChange={e => set("read_time", e.target.value)}
                      placeholder="5 min" style={inputStyle} />
                  </div>

                  {/* Descripción corta */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Descripción corta (excerpt)</label>
                    <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)}
                      rows={3} placeholder="Resumen que aparece en la card del blog..."
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                  </div>

                  {/* Contenido */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Contenido del artículo</label>
                    <textarea value={form.content} onChange={e => set("content", e.target.value)}
                      rows={12} placeholder={`Escribe el cuerpo del artículo aquí...\n\nPuedes usar párrafos separados por líneas en blanco.\n\nEjemplo:\n\nLa moda colombiana ha evolucionado enormemente en los últimos años...\n\nCada prenda cuenta una historia...`}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, fontSize: 13 }} />
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>
                      {form.content.length} caracteres · usa líneas en blanco para separar párrafos
                    </p>
                  </div>

                  {/* Imagen portada */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Imagen de portada</label>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />

                    {form.cover_url ? (
                      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 200 }}>
                        <img src={form.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
                          <button onClick={() => fileRef.current?.click()}
                            style={{ padding: "9px 18px", borderRadius: 10, background: "#fff", color: "#111", fontSize: 12, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", border: "none", cursor: "pointer" }}>
                            Cambiar imagen
                          </button>
                          <button onClick={() => set("cover_url", "")}
                            style={{ padding: "9px 14px", borderRadius: 10, background: "rgba(248,113,113,0.2)", color: "#f87171", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", border: "1px solid rgba(248,113,113,0.3)", cursor: "pointer" }}>
                            Quitar
                          </button>
                        </div>
                        {uploading && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Loader2 size={28} color="#7da4ff" style={{ animation: "spin 0.8s linear infinite" }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => fileRef.current?.click()} disabled={uploading}
                        style={{ width: "100%", height: 160, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s" }}>
                        {uploading
                          ? <Loader2 size={24} color="#7da4ff" style={{ animation: "spin 0.8s linear infinite" }} />
                          : <><Upload size={22} color="rgba(255,255,255,0.25)" /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>Click para subir imagen (máx. 5MB)</span></>
                        }
                      </button>
                    )}
                    {/* O pegar URL */}
                    <input value={form.cover_url} onChange={e => set("cover_url", e.target.value)}
                      placeholder="O pega una URL de imagen..."
                      style={{ ...inputStyle, marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.4)" }} />
                  </div>

                  {/* Toggles */}
                  <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16 }}>
                    {[
                      { key: "is_featured", label: "Destacado", icon: <Star size={13} />, color: "#fbbf24" },
                      { key: "is_published", label: "Publicado", icon: <Eye size={13} />, color: "#34d399" },
                    ].map(({ key, label, icon, color }) => {
                      const val = form[key as keyof BlogPost] as boolean;
                      return (
                        <button key={key} onClick={() => set(key as keyof BlogPost, !val)}
                          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, border: `1px solid ${val ? color + "40" : "rgba(255,255,255,0.08)"}`, background: val ? color + "12" : "transparent", color: val ? color : "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                          {icon} {label}: {val ? "Sí" : "No"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "18px 28px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 12 }}>
              {error && <p style={{ fontSize: 13, color: "#f87171", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>⚠ {error}</p>}
              {!error && <div style={{ flex: 1 }} />}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={onClose}
                  style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.09)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                  Cancelar
                </button>
                {!form.is_published && (
                  <button onClick={() => handleSave(false)} disabled={saving}
                    style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                    {saving ? "Guardando..." : "Guardar borrador"}
                  </button>
                )}
                <button onClick={() => handleSave(true)} disabled={saving}
                  style={{ padding: "10px 24px", borderRadius: 10, background: "#7da4ff", color: "#0c0e1a", fontSize: 13, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  {saving ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Guardando...</> : form.is_published ? "Guardar cambios" : "Publicar ahora"}
                </button>
              </div>
            </div>
          </motion.div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BlogModal;