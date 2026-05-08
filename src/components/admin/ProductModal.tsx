// src/components/admin/ProductModal.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Plus, Trash2, ImagePlus, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product, Category } from "@/lib/supabase";

// ── Tipos internos ────────────────────────────────────────────
interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_price: string;
  cost_price: string;
  stock: string;
  low_stock_threshold: string;
  sku: string;
  barcode: string;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  weight: string;
  tags: string;
  colors: string[];
  sizes: string[];
}

// ── NUEVO: imagen extra con color asociado ───────────────────
interface ExtraImageItem {
  file: File | null;
  preview: string;
  color: string; // color asociado a esta imagen
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

// ── Helpers ───────────────────────────────────────────────────
const toSlug = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

const SIZES_PRESET  = ["XS","S","M","L","XL","XXL","Única"];
const COLORS_PRESET = ["Negro","Blanco","Beige","Gris","Azul","Rojo","Verde","Rosa","Vino","Camel"];

const emptyForm = (): ProductFormData => ({
  name: "", slug: "", description: "",
  price: "", compare_price: "", cost_price: "",
  stock: "0", low_stock_threshold: "5",
  sku: "", barcode: "", category_id: "",
  is_active: true, is_featured: false,
  weight: "", tags: "",
  colors: [], sizes: [],
});

// ── Estilos base reutilizables ────────────────────────────────
const S = {
  label: { fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 6, display: "block" },
  input: { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.15s" },
  textarea: { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, minHeight: 90 },
  select: { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#0f1120", color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" as const },
  row: { display: "grid", gap: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" },
};

// ══════════════════════════════════════════════════════════════
const ProductModal = ({ isOpen, onClose, onSuccess, product }: ProductModalProps) => {
  const isEditing = !!product;
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const extraFilesRef  = useRef<HTMLInputElement>(null);

  const [form, setForm]           = useState<ProductFormData>(emptyForm());
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string>("");

  // ── NUEVO: galería con color por imagen ──────────────────────
  const [extraItems, setExtraItems] = useState<ExtraImageItem[]>([]);

  const [isSaving, setIsSaving]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);
  const [newColor, setNewColor]   = useState("");
  const [newSize, setNewSize]     = useState("");

  // ── Cargar categorías ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCategories(data || []));
  }, [isOpen]);

  // ── Poblar form si es edición ─────────────────────────────
  useEffect(() => {
    if (isOpen && product) {
      setForm({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.toString(),
        compare_price: product.compare_price?.toString() || "",
        cost_price: product.cost_price?.toString() || "",
        stock: product.stock.toString(),
        low_stock_threshold: product.low_stock_threshold.toString(),
        sku: product.sku || "",
        barcode: product.barcode || "",
        category_id: product.category_id || "",
        is_active: product.is_active,
        is_featured: product.is_featured,
        weight: product.weight?.toString() || "",
        tags: product.tags.join(", "),
        colors: product.metadata?.colors || [],
        sizes: product.metadata?.sizes || [],
      });
      setMainPreview(product.image_url || "");

      // Cargar imágenes existentes como items (sin File, solo preview)
      if (product.product_images && product.product_images.length > 0) {
        const existing: ExtraImageItem[] = product.product_images
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((img: any) => ({
            file: null,
            preview: img.url,
            color: img.color || "",
          }));
        setExtraItems(existing);
      } else {
        setExtraItems([]);
      }
    } else if (isOpen) {
      setForm(emptyForm());
      setMainPreview("");
      setMainImage(null);
      setExtraItems([]);
    }
    setError(null);
    setSaved(false);
  }, [isOpen, product]);

  // ── Resolver nombre de categoría en edición ────────────────
  // REMOVED

  const set = (key: keyof ProductFormData, value: any) =>
    setForm(prev => ({
      ...prev,
      [key]: value,
      ...(key === "name" && !isEditing ? { slug: toSlug(value) } : {}),
    }));

  // ── Imagen principal ──────────────────────────────────────
  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
  };

