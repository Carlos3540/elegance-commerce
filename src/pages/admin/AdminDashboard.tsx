// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ShoppingBag, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, Edit, Trash2, Plus,
  Search, ChevronRight, Activity, Users, AlertTriangle,
  Star, MessageSquare, Trash, Truck, X, CheckCircle,
  Clock, AlertOctagon, Eye, RefreshCw,
} from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminProducts } from "@/hooks/useProducts";
import { useAdminOrders, type UpdateStatusOptions } from "@/hooks/useOrders";
import ProductModal from "@/components/admin/ProductModal";
import BlogManager from "@/components/admin/BlogManager";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Product, Order } from "@/lib/supabase";
import Overview from "@/components/admin/AdminOverviewWithFilters";

const COP = (n: number) => new Intl.NumberFormat('es-CO',{ style:'currency', currency:'COP', minimumFractionDigits:0 }).format(n);

const STATUS_LABEL: Record<string,string> = { pending:"Pendiente", confirmed:"Confirmado", processing:"Procesando", shipped:"En camino", delivered:"Entregado", cancelled:"Cancelado", refunded:"Reembolsado" };
const STATUS_COLOR: Record<string,string> = { pending:"#fbbf24", confirmed:"#7da4ff", processing:"#a78bfa", shipped:"#7da4ff", delivered:"#34d399", cancelled:"#f87171", refunded:"#f87171" };
const STATUS_BG:    Record<string,string> = { pending:"rgba(251,191,36,0.09)", confirmed:"rgba(99,153,255,0.09)", processing:"rgba(167,139,250,0.09)", shipped:"rgba(99,153,255,0.09)", delivered:"rgba(52,211,153,0.09)", cancelled:"rgba(248,113,113,0.09)", refunded:"rgba(248,113,113,0.09)" };

// ── Star display — puro, sin framer ──────────────────────────────────────
const StarDisplay = ({ value, size = 14 }: { value: number; size?: number }) => (
  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
    {[1,2,3,4,5].map(s => (
      <Star key={`sd-${s}`} size={size}
        style={{ fill: value >= s ? "#f59e0b" : "transparent", color: value >= s ? "#f59e0b" : "rgba(255,255,255,0.12)", flexShrink: 0 }} />
    ))}
  </div>
);

