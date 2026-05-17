import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

// Layouts (keep standard to avoid flicker on wrap)
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Carga perezosa de páginas (Code Splitting por ruta)
const Index = lazy(() => import("./pages/Index"));
const Shop = lazy(() => import("./pages/Shop"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Configurador = lazy(() => import("@/pages/Configurador3d"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Perfil = lazy(() => import("./pages/user/Perfil"));
const Pedidos = lazy(() => import("./pages/user/Pedidos"));
const Favoritos = lazy(() => import("./pages/user/Favoritos"));
const UpdatePassword = lazy(() => import("./pages/auth/UpdatePassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const BlogPostPage = lazy(() => import("@/pages/BlogPost"));
const Maintenance = lazy(() => import("./pages/Maintenance"));

// Protección de rutas
import AdminRoute from "@/components/auth/AdminRoute";
import UserRoute from "@/components/auth/UserRoute";

// WhatsApp
import WhatsAppButton from "@/components/store/WhatsAppButton";

const queryClient = new QueryClient();

// Loader simple para la transición entre rutas
const PageLoader = () => (
  <div style={{ height: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

  if (isMaintenance && !isAdmin) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Maintenance />
      </Suspense>
    );
  }

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/tienda" element={<Shop />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/configurador" element={<Configurador />} />
            <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
          </Route>

          <Route path="/blog/:slug" element={<BlogPostPage />} />

          <Route element={<MainLayout />}>
            <Route element={<UserRoute />}>
              <Route path="/perfil"   element={<Perfil />} />
              <Route path="/pedidos"  element={<Pedidos />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>
          </Route>

          <Route path="/checkout/exitoso" element={<CheckoutSuccess />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"             element={<AdminDashboard />} />
              <Route path="/admin/productos"   element={<AdminDashboard />} />
              <Route path="/admin/blog"        element={<AdminDashboard />} />
              <Route path="/admin/ordenes"     element={<AdminDashboard />} />
              <Route path="/admin/resenas"     element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

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