import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

// Layouts
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Páginas públicas
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Configurador from "@/pages/Configurador3d";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Páginas de usuario
import Perfil from "./pages/user/Perfil";
import Pedidos from "./pages/user/Pedidos";
import Favoritos from "./pages/user/Favoritos";
import UpdatePassword from "./pages/auth/UpdatePassword";

// Checkout + pago
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";

// Protección de rutas
import AdminRoute from "@/components/auth/AdminRoute";
import UserRoute from "@/components/auth/UserRoute";

// WhatsApp
import WhatsAppButton from "@/components/store/WhatsAppButton";

// Blog
import BlogPostPage from "@/pages/BlogPost";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        {/* ============================================
            RUTAS PÚBLICAS — con MainLayout
            ============================================ */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/tienda" element={<Shop />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/configurador" element={<Configurador />} />
          <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
        </Route>

        {/* Blog detalle — pública, sin Navbar/Footer del layout para diseño propio */}
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        {/* ============================================
            RUTAS DE USUARIO — requieren login
            ============================================ */}
        <Route element={<MainLayout />}>
          <Route element={<UserRoute />}>
            <Route path="/perfil"   element={<Perfil />} />
            <Route path="/pedidos"  element={<Pedidos />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>
        </Route>

        {/* Confirmación de pago — sin layout (página limpia) */}
        <Route path="/checkout/exitoso" element={<CheckoutSuccess />} />

        {/* Auth — sin layout */}
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* ============================================
            RUTAS DE ADMIN — sin Navbar/Footer
            ============================================ */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"             element={<AdminDashboard />} />
            <Route path="/admin/productos"   element={<AdminDashboard />} />
            <Route path="/admin/blog"        element={<AdminDashboard />} />
            <Route path="/admin/ordenes"     element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Botón WhatsApp — solo fuera del admin */}
      {!isAdmin && <WhatsAppButton />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;