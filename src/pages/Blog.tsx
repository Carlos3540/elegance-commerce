import { motion } from "framer-motion";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";

const blogPosts = [
  { id: 1, title: "Tendencias de Moda Primavera 2026", excerpt: "Descubre las últimas tendencias que dominarán esta temporada primaveral.", date: "Feb 10, 2026", category: "Tendencias" },
  { id: 2, title: "Cómo combinar accesorios con tu outfit", excerpt: "Guía completa para elegir los accesorios perfectos para cada ocasión.", date: "Feb 5, 2026", category: "Consejos" },
  { id: 3, title: "Moda sostenible: El futuro del estilo", excerpt: "La industria de la moda se reinventa con prácticas más responsables.", date: "Ene 28, 2026", category: "Sostenibilidad" },
];

const Blog = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <CartDrawer />

    <div className="container mx-auto px-4 lg:px-8 py-4">
      <p className="text-sm text-muted-foreground">
        <span>🏠 Inicio</span> &gt; <span className="font-medium text-foreground">Blog</span>
      </p>
    </div>

    <div className="container mx-auto px-4 lg:px-8 pb-16">
      <h1 className="font-display text-3xl lg:text-4xl font-bold mb-10 text-center">Nuestro Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogPosts.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="border border-border group cursor-pointer"
          >
            <div className="aspect-video bg-secondary" />
            <div className="p-6">
              <span className="text-xs text-accent font-semibold uppercase tracking-wider">{post.category}</span>
              <h2 className="font-display text-xl font-semibold mt-2 mb-3 group-hover:text-accent transition-colors">{post.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
              <p className="text-xs text-muted-foreground">{post.date}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>

    <Footer />
  </div>
);

export default Blog;
