// src/pages/Shop.tsx
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import ProductCard from "@/components/store/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/supabase";
import shopBannerImg from "@/assets/bannershop2.png";

// ── Ticker ─────────────────────────────────────────────────────
const TICKER_ITEMS = ["NUEVA COLECCIÓN 2026", "ENVÍO GRATIS +$150.000", "MATERIALES PREMIUM", "DISEÑO EXCLUSIVO", "HECHO EN COLOMBIA 🇨🇴"];

const Ticker = () => (
  <div style={{ background: "#111", overflow: "hidden", padding: "10px 0", marginTop: 0 }}>
    <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{ display: "flex", whiteSpace: "nowrap" }}>
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span key={i} style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.65)", padding: "0 32px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
          {item} <span style={{ color: "rgba(255,255,255,0.18)", marginLeft: 18 }}>✦</span>
        </span>
      ))}
    </motion.div>
  </div>
);

// ── Hero ───────────────────────────────────────────────────────
const ShopHero = ({ total }: { total: number }) => (
  <div style={{ position: "relative", height: "40vh", minHeight: 280, overflow: "hidden" }}>
    <img src={shopBannerImg} alt="Shop Banner"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)" }} />
    <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 12 }}>
        Colección 2026
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 16 }}>
        Catálogo
        <span style={{ fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.55)" }}> completo</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
        {total > 0 ? `${total} prendas disponibles` : "Explorando colección..."}
      </motion.p>
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to bottom, transparent, #fff)" }} />
  </div>
);

// ── FilterChip ─────────────────────────────────────────────────
const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#111", color: "#fff", borderRadius: 100, padding: "5px 12px 5px 14px", fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em" }}>
    {label}
    <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", padding: 0 }}>
      <X size={12} />
    </button>
  </motion.div>
);

// ── SidebarContent — FUERA de Shop para evitar remount bug ─────
interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
  currency: "COP" | "USD";
  setCurrency: (v: "COP" | "USD") => void;
  usdToCOP: number;
  isLoadingRate: boolean;
  format: (n: number) => string;
  maxPrice: number;
  step: number;
  sliderMax: number;
  setSliderMax: (v: number) => void;
  catOpen: boolean;
  setCatOpen: (v: boolean) => void;
  priceOpen: boolean;
  setPriceOpen: (v: boolean) => void;
  monedaOpen: boolean;
  setMonedaOpen: (v: boolean) => void;
}

