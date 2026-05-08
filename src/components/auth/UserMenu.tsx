import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Package, Heart, LogOut, Shield } from "lucide-react";
import LoginDialog from "./LoginDialog";

const UserMenu = ({ isTransparent = false }: { isTransparent?: boolean }) => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (!user) {
    const btnColor = isTransparent ? "rgba(255,255,255,0.7)" : "#555";
    const btnBorder = isTransparent ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

    return (
      <>
        <button
          onClick={() => setLoginOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: "10px",
            border: `1.5px solid ${btnBorder}`,
            background: "transparent", color: btnColor,
            fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer", transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = isTransparent ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)";
            (e.currentTarget as HTMLButtonElement).style.background = isTransparent ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = btnBorder;
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <User size={15} />
          <span className="hidden md:inline">Iniciar Sesión</span>
        </button>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    );
  }

  /* ── Avatar source: profile table > Google metadata > fallback initials ── */
  const avatarUrl =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;

  const initials =
    profile?.full_name
      ?.split(" ")
      .slice(0, 2)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "U";

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Usuario";

  const menuItems = [
    { to: "/perfil",    icon: User,    label: "Mi Perfil"   },
    { to: "/pedidos",   icon: Package, label: "Mis Pedidos" },
    { to: "/favoritos", icon: Heart,   label: "Favoritos"   },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .um-avatar-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: transparent; cursor: pointer; padding: 0;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          overflow: hidden; flex-shrink: 0;
        }
        .um-avatar-btn:hover {
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.06);
        }

        .um-dropdown {
          background: #0D1526 !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 16px !important;
          padding: 8px !important;
          box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) !important;
          min-width: 230px !important;
          font-family: 'DM Sans', sans-serif;
          animation: um-in 0.15s ease;
        }
        @keyframes um-in {
          from { opacity:0; transform: translateY(-6px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        .um-header {
          padding: 14px 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 6px;
          display: flex; align-items: center; gap: 12;
        }

        .um-avatar-md {
          width: 42px; height: 42px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.1);
          flex-shrink: 0; overflow: hidden;
        }

        .um-name  { font-size:14px; font-weight:700; color:#edf0f8; letter-spacing:-0.01em; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .um-email { font-size:11px; color:rgba(255,255,255,0.28); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .um-item {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 12px; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.5);
          text-decoration: none; transition: all 0.15s ease;
          cursor: pointer; width: 100%;
          background: transparent; border: none;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.01em;
        }
        .um-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.9); }

        .um-item-admin { color: rgba(125,164,255,0.65); }
        .um-item-admin:hover { background: rgba(45,91,227,0.12); color: #7da4ff; }

        .um-item-danger { color: rgba(239,68,68,0.6); }
        .um-item-danger:hover { background: rgba(239,68,68,0.08); color: #ef4444; }

        .um-sep { height: 1px; background: rgba(255,255,255,0.06); margin: 6px 0; }
      `}</style>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="um-avatar-btn" aria-label="Menú de usuario">
            <Avatar style={{ width: "100%", height: "100%", borderRadius: "50%" }}>
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  referrerPolicy="no-referrer"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
              <AvatarFallback style={{
                width: "100%", height: "100%",
                background: "linear-gradient(135deg,#1a1a2e,#0f3460)",
                color: "rgba(255,255,255,0.9)",
                fontSize: 13, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="um-dropdown" align="end" sideOffset={10}>
          {/* Header */}
          <div className="um-header">
            <div className="um-avatar-md">
              <Avatar style={{ width: "100%", height: "100%", borderRadius: "50%" }}>
                {avatarUrl && (
                  <AvatarImage
                    src={avatarUrl}
                    referrerPolicy="no-referrer"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                <AvatarFallback style={{
                  width: "100%", height: "100%",
                  background: "linear-gradient(135deg,#1a1a2e,#0f3460)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 14, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="um-name">{displayName}</p>
              <p className="um-email">{user.email}</p>
            </div>
          </div>

          {/* Nav */}
          {menuItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className="um-item">
              <Icon size={15} /> {label}
            </Link>
          ))}

          {/* Admin */}
          {isAdmin && (
            <>
              <div className="um-sep" />
              <Link to="/admin" className="um-item um-item-admin">
                <Shield size={15} /> Panel Admin
              </Link>
            </>
          )}

          {/* Sign out */}
          <div className="um-sep" />
          <button className="um-item um-item-danger" onClick={signOut}>
            <LogOut size={15} /> Cerrar Sesión
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default UserMenu;