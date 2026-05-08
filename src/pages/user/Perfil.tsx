import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  User, Mail, Calendar, Shield, Camera, Check,
  X, Upload, Edit3, Save, AlertCircle,
} from "lucide-react";

/* ═══════════════════════ HELPERS ════════════════════════════ */

const fmtFull = (iso?: string | null): string => {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const fmtYear = (iso?: string | null): string => {
  if (!iso) return "—";
  try { return String(new Date(iso).getFullYear()); } catch { return "—"; }
};

const calcTenure = (iso?: string | null): string => {
  if (!iso) return "—";
  try {
    const from = new Date(iso);
    const now  = new Date();
    const m = (now.getFullYear() - from.getFullYear()) * 12
            + (now.getMonth()    - from.getMonth());
    if (m < 1)  return "Menos de un mes";
    if (m < 12) return `${m} ${m === 1 ? "mes" : "meses"}`;
    const y = Math.floor(m / 12), r = m % 12;
    if (r === 0) return `${y} ${y === 1 ? "año" : "años"}`;
    return `${y} ${y === 1 ? "año" : "años"} y ${r} ${r === 1 ? "mes" : "meses"}`;
  } catch { return "—"; }
};

const getInitials = (name?: string | null, email?: string | null): string => {
  if (name) {
    const p = name.trim().split(" ").filter(Boolean);
    if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
    if (p.length === 1 && p[0].length > 0) return p[0][0].toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "U";
};

/* ═══════════════════════ TICKER ═════════════════════════════ */

const TICKER_ITEMS = [
  "MI CUENTA", "GESTIÓN DE PERFIL", "DATOS PERSONALES", "PREFERENCIAS", "SEGURIDAD",
];

const Ticker = () => (
  <div style={{ background: "#111", overflow: "hidden", padding: "8px 0" }}>
    <motion.div
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{ display: "flex", whiteSpace: "nowrap" }}
    >
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
        <span key={i} style={{
          fontSize: 9, fontWeight: 800, letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.4)", padding: "0 28px",
          fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
        }}>
          {t} <span style={{ color: "rgba(255,255,255,0.15)", marginLeft: 16 }}>✦</span>
        </span>
      ))}
    </motion.div>
  </div>
);

/* ═══════════════════════ AVATAR ═════════════════════════════ */

const AvatarImg = ({
  src, name, email, size = 96,
}: {
  src?: string | null; name?: string | null; email?: string | null; size?: number;
}) => {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [src]);

  if (src && !err) {
    return (
      <img
        src={src}
        alt="avatar"
        referrerPolicy="no-referrer"
        onError={() => setErr(true)}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", display: "block",
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#222,#555)",
      fontSize: size * 0.32, fontWeight: 900, color: "#fff",
      fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.02em",
      flexShrink: 0,
    }}>
      {getInitials(name, email)}
    </div>
  );
};

/* ═══════════════════════ SMALL COMPONENTS ═══════════════════ */

const InfoRow = ({
  icon: Icon, label, value,
}: { icon: React.ElementType; label: string; value: string }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14,
    padding: "14px 0", borderBottom: "1px solid #f0f0f0",
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 9, background: "#f5f5f5",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={14} color="#aaa" />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", color: "#bbb",
        fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", marginBottom: 2,
      }}>{label}</p>
      <p style={{
        fontSize: 14, fontWeight: 600, color: "#111",
        fontFamily: "'DM Sans',sans-serif",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{value}</p>
    </div>
  </div>
);

const FieldInput = ({
  label, value, onChange, disabled = false,
}: {
  label: string; value: string;
  onChange: (v: string) => void; disabled?: boolean;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{
      fontSize: 10, fontWeight: 800, letterSpacing: "0.15em",
      color: disabled ? "#ccc" : "#888",
      fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase",
    }}>
      {label}
    </label>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        background: disabled ? "#f9f9f9" : "#fff",
        border: `1.5px solid ${disabled ? "#eee" : "#e0e0e0"}`,
        borderRadius: 10, padding: "11px 15px",
        color: disabled ? "#bbb" : "#111",
        fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
        outline: "none", width: "100%", boxSizing: "border-box" as const,
        cursor: disabled ? "not-allowed" : "text",
        transition: "border-color 0.18s",
      }}
      onFocus={e => { if (!disabled) e.currentTarget.style.borderColor = "#111"; }}
      onBlur={e => { if (!disabled) e.currentTarget.style.borderColor = "#e0e0e0"; }}
    />
  </div>
);