const SidebarContent = ({
  categories, selectedCategory, setSelectedCategory,
  currency, setCurrency, usdToCOP, isLoadingRate, format,
  maxPrice, step, sliderMax, setSliderMax,
  catOpen, setCatOpen, priceOpen, setPriceOpen, monedaOpen, setMonedaOpen,
}: SidebarProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

    {/* Moneda */}
    <div style={{ borderBottom: "1px solid #f0f0f0" }}>
      <button onClick={() => setMonedaOpen(!monedaOpen)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: "#111", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>Moneda</span>
        <motion.span animate={{ rotate: monedaOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} color="#999" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {monedaOpen && (
          <motion.div key="moneda" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div style={{ paddingBottom: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {(["COP", "USD"] as const).map(c => (
                  <button key={c} onClick={() => setCurrency(c)}
                    style={{ padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s", border: "1.5px solid", borderColor: currency === c ? "#111" : "#e5e7eb", background: currency === c ? "#111" : "#fff", color: currency === c ? "#fff" : "#888" }}>
                    {c === "COP" ? "🇨🇴 COP" : "🇺🇸 USD"}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "#bbb", fontFamily: "'DM Sans', sans-serif" }}>
                {isLoadingRate ? "Cargando tasa..." : `1 USD = ${new Intl.NumberFormat("es-CO").format(Math.round(usdToCOP))} COP`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Categorías */}
    <div style={{ borderBottom: "1px solid #f0f0f0" }}>
      <button onClick={() => setCatOpen(!catOpen)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: "#111", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>Categorías</span>
        <motion.span animate={{ rotate: catOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} color="#999" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {catOpen && (
          <motion.div key="cats" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div style={{ paddingBottom: 18, display: "flex", flexDirection: "column", gap: 2 }}>
              {[{ id: "all", slug: null as string | null, name: "Todas las prendas" }, ...categories].map(cat => {
                const isActive = cat.slug === null ? !selectedCategory : selectedCategory === cat.slug;
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 8, background: isActive ? "#111" : "transparent", border: "none", cursor: "pointer", transition: "all 0.15s", textAlign: "left", width: "100%" }}>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : "#555", fontFamily: "'DM Sans', sans-serif" }}>{cat.name}</span>
                    {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Precio */}
    <div style={{ borderBottom: "1px solid #f0f0f0" }}>
      <button onClick={() => setPriceOpen(!priceOpen)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: "#111", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>Precio máximo</span>
        <motion.span animate={{ rotate: priceOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} color="#999" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {priceOpen && (
          <motion.div key="price" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div style={{ paddingBottom: 18 }}>
              <input type="range" min={0} max={maxPrice} step={step} value={sliderMax}
                onChange={e => setSliderMax(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#111", marginBottom: 10 }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#bbb", fontFamily: "'DM Sans', sans-serif" }}>{format(0)}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>{format(sliderMax)}</span>
              </div>
              {sliderMax < maxPrice && (
                <button onClick={() => setSliderMax(maxPrice)}
                  style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: "#999", fontFamily: "'DM Sans', sans-serif", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                  Restablecer
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

// ── Shop ───────────────────────────────────────────────────────
const Shop = () => {
  const isMobile = window.innerWidth < 1024;
  const [searchParams, setSearchParams]         = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery]           = useState(searchParams.get("search") || "");
  const [categories, setCategories]             = useState<Category[]>([]);
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [catOpen, setCatOpen]                   = useState(true);
  const [priceOpen, setPriceOpen]               = useState(true);
  const [monedaOpen, setMonedaOpen]             = useState(true);

  const { currency, setCurrency, format, usdToCOP, isLoadingRate, maxPrice, step } = useCurrency();
  const [sliderMax, setSliderMax] = useState(maxPrice);

  useEffect(() => { setSliderMax(maxPrice); }, [maxPrice]);

  useEffect(() => {
    const q = searchParams.get("search");
    setSearchQuery(q || "");
  }, [searchParams]);

  useEffect(() => {
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCategories(data || []));
  }, []);

  const { products, isLoading, refetch } = useProducts({
    categorySlug: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  useEffect(() => {
    const channel = supabase.channel("shop-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    const maxInCOP = currency === "USD" ? sliderMax * usdToCOP : sliderMax;
    return products.filter(p => p.price <= maxInCOP);
  }, [products, sliderMax, currency, usdToCOP]);

  const hasFilters = !!selectedCategory || sliderMax < maxPrice;
  const selectedCat = categories.find(c => c.slug === selectedCategory);

  const sidebarProps: SidebarProps = {
    categories, selectedCategory, setSelectedCategory,
    currency, setCurrency, usdToCOP, isLoadingRate, format,
    maxPrice, step, sliderMax, setSliderMax,
    catOpen, setCatOpen, priceOpen, setPriceOpen, monedaOpen, setMonedaOpen,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      
      <Ticker />

      <ShopHero total={filtered.length} />

      {/* Barra sticky */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 80, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: isMobile ? "none" : 380 }}>
            <Search size={14} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#111" }} />
            <input value={searchQuery} onChange={e => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val) {
                searchParams.set("search", val);
              } else {
                searchParams.delete("search");
              }
              setSearchParams(searchParams, { replace: true });
            }}
              placeholder="Buscar prendas..."
              style={{ 
                width: "100%", padding: "12px 16px 12px 42px", 
                borderRadius: "2px", border: "1px solid #E5E5E5", 
                background: "#FFFFFF", fontSize: 13, 
                fontFamily: "'DM Sans', sans-serif", outline: "none", 
                color: "#1A1C20", boxSizing: "border-box",
                transition: "border-color 0.2s"
              }} 
              onFocus={e => e.currentTarget.style.borderColor = "#111"}
              onBlur={e => e.currentTarget.style.borderColor = "#E5E5E5"} />
          </div>

          <button onClick={() => setSidebarOpen(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: "1.5px solid #eee", background: sidebarOpen ? "#111" : "#fff", color: sidebarOpen ? "#fff" : "#555", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.04em" }}
            className="lg:hidden">
            <SlidersHorizontal size={14} /> Filtros
            {hasFilters && <span style={{ background: sidebarOpen ? "#fff" : "#111", color: sidebarOpen ? "#111" : "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
          </button>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            <AnimatePresence>
              {selectedCat && <FilterChip key="cat" label={selectedCat.name} onRemove={() => setSelectedCategory(null)} />}
              {sliderMax < maxPrice && <FilterChip key="price" label={`Hasta ${format(sliderMax)}`} onRemove={() => setSliderMax(maxPrice)} />}
            </AnimatePresence>
          </div>

          <span style={{ fontSize: 12, color: "#bbb", fontFamily: "'DM Sans', sans-serif", flexShrink: 0, whiteSpace: "nowrap" }}>
            {isLoading ? "Cargando..." : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Layout */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}
        className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12 block">

        {/* Sidebar desktop */}
        <aside style={{ position: "sticky", top: 160 }} className="hidden lg:block">
          <SidebarContent {...sidebarProps} />
        </aside>

        {/* Drawer mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 45 }}
                className="lg:hidden" />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 300, background: "#fff", zIndex: 46, padding: "32px 24px", overflowY: "auto" }}
                className="lg:hidden">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>Filtros</span>
                  <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}><X size={20} /></button>
                </div>
                <SidebarContent {...sidebarProps} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Productos */}
        <div>
          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div style={{ aspectRatio: "3/4", background: "#f5f4f2", borderRadius: 16, marginBottom: 12 }} className="animate-pulse" />
                  <div style={{ height: 13, background: "#f0eeeb", borderRadius: 6, marginBottom: 8, width: "70%" }} className="animate-pulse" />
                  <div style={{ height: 13, background: "#f0eeeb", borderRadius: 6, width: "40%" }} className="animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "80px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🔍</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>Sin resultados</h3>
              <p style={{ fontSize: 14, color: "#aaa", fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}>
                {searchQuery ? `No encontramos prendas para "${searchQuery}"` : "No hay productos en esta categoría"}
              </p>
              <button onClick={() => { 
                  setSelectedCategory(null); 
                  setSearchQuery(""); 
                  searchParams.delete("search");
                  setSearchParams(searchParams);
                  setSliderMax(maxPrice); 
                }}
                style={{ padding: "11px 28px", borderRadius: 100, background: "#111", color: "#fff", fontSize: 12, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                Limpiar filtros
              </button>
            </motion.div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(clamp(170px, 25vw, 300px), 1fr))", 
              gap: isMobile ? 16 : 32 
            }}>
              {filtered.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

 
    </div>
  );
};

export default Shop;