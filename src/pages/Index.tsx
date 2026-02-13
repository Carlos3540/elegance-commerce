import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import collectionEveryday from "@/assets/collection-everyday.jpg";
import ProductCard from "@/components/store/ProductCard";
import { products } from "@/data/products";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";

const Index = () => {
  const newArrivals = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      {/* Hero */}
      <section className="relative h-[70vh] lg:h-[85vh] overflow-hidden">
        <img src={heroBanner} alt="Colección nueva" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/80 text-lg md:text-xl font-body tracking-wide mb-3"
          >
            Recién llegado & nunca antes visto
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl text-primary-foreground font-bold leading-tight"
          >
            Diseñado especialmente<br />para ti
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Link
              to="/tienda"
              className="bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              Explorar Colección <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/tienda" className="relative group overflow-hidden aspect-[4/5]">
            <img src={categoryWomen} alt="Mujer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
            <div className="absolute bottom-8 left-8">
              <h3 className="font-display text-3xl font-bold text-primary-foreground">Mujer</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">Colección 2026</p>
            </div>
          </Link>
          <Link to="/tienda" className="relative group overflow-hidden aspect-[4/5]">
            <img src={categoryMen} alt="Hombre" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
            <div className="absolute bottom-8 left-8">
              <h3 className="font-display text-3xl font-bold text-primary-foreground">Hombre</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">Colección 2026</p>
            </div>
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 lg:px-8 pb-12 lg:pb-20">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl lg:text-4xl font-bold">Explorar Nuevas Llegadas</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/tienda" className="bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity inline-block">
            Ver Todo
          </Link>
        </div>
      </section>

      {/* Collection Banner */}
      <section className="bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="py-12 lg:py-20 pr-0 lg:pr-16">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-muted-foreground text-sm tracking-widest uppercase mb-3"
              >
                Colección Everyday 2026
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-4xl lg:text-5xl font-bold mb-4"
              >
                Sé tú misma
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground leading-relaxed mb-8"
              >
                La selección ideal para tu día a día en un rango de precios accesible. Mantente elegante y a la moda.
              </motion.p>
              <Link to="/tienda" className="bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity inline-block">
                Explorar
              </Link>
            </div>
            <div className="h-[400px] lg:h-[500px]">
              <img src={collectionEveryday} alt="Colección Everyday" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