const StatCard = ({ label, val, sub }: { label: string; val: string; sub: string }) => (
  <div style={{
    background: "#fafafa", border: "1.5px solid #efefef",
    borderRadius: 16, padding: "18px 16px",
  }}>
    <p style={{
      fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#ccc",
      fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", marginBottom: 7,
    }}>{label}</p>
    <p style={{
      fontSize: 19, fontWeight: 900, color: "#111",
      fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.02em",
      lineHeight: 1, marginBottom: 4,
    }}>{val}</p>
    <p style={{ fontSize: 10, color: "#bbb", fontFamily: "'DM Sans',sans-serif" }}>{sub}</p>
  </div>
);

/* ═══════════════════════ MAIN PAGE ══════════════════════════ */

const Perfil = () => {
  const { user, profile, refreshProfile } = useAuth();

  /* ── Google detection ── */
  const isGoogle =
    user?.app_metadata?.provider === "google" ||
    (user?.identities ?? []).some((id: any) => id.provider === "google");

  const googlePhoto =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  /* ── Photo state ── */
  /* ── Derived display values ── */
  const createdAt   = (profile as any)?.created_at ?? null;
  const memberSince = fmtFull(createdAt);
  const memberYear  = fmtYear(createdAt);
  const memberDur   = calcTenure(createdAt);
  const role        = (profile as any)?.role === "admin" ? "Administrador" : "Usuario";

  const displayName  = (profile as any)?.full_name ?? "";
  const heroFirst    = displayName.split(" ")[0] || user?.email?.split("@")[0] || "Usuario";
  const heroRest     = displayName.split(" ").slice(1).join(" ") || "perfil";

  /* ── Inject styles once into <head> to avoid React DOM crash ── */
  useEffect(() => {
    const id = "perfil-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,300&display=swap');
      .pb-save{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 0;border-radius:100px;width:100%;background:#111;color:#fff;border:none;cursor:pointer;font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;font-family:'DM Sans',sans-serif;transition:background .18s,opacity .18s,transform .15s;}
      .pb-save:hover:not(:disabled){background:#333;transform:translateY(-1px);}
      .pb-save:disabled{opacity:.4;cursor:not-allowed;}
      .pb-cancel{display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 0;border-radius:100px;width:100%;background:transparent;color:#888;border:1.5px solid #e0e0e0;cursor:pointer;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;font-family:'DM Sans',sans-serif;transition:border-color .18s,color .18s;}
      .pb-cancel:hover{border-color:#aaa;color:#333;}
      .pb-edit{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:100px;background:#111;color:#fff;border:none;cursor:pointer;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-family:'DM Sans',sans-serif;transition:background .18s,transform .15s;white-space:nowrap;}
      .pb-edit:hover{background:#333;transform:translateY(-1px);}
      .pb-ghost{display:inline-flex;align-items:center;gap:7px;padding:11px 22px;border-radius:100px;background:transparent;color:#888;border:1.5px solid #e0e0e0;cursor:pointer;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;font-family:'DM Sans',sans-serif;transition:border-color .18s,color .18s;}
      .pb-ghost:hover{border-color:#aaa;color:#333;}
      .pb-dropzone{border:2px dashed #e5e5e5;border-radius:16px;padding:28px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:border-color .2s,background .2s;text-align:center;}
      .pb-dropzone:hover,.pb-dropzone.drag{border-color:#111;background:#fafafa;}
      @keyframes pb-spin{to{transform:rotate(360deg);}}
      @media(max-width:768px){
        .pb-hero{flex-direction:column!important;align-items:center!important;text-align:center!important;}
        .pb-grid{grid-template-columns:1fr!important;}
        .pb-stats{grid-template-columns:1fr 1fr!important;}
        .pb-title{font-size:clamp(34px,9vw,72px)!important;}
        .pb-cta{align-self:stretch;}
        .pb-edit,.pb-ghost{width:100%;justify-content:center;}
      }
    `;
    document.head.appendChild(el);
    return () => { const s = document.getElementById(id); if (s) s.remove(); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>

      <Ticker />

      {/* ════════ HERO ════════ */}
      <div style={{ padding: "60px 24px 65px", borderBottom: "1px solid #f0f0f0" }}>
        <div
          className="pb-hero"
          style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "flex-end", gap: 40 }}
        >
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%", padding: 3,
              background: "linear-gradient(135deg,#ddd,#f0f0f0)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}>
              <AvatarImg 
                src={(isGoogle ? googlePhoto : null) ?? (profile as any)?.avatar_url ?? null} 
                name={displayName || null} 
                email={user?.email} 
                size={114} 
              />
            </div>
          </div>

          {/* Name block */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#bbb",
              fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", marginBottom: 10,
            }}>
              {(profile as any)?.role === "admin" ? "✦ Administrador" : "✦ Mi Cuenta"}
            </p>

            <h1
              className="pb-title"
              style={{
                fontSize: "clamp(40px,6.5vw,76px)", fontWeight: 900, color: "#111",
                fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.04em",
                lineHeight: 1, marginBottom: 12,
              }}
            >
              {heroFirst}
              <span style={{
                fontStyle: "italic", fontWeight: 300, color: "#ccc",
                display: "block", fontSize: "0.54em", marginTop: 4,
              }}>
                {heroRest}
              </span>
            </h1>

            <p style={{ fontSize: 13, color: "#aaa", fontFamily: "'DM Sans',sans-serif" }}>
              {user?.email ?? ""}
            </p>

            {isGoogle && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
                padding: "5px 12px", borderRadius: 100,
                background: "#f5f5f5", border: "1px solid #e8e8e8",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#999",
                  letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase",
                }}>Google</span>
              </div>
            )}
          </div>


        </div>
      </div>

      {/* ════════ CONTENT ════════ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "50px 24px 100px" }}>
        <div
          className="pb-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}
        >

          {/* ── LEFT: info / edit form ── */}
          <div style={{
            background: "#fff", border: "1.5px solid #efefef",
            borderRadius: 20, padding: 28,
          }}>
            <p style={{
              fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", color: "#ccc",
              fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", marginBottom: 22,
            }}>
              Información Personal
            </p>

            <div>
              <InfoRow icon={User}     label="Nombre completo"    value={(profile as any)?.full_name || "No especificado"} />
              <InfoRow icon={Mail}     label="Correo electrónico" value={user?.email || "N/A"} />
              {(profile as any)?.instagram
                ? <InfoRow icon={User} label="Instagram" value={`@${(profile as any).instagram}`} />
                : null}
              <InfoRow icon={Shield}   label="Rol"                value={role} />
              <InfoRow icon={Calendar} label="Miembro desde"      value={memberSince} />
            </div>
          </div>

          {/* ── RIGHT: stats + photo ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Stats */}
            <div
              className="pb-stats"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
            >
              <StatCard label="Año de ingreso" val={memberYear}  sub={memberSince} />
              <StatCard label="Antigüedad"     val={memberDur}   sub="en la plataforma" />
              <StatCard
                label="Rol"
                val={role}
                sub="nivel de acceso"
              />
              <StatCard label="Estado" val="Activo" sub="cuenta verificada" />
            </div>

            {isGoogle && (
              <div style={{
                background: "#f0f7ff", border: "1.5px solid #dbeafe",
                borderRadius: 20, padding: 22,
                display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", fontFamily: "'DM Sans',sans-serif", marginBottom: 5 }}>
                    Foto desde Google
                  </p>
                  <p style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>
                    Tu foto se sincroniza automáticamente desde tu cuenta de Google.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default Perfil;