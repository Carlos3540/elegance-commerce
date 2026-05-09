import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProducts } from "@/hooks/useProducts";
import { TrendingUp, ArrowRight } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";

const NewArrivals = () => {
  const isMobile = useIsMobile();
  const { products, isLoading } = useProducts({ limit: 4 });

  return (
    <section style={{ background: "#fafaf9", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#999", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginBottom: 6 }}>
              <TrendingUp size={11} style={{ display: "inline", marginRight: 5 }} />Recién llegados
            </p>
            <h2 style={{ fontSize: isMobile ? "clamp(24px, 6vw, 36px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 900, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Nuevas llegadas
            </h2>
          </motion.div>
          <Link to="/tienda" style={{ fontSize: 12, fontWeight: 700, color: "#111", fontFamily: "'DM Sans', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, borderBottom: "2px solid #111", paddingBottom: 2 }}>
            Ver todo <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20 }}>
            {Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden" }}>
                <div style={{ aspectRatio: "3/4", background: "#ebebeb", borderRadius: 16, marginBottom: 12 }} />
                <div style={{ height: 14, background: "#ebebeb", borderRadius: 6, marginBottom: 8, width: "70%" }} />
                <div style={{ height: 14, background: "#ebebeb", borderRadius: 6, width: "40%" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", 
            gap: isMobile ? "12px" : "24px" 
          }}>
            {products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
