import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";

/**
 * MainLayout - Layout principal para páginas públicas y de usuario
 */

const MainLayout = () => {
  const location = useLocation();
  // Páginas que empiezan con contenido oscuro y requieren Navbar transparente
  const isHeroPage = ["/", "/configurador", "/contacto"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      
      <main className={`flex-1 ${isHeroPage ? "" : "pt-24"}`}>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;