const StatCard = ({ label, value, change, positive, icon: Icon, delay }: any) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    style={{ background: "#0f1120", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 18, padding: "24px 26px" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,153,255,0.09)", border: "1px solid rgba(99,153,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7da4ff" }}><Icon size={18} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: positive ? "#34d399" : "#f87171", background: positive ? "rgba(52,211,153,0.09)" : "rgba(248,113,113,0.09)", padding: "4px 10px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>
        {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {change}%
      </div>
    </div>
    <p style={{ fontSize: 30, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>{label}</p>
  </motion.div>
);

const SkeletonCard = () => (
  <div style={{ background: "#0f1120", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 18, padding: "24px 26px" }}>
    {[44, 30, 14].map((h, i) => <div key={i} style={{ height: h, width: i === 0 ? 44 : i === 1 ? "60%" : "40%", background: "rgba(255,255,255,0.05)", borderRadius: i === 0 ? 12 : 6, marginBottom: 12 }} />)}
  </div>
);

      </motion.div>
    </div>
  );
};

// ─── PRODUCTS MANAGER ─────────────────────────────────────────
const ProductsManager = () => {
  const { products, isLoading, deleteProduct, toggleActive, refetch } = useAdminProducts();
  const [search, setSearch]           = useState("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px 36px" }}>
      <ProductModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditProduct(null); }}
        onSuccess={() => refetch()}
        product={editProduct}
      />

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"'DM Sans', sans-serif", letterSpacing:"-0.03em" }}>Productos</h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Sans', sans-serif", marginTop:4 }}>
            {isLoading ? "Cargando..." : `${products.length} en catálogo`}
          </p>
        </div>
        <button onClick={() => { setEditProduct(null); setModalOpen(true); }}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:12, background:"#7da4ff", color:"#0c0e1a", border:"none", cursor:"pointer", fontSize:14, fontWeight:800, fontFamily:"'DM Sans', sans-serif" }}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div style={{ position:"relative", marginBottom:18 }}>
        <Search size={15} style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.22)" }} />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre o SKU..."
          style={{ width:"100%", padding:"13px 18px 13px 44px", borderRadius:12, border:"1px solid rgba(255,255,255,0.08)", background:"#0f1120", color:"#fff", fontSize:14, fontFamily:"'DM Sans', sans-serif", outline:"none", boxSizing:"border-box" }} />
      </div>

      <div style={{ background:"#0f1120", border:"1px solid rgba(255,255,255,0.065)", borderRadius:18, overflow:"hidden" }}>
        {isLoading ? (
          <div style={{ padding:"50px", textAlign:"center" }}>
            <div style={{ width:32, height:32, border:"2px solid rgba(99,153,255,0.3)", borderTopColor:"#7da4ff", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.055)" }}>
                {["Producto","Categoría","Precio","Stock","Estado","Acciones"].map((h,i)=>(
                  <th key={h} style={{ padding:"14px 22px", textAlign:i===5?"right":"left", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.22)", fontFamily:"'DM Sans', sans-serif", letterSpacing:"0.08em", textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={6} style={{ padding:"50px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontFamily:"'DM Sans', sans-serif", fontSize:14 }}>
                  {search ? `Sin resultados para "${search}"` : "Aún no hay productos. ¡Crea el primero!"}
                </td></tr>
              ) : filtered.map((p,i)=>(
                <motion.tr key={p.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }} style={{ borderBottom:"1px solid rgba(255,255,255,0.032)" }}>
                  <td style={{ padding:"14px 22px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <img src={p.image_url||"/assets/placeholder.svg"} alt={p.name} style={{ width:44, height:44, borderRadius:10, objectFit:"cover", flexShrink:0, border:"1px solid rgba(255,255,255,0.07)" }} />
                      <div>
                        <p style={{ fontSize:14, fontWeight:600, color:p.is_active?"rgba(255,255,255,0.82)":"rgba(255,255,255,0.3)", fontFamily:"'DM Sans', sans-serif" }}>{p.name}</p>
                        {p.sku && <p style={{ fontSize:11, color:"rgba(255,255,255,0.22)", fontFamily:"'DM Sans', sans-serif", marginTop:2 }}>SKU: {p.sku}</p>}
                        <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
                          {(p.metadata?.sizes||[]).slice(0,4).map((s:string,si:number)=>(
                            <span key={`ps-${s}-${si}`} style={{ fontSize:10, background:"rgba(99,153,255,0.1)", color:"#7da4ff", padding:"1px 6px", borderRadius:4, fontFamily:"'DM Sans', sans-serif" }}>{s}</span>
                          ))}
                          {(p.metadata?.colors||[]).slice(0,3).map((c:string,ci:number)=>(
                            <span key={`pc-${c}-${ci}`} style={{ fontSize:10, background:"rgba(52,211,153,0.08)", color:"#34d399", padding:"1px 6px", borderRadius:4, fontFamily:"'DM Sans', sans-serif" }}>{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"14px 22px", fontSize:13, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Sans', sans-serif" }}>{(p as any).categories?.name||"—"}</td>
                  <td style={{ padding:"14px 22px" }}>
                    <p style={{ fontSize:15, fontWeight:800, color:"#fff", fontFamily:"'DM Sans', sans-serif" }}>${p.price.toFixed(2)}</p>
                    {p.compare_price && <p style={{ fontSize:11, color:"rgba(255,255,255,0.25)", fontFamily:"'DM Sans', sans-serif", textDecoration:"line-through" }}>${p.compare_price.toFixed(2)}</p>}
                  </td>
                  <td style={{ padding:"14px 22px" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:p.stock===0?"#f87171":p.stock<=p.low_stock_threshold?"#fbbf24":"#34d399", background:p.stock===0?"rgba(248,113,113,0.09)":p.stock<=p.low_stock_threshold?"rgba(251,191,36,0.09)":"rgba(52,211,153,0.09)", padding:"4px 10px", borderRadius:8, fontFamily:"'DM Sans', sans-serif" }}>
                      {p.stock===0?"Agotado":p.stock}
                    </span>
                  </td>
                  <td style={{ padding:"14px 22px" }}>
                    <button onClick={()=>toggleActive(p.id,!p.is_active)}
                      style={{ fontSize:12, fontWeight:700, color:p.is_active?"#34d399":"rgba(255,255,255,0.3)", background:p.is_active?"rgba(52,211,153,0.09)":"rgba(255,255,255,0.05)", padding:"4px 12px", borderRadius:8, fontFamily:"'DM Sans', sans-serif", border:"none", cursor:"pointer" }}>
                      {p.is_active?"● Activo":"○ Inactivo"}
                    </button>
                  </td>
                  <td style={{ padding:"14px 22px", textAlign:"right" }}>
                    <button onClick={()=>{ setEditProduct(p); setModalOpen(true); }}
                      style={{ background:"rgba(99,153,255,0.08)", border:"1px solid rgba(99,153,255,0.15)", cursor:"pointer", color:"#7da4ff", padding:"7px 10px", borderRadius:8, marginRight:6 }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={()=>{ if(confirm(`¿Eliminar "${p.name}"?`)) deleteProduct(p.id); }}
                      style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.15)", cursor:"pointer", color:"#f87171", padding:"7px 10px", borderRadius:8 }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ─── REVIEWS MANAGER ──────────────────────────────────────────
interface AdminReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  authorName: string;
  productName: string;
  productImage: string;
}

const RATING_COLORS: Record<number, string> = { 5:"#34d399", 4:"#34d399", 3:"#fbbf24", 2:"#f97316", 1:"#f87171" };
const RATING_BG:     Record<number, string> = { 5:"rgba(52,211,153,0.09)", 4:"rgba(52,211,153,0.09)", 3:"rgba(251,191,36,0.09)", 2:"rgba(249,115,22,0.09)", 1:"rgba(248,113,113,0.09)" };

const ReviewsManager = () => {
  const [reviews, setReviews]       = useState<AdminReview[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Paso 1 — todas las reseñas
      const { data: rawReviews, error: rErr } = await supabase
        .from("reviews")
        .select("id, user_id, product_id, rating, comment, created_at")
        .order("created_at", { ascending: false });

      if (rErr) throw rErr;
      if (!rawReviews || rawReviews.length === 0) { setReviews([]); setLoading(false); return; }

      // Paso 2 — perfiles de autores
      const userIds    = [...new Set(rawReviews.map((r: any) => r.user_id))];
      const productIds = [...new Set(rawReviews.map((r: any) => r.product_id))];

      const [{ data: profilesData }, { data: productsData }] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", userIds),
        supabase.from("products").select("id, name, image_url").in("id", productIds),
      ]);

      const profileMap: Record<string, string> = {};
      (profilesData ?? []).forEach((p: any) => { profileMap[p.id] = p.full_name || "Usuario"; });

      const productMap: Record<string, { name: string; image_url: string }> = {};
      (productsData ?? []).forEach((p: any) => { productMap[p.id] = { name: p.name, image_url: p.image_url || "/assets/placeholder.svg" }; });

      const merged: AdminReview[] = rawReviews.map((r: any) => ({
        ...r,
        authorName:   profileMap[r.user_id]  ?? "Usuario eliminado",
        productName:  productMap[r.product_id]?.name      ?? "Producto eliminado",
        productImage: productMap[r.product_id]?.image_url ?? "/assets/placeholder.svg",
      }));

      setReviews(merged);
    } catch (err: any) {
      console.error("fetchReviews admin error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`¿Eliminar la reseña de "${productName}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) setReviews(prev => prev.filter(r => r.id !== id));
    else console.error("delete review error:", error.message);
    setDeleting(null);
  };

  const filtered = reviews.filter(r => {
    const matchSearch =
      r.authorName.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    const matchRating = filterRating === null || r.rating === filterRating;
    return matchSearch && matchRating;
  });

  const avgAll = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  return (
    <div style={{ padding: "30px 36px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>Reseñas</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
            {loading ? "Cargando..." : `${reviews.length} reseñas en total`}
          </p>
        </div>
      </div>

      {/* Stats strip */}
      {!loading && reviews.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total reseñas", value: reviews.length.toString(), color: "#7da4ff", bg: "rgba(99,153,255,0.09)" },
            { label: "Promedio global", value: avgAll.toFixed(1) + " ★", color: "#fbbf24", bg: "rgba(251,191,36,0.09)" },
            { label: "5 estrellas", value: reviews.filter(r=>r.rating===5).length.toString(), color: "#34d399", bg: "rgba(52,211,153,0.09)" },
            { label: "1-2 estrellas", value: reviews.filter(r=>r.rating<=2).length.toString(), color: "#f87171", bg: "rgba(248,113,113,0.09)" },
          ].map(s => (
            <div key={s.label} style={{ background: "#0f1120", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.22)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por usuario, producto o comentario..."
            style={{ width: "100%", padding: "13px 18px 13px 44px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#0f1120", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
        </div>
        {/* Rating filter pills */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setFilterRating(null)}
            style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${filterRating === null ? "rgba(99,153,255,0.5)" : "rgba(255,255,255,0.08)"}`, background: filterRating === null ? "rgba(99,153,255,0.12)" : "transparent", color: filterRating === null ? "#7da4ff" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
            Todas
          </button>
          {[5,4,3,2,1].map(r => (
            <button key={`fr-${r}`} onClick={() => setFilterRating(filterRating === r ? null : r)}
              style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${filterRating === r ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.08)"}`, background: filterRating === r ? "rgba(251,191,36,0.1)" : "transparent", color: filterRating === r ? "#fbbf24" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              {r} <Star size={11} style={{ fill: "#fbbf24", color: "#fbbf24" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#0f1120", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 18, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "50px", textAlign: "center" }}>
            <div style={{ width: 32, height: 32, border: "2px solid rgba(99,153,255,0.3)", borderTopColor: "#7da4ff", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <MessageSquare size={32} style={{ color: "rgba(255,255,255,0.1)", marginBottom: 14 }} />
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
              {search || filterRating ? "Sin resultados para ese filtro" : "Aún no hay reseñas"}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
                {["Producto", "Usuario", "Calificación", "Comentario", "Fecha", ""].map((h, i) => (
                  <th key={`rh-${i}`} style={{ padding: "14px 22px", textAlign: i === 5 ? "right" : "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.032)" }}>
                  {/* Producto */}
                  <td style={{ padding: "16px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={review.productImage} alt={review.productName}
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.07)" }} />
                      <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif", maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {review.productName}
                      </p>
                    </div>
                  </td>

                  {/* Usuario */}
                  <td style={{ padding: "16px 22px" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", fontFamily: "'DM Sans', sans-serif" }}>{review.authorName}</p>
                  </td>

                  {/* Calificación */}
                  <td style={{ padding: "16px 22px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: RATING_COLORS[review.rating] ?? "#fff", background: RATING_BG[review.rating] ?? "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 8, width: "fit-content", fontFamily: "'DM Sans', sans-serif" }}>
                        {review.rating}/5
                      </span>
                      <StarDisplay value={review.rating} size={12} />
                    </div>
                  </td>

                  {/* Comentario */}
                  <td style={{ padding: "16px 22px", maxWidth: 300 }}>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {review.comment}
                    </p>
                  </td>

                  {/* Fecha */}
                  <td style={{ padding: "16px 22px", whiteSpace: "nowrap" }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
                      {new Date(review.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                      {new Date(review.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: "16px 22px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(review.id, review.productName)}
                      disabled={deleting === review.id}
                      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", cursor: deleting === review.id ? "default" : "pointer", color: "#f87171", padding: "7px 10px", borderRadius: 8, opacity: deleting === review.id ? 0.5 : 1 }}>
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── ORDER DETAIL PANEL ────────────────────────────────────────
const VALID_STATUSES = [
  { value:'pending',    label:'Pendiente' },
  { value:'confirmed',  label:'Confirmado' },
  { value:'processing', label:'Procesando' },
  { value:'shipped',    label:'En camino' },
  { value:'delivered',  label:'Entregado' },
  { value:'cancelled',  label:'Cancelado' },
  { value:'refunded',   label:'Reembolsado' },
];

const OrderDetailPanel = ({ order, onClose, onStatusUpdate }: { order: Order; onClose: ()=>void; onStatusUpdate: (id:string, status:string, opts:UpdateStatusOptions)=>Promise<void> }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [carrier, setCarrier]     = useState(order.carrier || '');
  const [tracking, setTracking]   = useState(order.tracking_number || '');
  const [trackUrl, setTrackUrl]   = useState(order.tracking_url || '');
  const [estDel, setEstDel]       = useState(order.estimated_delivery || '');
  const [cancelReason, setCancelReason] = useState(order.cancellation_reason || '');
  const [notes, setNotes]         = useState('');
  const [boldStatus, setBoldStatus] = useState<string|null>(null);
  const [saving, setSaving]       = useState(false);

  useEffect(()=>{
    supabase.from('pagos_bold').select('bold_status').eq('order_id', order.id)
      .order('created_at',{ascending:false}).limit(1).maybeSingle()
      .then(({data})=>{ if(data) setBoldStatus(data.bold_status); });
  },[order.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onStatusUpdate(order.id, newStatus, {
        carrier: carrier||undefined,
        tracking_number: tracking||undefined,
        tracking_url: trackUrl||undefined,
        estimated_delivery: estDel||undefined,
        cancellation_reason: cancelReason||undefined,
        notes: notes||undefined,
      });
      onClose();
    } catch(e){ console.error(e); }
    finally { setSaving(false); }
  };

  const inp = { background:'#1a1d2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', padding:'10px 14px', fontSize:13, fontFamily:"'DM Sans',sans-serif", width:'100%', outline:'none', boxSizing:'border-box' as const };
  
  const whatsappPhone = order.shipping_phone ? order.shipping_phone.replace(/\D/g, '') : '';
  const whatsappMsg = encodeURIComponent(`Hola ${order.shipping_name}, te escribimos de Evolet 96 sobre tu pedido #${order.id.slice(0,8).toUpperCase()}.`);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'flex-end', justifyContent:'flex-end' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} />
      <motion.div initial={{x:400}} animate={{x:0}} exit={{x:400}} transition={{type:'spring',stiffness:300,damping:30}}
        style={{ position:'relative', zIndex:1, width:'min(520px,100vw)', height:'100vh', background:'#0c0e1a', borderLeft:'1px solid rgba(255,255,255,0.08)', overflowY:'auto', padding:32, display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>Pedido #{order.id.slice(0,8).toUpperCase()}</p>
            <p style={{ fontSize:20, fontWeight:800, color:'#fff', fontFamily:"'DM Sans',sans-serif" }}>{COP(order.total)}</p>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif", marginTop: 4 }}>
              {new Date(order.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, padding:8, cursor:'pointer', color:'rgba(255,255,255,0.6)' }}><X size={16}/></button>
        </div>

        {/* Cliente */}
        <div style={{ background:'#0f1120', borderRadius:12, padding:16, border:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:"'DM Sans',sans-serif" }}>Cliente</p>
            {whatsappPhone && (
              <a href={`https://wa.me/57${whatsappPhone}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(37,211,102,0.1)', color:'#25d366', border:'1px solid rgba(37,211,102,0.2)', padding:'4px 10px', borderRadius:8, textDecoration:'none', fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
                WhatsApp
              </a>
            )}
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.9)', fontFamily:"'DM Sans',sans-serif" }}>{order.shipping_name}</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',sans-serif", marginTop:3 }}>{order.shipping_email}</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',sans-serif", marginTop:3 }}>{order.shipping_phone}</p>
          {order.shipping_address && (
            <div style={{ marginTop:8, padding:'10px', background:'rgba(255,255,255,0.02)', borderRadius:8, border:'1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>Dirección detallada:</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontFamily:"'DM Sans',sans-serif", lineHeight: 1.4 }}>
                {(order.shipping_address as any).address_line1}
                {(order.shipping_address as any).address_line2 && `, ${(order.shipping_address as any).address_line2}`}
                <br/>
                Barrio: {(order.shipping_address as any).neighborhood || 'No especificado'}
                <br/>
                Ciudad: {(order.shipping_address as any).city}, {(order.shipping_address as any).department}
                <br/>
                Notas: {(order.shipping_address as any).notes || 'Ninguna'}
              </p>
            </div>
          )}
        </div>

        {/* Pago Bold */}
        {boldStatus && (
          <div style={{ padding:'8px 14px', borderRadius:8, background: boldStatus==='APPROVED'?'rgba(52,211,153,0.09)':boldStatus==='PENDING'?'rgba(251,191,36,0.09)':'rgba(248,113,113,0.09)', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, fontWeight:700, color: boldStatus==='APPROVED'?'#34d399':boldStatus==='PENDING'?'#fbbf24':'#f87171', fontFamily:"'DM Sans',sans-serif" }}>Pago Bold: {boldStatus}</span>
          </div>
        )}
        
        {/* Método de Envío */}
        {order.shipping_method && (
          <div style={{ padding:'8px 14px', borderRadius:8, background: 'rgba(125,164,255,0.09)', border:'1px solid rgba(125,164,255,0.1)', display:'flex', alignItems:'center', gap:8 }}>
            <Truck size={14} style={{ color:'#7da4ff' }}/>
            <span style={{ fontSize:12, fontWeight:700, color: '#7da4ff', fontFamily:"'DM Sans',sans-serif" }}>Transportadora (Cotizada): {order.shipping_method.split('|')[1] || order.shipping_method}</span>
          </div>
        )}

        {/* Productos */}
        {(order.order_items||[]).length > 0 && (
          <div style={{ background:'#0f1120', borderRadius:12, padding:16, border:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12, fontFamily:"'DM Sans',sans-serif" }}>Productos</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {(order.order_items||[]).map((item:any)=>(
                <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {item.product_image && <img src={item.product_image} alt={item.product_name} style={{ width:40, height:40, borderRadius:6, objectFit:'cover', border:'1px solid rgba(255,255,255,0.07)' }}/>}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.8)', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.product_name}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif", marginTop: 2 }}>
                      x{item.quantity} · {COP(item.unit_price)}
                      {item.size && <span style={{ marginLeft: 6, background:'rgba(255,255,255,0.05)', padding:'2px 6px', borderRadius:4 }}>Talla: {item.size}</span>}
                      {item.color && <span style={{ marginLeft: 6, background:'rgba(255,255,255,0.05)', padding:'2px 6px', borderRadius:4 }}>Color: {item.color}</span>}
                    </p>
                  </div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#fff', fontFamily:"'DM Sans',sans-serif" }}>{COP(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cambio de estado */}
        <div style={{ background:'#0f1120', borderRadius:12, padding:16, border:'1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12, fontFamily:"'DM Sans',sans-serif" }}>Actualizar estado</p>
          <select value={newStatus} onChange={e=>setNewStatus(e.target.value as any)}
            style={{ ...inp, marginBottom:12 }}>
            {VALID_STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {newStatus==='shipped' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <input placeholder="Transportadora (ej. Servientrega)" value={carrier} onChange={e=>setCarrier(e.target.value)} style={inp}/>
              <input placeholder="Número de guía" value={tracking} onChange={e=>setTracking(e.target.value)} style={inp}/>
              <input placeholder="URL de rastreo (opcional)" value={trackUrl} onChange={e=>setTrackUrl(e.target.value)} style={inp}/>
              <input type="date" value={estDel} onChange={e=>setEstDel(e.target.value)} style={inp}/>
            </div>
          )}
          {newStatus==='cancelled' && (
            <input placeholder="Motivo de cancelación" value={cancelReason} onChange={e=>setCancelReason(e.target.value)} style={{ ...inp, marginTop:8 }}/>
          )}
          <textarea placeholder="Notas internas (opcional)" value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
            style={{ ...inp, marginTop:8, resize:'none' }}/>
          <button onClick={handleSave} disabled={saving}
            style={{ marginTop:12, width:'100%', padding:'12px', background:'#7da4ff', border:'none', borderRadius:10, color:'#0c0e1a', fontSize:14, fontWeight:800, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', opacity:saving?0.6:1 }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Historial */}
        {(order.status_history||[]).length > 0 && (
          <div style={{ background:'#0f1120', borderRadius:12, padding:16, border:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12, fontFamily:"'DM Sans',sans-serif" }}>Historial</p>
            {[...(order.status_history||[])].reverse().map((h:any,i:number)=>(
              <div key={h.id||i} style={{ display:'flex', gap:10, marginBottom:12 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#7da4ff', flexShrink:0, marginTop:4 }}/>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.7)', fontFamily:"'DM Sans',sans-serif" }}>{STATUS_LABEL[h.new_status]||h.new_status}</p>
                  {h.notes && <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Sans',sans-serif" }}>{h.notes}</p>}
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Sans',sans-serif" }}>{new Date(h.changed_at).toLocaleString('es-CO')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── ORDERS MANAGER ────────────────────────────────────────────
const OrdersManager = () => {
  const { orders, isLoading, refetch, updateOrderStatus } = useAdminOrders();
  const { toast } = useToast();
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order|null>(null);
  const prevCountRef = React.useRef(0);

  // Toast em tempo real quando chega novo pedido
  useEffect(()=>{
    if (!isLoading && orders.length > prevCountRef.current && prevCountRef.current > 0) {
      const newest = orders[0];
      toast({ title:'🛍 Nueva orden', description:`${newest.shipping_name} · ${COP(newest.total)}` });
    }
    prevCountRef.current = orders.length;
  },[orders, isLoading]);

  const filtered = orders.filter(o=>{
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      ((o as any).profiles?.full_name||'').toLowerCase().includes(search.toLowerCase()) ||
      ((o as any).profiles?.email||'').toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus==='all' || o.status===filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = async (id:string, status:string, opts:UpdateStatusOptions) => {
    await updateOrderStatus(id, status, opts);
    toast({ title:'Estado actualizado', description:`Pedido actualizado a: ${STATUS_LABEL[status]||status}` });
    setSelectedOrder(null);
  };

  return (
    <div style={{ padding:'30px 36px' }}>
      {selectedOrder && (
        <AnimatePresence>
          <OrderDetailPanel order={selectedOrder} onClose={()=>setSelectedOrder(null)} onStatusUpdate={handleStatusUpdate}/>
        </AnimatePresence>
      )}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:26 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', fontFamily:"'DM Sans',sans-serif", letterSpacing:'-0.03em' }}>Órdenes</h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>
            {isLoading ? 'Cargando...' : `${orders.length} pedidos en total`}
          </p>
        </div>
        <button onClick={refetch} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:10, background:'rgba(99,153,255,0.09)', border:'1px solid rgba(99,153,255,0.17)', color:'#7da4ff', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
          <RefreshCw size={13}/> Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.22)' }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, email o ID..."
            style={{ width:'100%', padding:'11px 16px 11px 40px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'#0f1120', color:'#fff', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' }}/>
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{ padding:'11px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'#0f1120', color:'rgba(255,255,255,0.7)', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none' }}>
          <option value="all">Todos los estados</option>
          {VALID_STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background:'#0f1120', border:'1px solid rgba(255,255,255,0.065)', borderRadius:18, overflow:'hidden' }}>
        {isLoading ? (
          <div style={{ padding:50, textAlign:'center' }}>
            <div style={{ width:32, height:32, border:'2px solid rgba(99,153,255,0.3)', borderTopColor:'#7da4ff', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
          </div>
        ) : filtered.length===0 ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <ShoppingBag size={32} style={{ color:'rgba(255,255,255,0.1)', marginBottom:14 }}/>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.2)', fontFamily:"'DM Sans',sans-serif" }}>
              {search||filterStatus!=='all' ? 'Sin resultados para ese filtro' : 'Aún no hay órdenes'}
            </p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.055)' }}>
                {['ID','Cliente','Productos','Total','Estado','Fecha',''].map((h,i)=>(
                  <th key={h||i} style={{ padding:'14px 20px', textAlign:i===6?'right':'left', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.22)', fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o,i)=>(
                <motion.tr key={o.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
                  style={{ borderBottom:'1px solid rgba(255,255,255,0.032)' }}>
                  <td style={{ padding:'14px 20px', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Sans',sans-serif", fontVariantNumeric:'tabular-nums' }}>{o.id.slice(0,8).toUpperCase()}</td>
                  <td style={{ padding:'14px 20px' }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.8)', fontFamily:"'DM Sans',sans-serif" }}>{o.shipping_name}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>{o.shipping_email}</p>
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',sans-serif" }}>{(o.order_items||[]).length} ítem(s)</td>
                  <td style={{ padding:'14px 20px', fontSize:14, fontWeight:800, color:'#fff', fontFamily:"'DM Sans',sans-serif" }}>{COP(o.total)}</td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ fontSize:11, fontWeight:700, color:STATUS_COLOR[o.status]||'#fff', background:STATUS_BG[o.status]||'rgba(255,255,255,0.05)', padding:'4px 10px', borderRadius:8, fontFamily:"'DM Sans',sans-serif" }}>
                      {STATUS_LABEL[o.status]||o.status}
                    </span>
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>
                    {new Date(o.created_at).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})}
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'right' }}>
                    <button onClick={()=>setSelectedOrder(o as any)}
                      style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(99,153,255,0.09)', border:'1px solid rgba(99,153,255,0.17)', color:'#7da4ff', padding:'7px 12px', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
                      <Eye size={13}/> Ver
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── COMING SOON ──────────────────────────────────────────────
const ComingSoon = ({ title }: { title: string }) => (
  <div style={{ padding:"30px 36px" }}>
    <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"'DM Sans', sans-serif", letterSpacing:"-0.03em", marginBottom:26 }}>{title}</h2>
    <div style={{ background:"#0f1120", border:"1px solid rgba(255,255,255,0.065)", borderRadius:18, padding:"90px 32px", textAlign:"center" }}>
      <Activity size={36} style={{ color:"rgba(255,255,255,0.1)", marginBottom:18 }} />
      <p style={{ fontSize:16, color:"rgba(255,255,255,0.28)", fontFamily:"'DM Sans', sans-serif" }}>Sección en desarrollo</p>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { pathname } = useLocation();

  const renderContent = () => {
    if (pathname === "/admin/productos")  return <ProductsManager />;
    if (pathname === "/admin/blog")       return <BlogManager />;
    if (pathname === "/admin/resenas")    return <ReviewsManager />;
    if (pathname === "/admin/ordenes")    return <OrdersManager />;
    return <Overview />;
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      <AnimatePresence mode="wait">
        <motion.div key={pathname} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default AdminDashboard;