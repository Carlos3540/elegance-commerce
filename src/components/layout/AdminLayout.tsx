// src/components/layout/AdminLayout.tsx
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Box, Settings, LogOut, Bell, Search, ChevronRight,
  FileText, Star,
} from "lucide-react";

const AdminLayout = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { path: "/admin",            label: "Overview",   icon: LayoutDashboard },
    { path: "/admin/productos",  label: "Productos",  icon: Package },
    { path: "/admin/blog",       label: "Blog",       icon: FileText },
    { path: "/admin/resenas",    label: "Reseñas",    icon: Star },
    { path: "/admin/ordenes",    label: "Órdenes",    icon: ShoppingBag },
  ];

  const isActive = (path: string) => location.pathname === path;
  const currentLabel = navItems.find(i => isActive(i.path))?.label || "Overview";

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c0e1a !important; font-family: 'DM Sans', sans-serif; }
        .adm-nav:hover      { background: rgba(255,255,255,0.04) !important; color: rgba(255,255,255,0.75) !important; }
        .adm-icon-btn:hover { background: rgba(255,255,255,0.07) !important; color: rgba(255,255,255,0.7) !important; }
        .adm-logout:hover   { background: rgba(248,113,113,0.1) !important; color: #f87171 !important; }
        .adm-back:hover     { background: rgba(255,255,255,0.05) !important; color: rgba(255,255,255,0.55) !important; }
        tr:hover td         { background: rgba(255,255,255,0.018) !important; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#0c0e1a" }}>

        {/* ════════════ SIDEBAR ════════════ */}
        <aside style={{
          width: 256, minHeight: "100vh",
          background: "#070810",
          borderRight: "1px solid rgba(255,255,255,0.055)",
          display: "flex", flexDirection: "column",
          position: "fixed", top: 0, left: 0, zIndex: 50,
        }}>
          {/* Logo */}
          <div style={{ padding: "28px 28px 24px", borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/assets/logo.png" alt="Evolet"
                style={{ height: 34, objectFit: "contain" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Evolet</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, fontFamily: "'DM Sans', sans-serif" }}>Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "22px 14px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.11em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", padding: "0 14px", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
              Navegación
            </p>

            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link key={path} to={path} className="adm-nav" style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12, textDecoration: "none",
                  background: active ? "rgba(99,153,255,0.12)" : "transparent",
                  color: active ? "#7da4ff" : "rgba(255,255,255,0.4)",
                  fontSize: 15, fontWeight: active ? 700 : 400,
                  marginBottom: 3, transition: "all 0.15s ease",
                  position: "relative", fontFamily: "'DM Sans', sans-serif",
                }}>
                  {active && (
                    <span style={{
                      position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                      width: 3, height: 22, background: "#7da4ff", borderRadius: "0 4px 4px 0",
                    }} />
                  )}
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}

            <div style={{ height: 1, background: "rgba(255,255,255,0.055)", margin: "18px 14px" }} />

            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.11em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", padding: "0 14px", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
              Sistema
            </p>
            <Link to="/admin/configuracion" className="adm-nav" style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 12, textDecoration: "none",
              color: "rgba(255,255,255,0.4)", fontSize: 15,
              transition: "all 0.15s ease", fontFamily: "'DM Sans', sans-serif",
            }}>
              <Settings size={17} /> Configuración
            </Link>
          </nav>

          {/* Footer */}
          <div style={{ padding: "18px 18px 24px", borderTop: "1px solid rgba(255,255,255,0.055)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "0 4px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #1e3a8a, #2d5be3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 15, fontWeight: 800, flexShrink: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {profile?.full_name?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {profile?.full_name || "Admin"}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {profile?.email}
                </p>
              </div>
            </div>

            <Link to="/" className="adm-back" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px", borderRadius: 10, marginBottom: 8,
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.3)", fontSize: 13,
              textDecoration: "none", transition: "all 0.15s ease",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              ← Ir a Tienda
            </Link>

            <button onClick={handleLogout} className="adm-logout" style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px", borderRadius: 10,
              border: "1px solid rgba(248,113,113,0.14)",
              background: "transparent", cursor: "pointer",
              color: "rgba(248,113,113,0.55)", fontSize: 13, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s ease",
            }}>
              <LogOut size={14} /> Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* ════════════ MAIN ════════════ */}
        <div style={{ marginLeft: 256, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

          {/* Topbar */}
          <header style={{
            height: 72,
            borderBottom: "1px solid rgba(255,255,255,0.055)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 36px", background: "#0a0b16",
            position: "sticky", top: 0, zIndex: 40,
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em" }}>Admin</span>
                <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.18)" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{currentLabel}</span>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {saludo},{" "}
                <span style={{ color: "#7da4ff" }}>{profile?.full_name?.split(" ")[0] || "Admin"}</span>{" "}😁
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="adm-icon-btn" style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", transition: "all 0.15s" }}>
                <Search size={16} />
              </button>
              <button className="adm-icon-btn" style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", transition: "all 0.15s", position: "relative" }}>
                <Bell size={16} />
                <span style={{ position: "absolute", top: 9, right: 9, width: 7, height: 7, borderRadius: "50%", background: "#7da4ff", border: "2px solid #0a0b16" }} />
              </button>
            </div>
          </header>

          {/* Outlet */}
          <main style={{ flex: 1, overflow: "auto" }}>
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;