  // ── Imágenes extra — ahora con color ─────────────────────
  const handleExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems: ExtraImageItem[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      color: "",
    }));
    setExtraItems(prev => [...prev, ...newItems]);
    // Reset input para poder volver a seleccionar los mismos archivos
    e.target.value = "";
  };

  const removeExtraItem = (i: number) => {
    setExtraItems(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateItemColor = (i: number, color: string) => {
    setExtraItems(prev =>
      prev.map((item, idx) => idx === i ? { ...item, color } : item)
    );
  };

  // ── Subir imagen a Supabase Storage ──────────────────────
  const uploadImage = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from("products").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  };

  // ── Colores ───────────────────────────────────────────────
  const addColor = (color: string) => {
    const c = color.trim();
    if (!c || form.colors.includes(c)) return;
    set("colors", [...form.colors, c]);
    setNewColor("");
  };

  // ── Tallas ────────────────────────────────────────────────
  const toggleSize = (size: string) => {
    set("sizes", form.sizes.includes(size)
      ? form.sizes.filter(s => s !== size)
      : [...form.sizes, size]);
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) { setError("El nombre es obligatorio."); return; }
    if (!form.price || isNaN(Number(form.price))) { setError("El precio debe ser un número válido."); return; }
    if (!form.slug.trim()) { setError("El slug es obligatorio."); return; }

    setIsSaving(true);
    try {
      const timestamp = Date.now();
      let image_url = mainPreview;

      // 1. Subir imagen principal si cambió
      if (mainImage) {
        image_url = await uploadImage(mainImage, `main/${form.slug}-${timestamp}.${mainImage.name.split(".").pop()}`);
      }

      // 2. Payload del producto
      const payload = {
        name:                form.name.trim(),
        slug:                form.slug.trim(),
        description:         form.description.trim(),
        price:               Number(form.price),
        compare_price:       form.compare_price ? Number(form.compare_price) : null,
        cost_price:          form.cost_price    ? Number(form.cost_price)    : null,
        stock:               Number(form.stock),
        low_stock_threshold: Number(form.low_stock_threshold),
        sku:                 form.sku.trim() || null,
        barcode:             form.barcode.trim() || null,
        category_id:         form.category_id || null,
        is_active:           form.is_active,
        is_featured:         form.is_featured,
        weight:              form.weight ? Number(form.weight) : null,
        tags:                form.tags.split(",").map(t => t.trim()).filter(Boolean),
        image_url,
        metadata: {
          colors: form.colors,
          sizes:  form.sizes,
        },
      };

      let productId = product?.id;

      if (isEditing) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId!);
        if (error) throw error;
        // Limpiar imágenes de galería anteriores para reinsertar
        await supabase.from("product_images").delete().eq("product_id", productId!);
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      // 3. Subir/reregistrar imágenes de galería con su color
      for (let i = 0; i < extraItems.length; i++) {
        const item = extraItems[i];
        let url = item.preview;

        // Solo subir si hay un File nuevo (no es URL existente)
        if (item.file) {
          url = await uploadImage(
            item.file,
            `gallery/${productId}-${timestamp}-${i}.${item.file.name.split(".").pop()}`
          );
        }

        await supabase.from("product_images").insert({
          product_id: productId,
          url,
          alt_text:   form.name,
          sort_order: i,
          is_primary: i === 0 && !mainImage,
          color:      item.color || null, // ← campo color
        });
      }

      setSaved(true);
      onClose();
      setTimeout(() => onSuccess(), 100);
    } catch (err: any) {
      console.error("Save product error:", err);
      setError(err.message || "Error al guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {isOpen && (
        <motion.div key="pm-wrapper" className="product-modal-root">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, backdropFilter: "blur(4px)" }}
          />

          <div style={{
            position: "fixed", inset: 0, zIndex: 101,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px", pointerEvents: "none",
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              style={{
                pointerEvents: "all",
                width: "min(900px, 95vw)", maxHeight: "90vh",
                background: "#0c0e1a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 22, zIndex: 101,
                display: "flex", flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
              }}
            >
              {/* Header */}
              <div style={{ padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>
                    {isEditing ? "Editar Producto" : "Nuevo Producto"}
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                    {isEditing ? "Modifica los datos del producto" : "Completa la información para publicar"}
                  </p>
                </div>
                <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: 10, cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex" }}>
                  <X size={18} />
                </button>
              </div>

              {/* Body — scrollable */}
              <div style={{ overflowY: "auto", padding: "26px 28px", flex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>

                  {/* ── COLUMNA IZQUIERDA ── */}
                  <div>
                    {/* Imágenes */}
                    <div style={S.section}>
                      <p style={S.sectionTitle}>Imágenes</p>

                      {/* Imagen principal */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: "100%", aspectRatio: "4/3",
                          borderRadius: 14,
                          border: `2px dashed ${mainPreview ? "rgba(99,153,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                          background: "rgba(255,255,255,0.025)",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", overflow: "hidden", position: "relative",
                          transition: "border-color 0.15s",
                        }}
                      >
                        {mainPreview ? (
                          <React.Fragment>
                            <img src={mainPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                            <div
                              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                              onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                            >
                              <Upload size={22} style={{ color: "#fff", marginBottom: 6 }} />
                              <span style={{ fontSize: 13, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Cambiar imagen</span>
                            </div>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <ImagePlus size={28} style={{ color: "rgba(255,255,255,0.2)", marginBottom: 10 }} />
                            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>Imagen principal</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>JPG, PNG, WEBP</span>
                          </React.Fragment>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMainImage} style={{ display: "none" }} />

                      {/* ── Galería con color por imagen ── */}
                      <div style={{ marginTop: 16 }}>
                        <p style={{ ...S.label, marginBottom: 10 }}>Galería adicional (con color por foto)</p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {extraItems.map((item, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 12, padding: "8px 10px",
                              }}
                            >
                              {/* Thumbnail */}
                              <img
                                src={item.preview}
                                alt=""
                                style={{
                                  width: 52, height: 52, borderRadius: 8,
                                  objectFit: "cover",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  flexShrink: 0,
                                }}
                              />

                              {/* Color selector */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ ...S.label, marginBottom: 5, fontSize: 10 }}>Color de esta foto</p>
                                <select
                                  value={item.color}
                                  onChange={e => updateItemColor(i, e.target.value)}
                                  style={{ ...S.select, padding: "7px 10px", fontSize: 13 }}
                                >
                                  <option value="">Sin color específico</option>
                                  {form.colors.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                  {/* Mostrar colores preset que no estén en form.colors */}
                                  {COLORS_PRESET.filter(c => !form.colors.includes(c)).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Delete */}
                              <button
                                onClick={() => removeExtraItem(i)}
                                style={{
                                  background: "rgba(248,113,113,0.15)",
                                  border: "1px solid rgba(248,113,113,0.25)",
                                  borderRadius: 8, width: 32, height: 32,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  cursor: "pointer", flexShrink: 0,
                                }}
                              >
                                <X size={14} style={{ color: "#f87171" }} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add more button */}
                        <button
                          onClick={() => extraFilesRef.current?.click()}
                          style={{
                            marginTop: 10, width: "100%", padding: "10px 0",
                            borderRadius: 10,
                            border: "2px dashed rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.025)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            cursor: "pointer", color: "rgba(255,255,255,0.35)",
                            fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                          }}
                        >
                          <Plus size={16} />
                          Añadir fotos a galería
                        </button>
                        <input
                          ref={extraFilesRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleExtraImages}
                          style={{ display: "none" }}
                        />

                        {extraItems.length > 0 && (
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>
                            Asigna el color a cada foto para que el filtro de colores funcione en la tienda.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tallas */}
                    <div style={S.section}>
                      <p style={S.sectionTitle}>Tallas disponibles</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                        {SIZES_PRESET.map(size => (
                          <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            style={{
                              padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                              fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s",
                              border: form.sizes.includes(size) ? "1px solid rgba(99,153,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                              background: form.sizes.includes(size) ? "rgba(99,153,255,0.15)" : "rgba(255,255,255,0.03)",
                              color: form.sizes.includes(size) ? "#7da4ff" : "rgba(255,255,255,0.5)",
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={newSize}
                          onChange={e => setNewSize(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && (toggleSize(newSize.trim()), setNewSize(""))}
                          placeholder="Talla personalizada (ej: 38)"
                          style={{ ...S.input, flex: 1 }}
                        />
                        <button
                          onClick={() => { if (newSize.trim()) { toggleSize(newSize.trim()); setNewSize(""); } }}
                          style={{ padding: "0 14px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {form.sizes.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                          {form.sizes.map(s => (
                            <span key={s} style={{ fontSize: 12, background: "rgba(99,153,255,0.12)", color: "#7da4ff", padding: "3px 10px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                              {s}
                              <button onClick={() => toggleSize(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7da4ff", padding: 0, lineHeight: 1 }}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Colores */}
                    <div style={S.section}>
                      <p style={S.sectionTitle}>Colores</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                        {COLORS_PRESET.map(color => (
                          <button
                            key={color}
                            onClick={() => addColor(color)}
                            disabled={form.colors.includes(color)}
                            style={{
                              padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                              fontFamily: "'DM Sans', sans-serif", cursor: form.colors.includes(color) ? "default" : "pointer",
                              border: form.colors.includes(color) ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.1)",
                              background: form.colors.includes(color) ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)",
                              color: form.colors.includes(color) ? "#34d399" : "rgba(255,255,255,0.45)",
                              transition: "all 0.15s",
                            }}
                          >
                            {color} {form.colors.includes(color) && "✓"}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={newColor}
                          onChange={e => setNewColor(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addColor(newColor)}
                          placeholder="Color personalizado..."
                          style={{ ...S.input, flex: 1 }}
                        />
                        <button
                          onClick={() => addColor(newColor)}
                          style={{ padding: "0 14px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {form.colors.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                          {form.colors.map(c => (
                            <span key={c} style={{ fontSize: 12, background: "rgba(52,211,153,0.1)", color: "#34d399", padding: "3px 10px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                              {c}
                              <button
                                onClick={() => set("colors", form.colors.filter(x => x !== c))}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#34d399", padding: 0, lineHeight: 1 }}
                              >×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── COLUMNA DERECHA ── */}
                  <div>
                    {/* Info básica */}
                    <div style={S.section}>
                      <p style={S.sectionTitle}>Información básica</p>

                      <div style={{ marginBottom: 14 }}>
                        <label style={S.label}>Nombre del producto *</label>
                        <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ej: Chaleco Sastre Beige" style={S.input} />
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={S.label}>Slug (URL)</label>
                        <input value={form.slug} onChange={e => set("slug", toSlug(e.target.value))} placeholder="chaleco-sastre-beige" style={{ ...S.input, color: "rgba(255,255,255,0.5)", fontSize: 13 }} />
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={S.label}>Categoría</label>
                        <select value={form.category_id} onChange={e => set("category_id", e.target.value)} style={S.select}>
                          <option value="">Selecciona una categoría</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={S.label}>Descripción</label>
                        <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe el producto, materiales, estilo..." style={S.textarea} />
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={S.label}>Tags (separados por coma)</label>
                        <input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="sastre, elegante, mujer, lino" style={S.input} />
                      </div>
                    </div>

                    {/* Precios */}
                    <div style={S.section}>
                      <p style={S.sectionTitle}>Precios</p>
                      <div style={{ ...S.row, gridTemplateColumns: "1fr 1fr", marginBottom: 14 }}>
                        <div>
                          <label style={S.label}>Precio de venta *</label>
                          <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="129900" style={S.input} />
                        </div>
                        <div>
                          <label style={S.label}>Precio tachado</label>
                          <input type="number" value={form.compare_price} onChange={e => set("compare_price", e.target.value)} placeholder="159900" style={S.input} />
                        </div>
                      </div>
                      <div>
                        <label style={S.label}>Precio de costo</label>
                        <input type="number" value={form.cost_price} onChange={e => set("cost_price", e.target.value)} placeholder="60000" style={S.input} />
                        {form.price && form.cost_price && (
                          <p style={{ fontSize: 11, color: "#34d399", fontFamily: "'DM Sans', sans-serif", marginTop: 5 }}>
                            Margen: {Math.round(((Number(form.price) - Number(form.cost_price)) / Number(form.price)) * 100)}%
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Inventario */}
                    <div style={S.section}>
                      <p style={S.sectionTitle}>Inventario</p>
                      <div style={{ ...S.row, gridTemplateColumns: "1fr 1fr", marginBottom: 14 }}>
                        <div>
                          <label style={S.label}>Stock</label>
                          <input type="number" value={form.stock} onChange={e => set("stock", e.target.value)} min="0" style={S.input} />
                        </div>
                        <div>
                          <label style={S.label}>Alerta stock bajo</label>
                          <input type="number" value={form.low_stock_threshold} onChange={e => set("low_stock_threshold", e.target.value)} min="0" style={S.input} />
                        </div>
                      </div>
                      <div style={{ ...S.row, gridTemplateColumns: "1fr 1fr" }}>
                        <div>
                          <label style={S.label}>SKU</label>
                          <input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="EVO-001" style={S.input} />
                        </div>
                        <div>
                          <label style={S.label}>Peso (gramos)</label>
                          <input type="number" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="300" style={S.input} />
                        </div>
                      </div>
                    </div>

                    {/* Opciones */}
                    <div style={S.section}>
                      <p style={S.sectionTitle}>Opciones de publicación</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          { key: "is_active",   label: "Publicado (visible en tienda)",  desc: "Los clientes podrán ver y comprar este producto" },
                          { key: "is_featured", label: "Destacado (aparece en inicio)",   desc: "Se mostrará en la sección de productos destacados" },
                        ].map(opt => (
                          <label key={opt.key} style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                            <div
                              onClick={() => set(opt.key as any, !form[opt.key as keyof ProductFormData])}
                              style={{
                                width: 42, height: 24, borderRadius: 12, flexShrink: 0, marginTop: 2,
                                background: form[opt.key as keyof ProductFormData] ? "#7da4ff" : "rgba(255,255,255,0.1)",
                                position: "relative", cursor: "pointer", transition: "background 0.2s",
                              }}
                            >
                              <div style={{
                                position: "absolute", top: 3,
                                left: form[opt.key as keyof ProductFormData] ? 21 : 3,
                                width: 18, height: 18, borderRadius: "50%",
                                background: "#fff", transition: "left 0.2s",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                              }} />
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif" }}>{opt.label}</p>
                              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{opt.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "18px 28px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#0c0e1a" }}>
                {error ? (
                  <p style={{ fontSize: 13, color: "#f87171", fontFamily: "'DM Sans', sans-serif" }}>⚠ {error}</p>
                ) : (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
                    {isEditing ? "Los cambios se reflejan inmediatamente en la tienda" : "El producto se publicará según la opción elegida"}
                  </p>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={onClose}
                    style={{ padding: "11px 22px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.1)", background: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: 600 }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || saved}
                    style={{
                      padding: "11px 28px", borderRadius: 11, border: "none",
                      background: saved ? "#34d399" : "#7da4ff",
                      color: saved ? "#fff" : "#0c0e1a",
                      fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 800, cursor: isSaving || saved ? "default" : "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      transition: "background 0.2s", minWidth: 140, justifyContent: "center",
                    }}
                  >
                    {saved ? (
                      <React.Fragment><Check size={16} /> Guardado</React.Fragment>
                    ) : isSaving ? (
                      <React.Fragment><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Guardando...</React.Fragment>
                    ) : (
                      isEditing ? "Guardar cambios" : "Publicar producto"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      )}
    </>
  );
};

export default ProductModal;