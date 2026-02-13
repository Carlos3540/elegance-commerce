import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import ProductCard from "@/components/store/ProductCard";
import { products, categories } from "@/data/products";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>("Mujer");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [selectedCategory, priceRange]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <p className="text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer">🏠 Inicio</span> &gt; <span className="font-medium text-foreground">Catálogo</span>
        </p>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold mb-4 border-b-2 border-accent pb-2 inline-block">CATEGORÍAS</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left text-sm py-1.5 transition-colors ${!selectedCategory ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <div key={cat.name}>
                    <button
                      onClick={() => {
                        setExpandedCat(expandedCat === cat.name ? null : cat.name);
                        setSelectedCategory(cat.name);
                      }}
                      className={`flex items-center justify-between w-full text-sm py-1.5 transition-colors ${selectedCategory === cat.name ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {cat.name}
                      {expandedCat === cat.name ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedCat === cat.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="pl-4 space-y-1 overflow-hidden"
                      >
                        {cat.subcategories.map((sub) => (
                          <button key={sub} className="block text-sm text-muted-foreground hover:text-accent py-1 transition-colors">
                            - {sub}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="font-display text-lg font-bold mb-4 border-b-2 border-accent pb-2 inline-block">FILTRAR POR PRECIO</h3>
              <input
                type="range"
                min={0}
                max={200}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-accent"
              />
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-muted-foreground">Precio: ${priceRange[0]}</span>
                <span className="text-muted-foreground">- ${priceRange[1]}</span>
                <button
                  onClick={() => setPriceRange([0, 200])}
                  className="ml-auto border border-border px-3 py-1 text-xs font-semibold uppercase hover:bg-secondary transition-colors"
                >
                  Filtrar
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">{filtered.length} productos encontrados</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-20">No se encontraron productos con estos filtros.</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
