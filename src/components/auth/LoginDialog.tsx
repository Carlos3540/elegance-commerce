import { useState } from "react";
import sideImage from "@/assets/forminicio.png";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { FcGoogle } from "react-icons/fc";
import { Mail, Eye, EyeOff, User, Calendar, Instagram, ArrowRight, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// ─── REEMPLAZA ESTA URL CON TU IMAGEN ───────────────────────────────────────
const SIDE_IMAGE_URL = sideImage;
// ────────────────────────────────────────────────────────────────────────────

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Débil", color: "#ef4444" };
  if (score === 2) return { score: 2, label: "Regular", color: "#f97316" };
  if (score === 3) return { score: 3, label: "Buena", color: "#41f63b" };
  return { score: 4, label: "Fuerte", color: "#10b981" };
}

const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [view, setView] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [dob, setDob] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const strength = getPasswordStrength(password);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Error al iniciar sesión", 
        description: (error as Error)?.message || "Ocurrió un error", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!acceptedPrivacy) {
      toast({
        title: "Consentimiento requerido",
        description: "Debes aceptar el tratamiento de datos personales para registrarte.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const data = await signUpWithEmail(email, password, {
        full_name: name,
        instagram: instagram,
        dob: dob,
      });

      // Si no hay sesión, significa que necesita confirmar el correo
      if (data?.user && !data?.session) {
        toast({
          title: "¡Registro casi listo!",
          description: "Hemos enviado un enlace de confirmación a tu correo. Por favor, revísalo para activar tu cuenta.",
          duration: 6000,
        });
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Tu cuenta ha sido creada con éxito.",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Error al registrar", 
        description: (error as Error)?.message || "Ocurrió un error", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      toast({ 
        title: "Correo enviado", 
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.", 
      });
      setView("login");
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Error", 
        description: (error as Error)?.message || "No se pudo enviar el correo de recuperación", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden border-0"
        style={{
          maxWidth: "min(880px, 94vw)",
          width: "100%",
          borderRadius: "24px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300 ;400;500;600&family=Syne:wght@700;800&display=swap');

          .ev-input {
            width: 100%;
            padding: 13px 16px 13px 44px;
            border-radius: 10px;
            border: 1.5px solid rgba(255,255,255,0.07);
            background: rgba(255, 255, 255, 0.04);
            color: #e8eaf0;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            outline: none;
            transition: all 0.2s ease;
            box-sizing: border-box;
          }
          .ev-input::placeholder { color: rgba(255,255,255,0.2); }
          .ev-input:focus {
            border-color: rgba(99,153,255,0.45);
            background: rgba(255,255,255,0.07);
            box-shadow: 0 0 0 4px rgba(99,153,255,0.07);
          }
          .ev-input-wrap { position: relative; }
          .ev-icon-left {
            position: absolute;
            left: 14px; top: 50%;
            transform: translateY(-50%);
            color: rgba(255,255,255,0.25);
            width: 15px; height: 15px;
            pointer-events: none;
          }
          .ev-icon-right {
            position: absolute;
            right: 13px; top: 50%;
            transform: translateY(-50%);
            color: rgba(255,255,255,0.25);
            cursor: pointer;
            transition: color 0.2s;
            line-height: 0;
          }
          .ev-icon-right:hover { color: rgba(255,255,255,0.55); }
          .ev-label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.07em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.33);
            margin-bottom: 7px;
          }
          .ev-btn-primary {
            width: 100%;
            padding: 14px;
            border-radius: 10px;
            background: #221ba9;
            color: #fff;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 14px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.25s ease;
            letter-spacing: 0.01em;
          }
          .ev-btn-primary:hover {
            background: #2450cc;
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(45,91,227,0.4);
          }
          .ev-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
          .ev-btn-google {
            width: 100%;
            padding: 13px;
            border-radius: 10px;
            background: transparent;
            color: rgba(255,255,255,0.65);
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            font-size: 14px;
            border: 1.5px solid rgba(255,255,255,0.09);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            transition: all 0.2s ease;
          }
          .ev-btn-google:hover {
            border-color: rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.04);
          }
          .ev-tab {
            padding: 8px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.33);
            font-family: 'Inter', sans-serif;
            transition: all 0.2s ease;
            letter-spacing: 0.01em;
          }
          .ev-tab.active {
            background: rgba(45,91,227,0.22);
            color: #7da4ff;
          }
          .ev-tab:not(.active):hover { color: rgba(255,255,255,0.55); }
          .ev-divider {
            display: flex; align-items: center; gap: 12px;
          }
          .ev-divider::before, .ev-divider::after {
            content: ''; flex: 1; height: 1px;
            background: rgba(255,255,255,0.06);
          }
          .ev-divider span {
            font-size: 11px;
            color: rgba(255,255,255,0.2);
            letter-spacing: 0.07em;
            text-transform: uppercase;
          }
          .ev-switch {
            font-size: 13px;
            color: rgba(255,255,255,0.3);
            text-align: center;
          }
          .ev-switch button {
            color: #7da4ff;
            font-weight: 600;
            background: none;
            border: none;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            padding: 0;
            margin-left: 5px;
          }
          .ev-switch button:hover { text-decoration: underline; }
          .strength-bar-track {
            height: 3px;
            border-radius: 99px;
            background: rgba(255,255,255,0.07);
            overflow: hidden;
            flex: 1;
          }
          .strength-bar-fill {
            height: 100%;
            border-radius: 99px;
            transition: width 0.3s ease, background-color 0.3s ease;
          }
          @media (max-width: 600px) {
            .ev-side { display: none !important; }
            .ev-form { border-radius: 24px !important; padding: 36px 22px !important; }
          }
        `}</style>

        <div style={{ display: "flex", minHeight: "560px" }}>

          {/* ── IMAGEN LATERAL ── */}
          <div
            className="ev-side"
            style={{
              width: "40%",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
              borderRadius: "24px 0 0 24px",
              background: "#0a1020",
            }}
          >
            {/* Tu imagen — cambia SIDE_IMAGE_URL al inicio del archivo */}
            <img
              src={SIDE_IMAGE_URL}
              alt="cover"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(8,14,32,0.85) 0%, rgba(8,14,32,0.1) 60%, transparent 100%)",
            }} />
            <div style={{ position: "absolute", bottom: 28, left: 28 }}>
              <p style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 24,
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}>EVOLET</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 7, letterSpacing: "0.04em" }}>
                Tu espacio, tu estilo
              </p>
            </div>
          </div>

          {/* ── FORMULARIO ── */}
          <div
            className="ev-form"
            style={{
              flex: 1,
              background: "#0D1526",
              padding: "48px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              borderRadius: "0 24px 24px 0",
              overflowY: "auto",
            }}
          >
            {/* Tabs */}
            <div style={{
              display: "inline-flex",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "10px",
              padding: "4px",
              marginBottom: 36,
              alignSelf: "flex-start",
              gap: 2,
            }}>
              <button className={`ev-tab ${view === "login" ? "active" : ""}`} onClick={() => setView("login")}>
                Iniciar Sesión
              </button>
              <button className={`ev-tab ${view === "register" ? "active" : ""}`} onClick={() => setView("register")}>
                Registrarse
              </button>
            </div>

            {/* Título (accesible) */}
            <div style={{ marginBottom: 32 }}>
              <DialogTitle style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 25,
                color: "#edf0f8",
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
                margin: 0,
              }}>
                {view === "login" ? "Bienvenido de nuevo" : view === "register" ? "Crea tu cuenta" : "Recuperar cuenta"}
              </DialogTitle>
              <DialogDescription style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 9, lineHeight: 1.6 }}>
                {view === "login"
                  ? "Ingresa tus datos para acceder a tu cuenta"
                  : view === "register"
                  ? "Completa el formulario para comenzar"
                  : "Te enviaremos un enlace para restablecer tu clave"}
              </DialogDescription>
            </div>

            {/* ── LOGIN ── */}
            {view === "login" && (
              <form onSubmit={handleEmailSignIn} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label className="ev-label">Correo electrónico</label>
                  <div className="ev-input-wrap">
                    <Mail className="ev-icon-left" />
                    <input className="ev-input" type="email" placeholder="tu@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <label className="ev-label" style={{ margin: 0 }}>Contraseña</label>
                    <button 
                      type="button" 
                      onClick={() => setView("forgot")}
                      style={{ fontSize: 12, color: "#7da4ff", background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0 }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="ev-input-wrap">
                    <svg className="ev-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input className="ev-input" type={showPassword ? "text" : "password"}
                      placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                    <span className="ev-icon-right" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </span>
                  </div>
                </div>

                <button className="ev-btn-primary" type="submit" disabled={isLoading} style={{ marginTop: 6 }}>
                  {isLoading ? "Iniciando..." : <><span>Iniciar Sesión</span><ArrowRight size={15} /></>}
                </button>
              </form>
            )}

            {/* ── RECUPERAR CONTRASEÑA ── */}
            {view === "forgot" && (
              <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label className="ev-label">Correo electrónico</label>
                  <div className="ev-input-wrap">
                    <Mail className="ev-icon-left" />
                    <input className="ev-input" type="email" placeholder="tu@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <button className="ev-btn-primary" type="submit" disabled={isLoading} style={{ marginTop: 6 }}>
                  {isLoading ? "Enviando..." : <><span>Enviar Enlace</span><ArrowRight size={15} /></>}
                </button>

                <button 
                  type="button" 
                  onClick={() => setView("login")}
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}
                >
                  Volver al inicio de sesión
                </button>
              </form>
            )}
            {view === "register" && (
              <form onSubmit={handleEmailSignUp} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label className="ev-label">Nombre completo</label>
                  <div className="ev-input-wrap">
                    <User className="ev-icon-left" />
                    <input className="ev-input" type="text" placeholder="Tu nombre"
                      value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="ev-label">Correo electrónico</label>
                  <div className="ev-input-wrap">
                    <Mail className="ev-icon-left" />
                    <input className="ev-input" type="email" placeholder="tu@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="ev-label">Instagram</label>
                    <div className="ev-input-wrap">
                      <Instagram className="ev-icon-left" />
                      <input className="ev-input" type="text" placeholder="@usuario"
                        value={instagram} onChange={e => setInstagram(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="ev-label">Nacimiento</label>
                    <div className="ev-input-wrap">
                      <Calendar className="ev-icon-left" />
                      <input className="ev-input" type="date" value={dob}
                        onChange={e => setDob(e.target.value)} style={{ colorScheme: "dark" }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="ev-label">Contraseña</label>
                  <div className="ev-input-wrap">
                    <svg className="ev-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input className="ev-input" type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres" value={password}
                      onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                    <span className="ev-icon-right" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </span>
                  </div>

                  {/* Indicador de fortaleza */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="strength-bar-track">
                          <div className="strength-bar-fill" style={{
                            width: strength.score >= i ? "100%" : "0%",
                            background: strength.color,
                          }} />
                        </div>
                      ))}
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: strength.color,
                        whiteSpace: "nowrap",
                        letterSpacing: "0.04em",
                        minWidth: 44,
                      }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4 }}>
                  <Checkbox 
                    id="privacy" 
                    checked={acceptedPrivacy} 
                    onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                    style={{ 
                      marginTop: 2, 
                      borderColor: "rgba(255,255,255,0.2)",
                      backgroundColor: acceptedPrivacy ? "#221ba9" : "transparent"
                    }}
                  />
                  <label 
                    htmlFor="privacy" 
                    style={{ 
                      fontSize: 12, 
                      color: "rgba(255,255,255,0.45)", 
                      lineHeight: 1.4,
                      cursor: "pointer"
                    }}
                  >
                    Acepto el tratamiento de mis datos personales de acuerdo con la{" "}
                    <button 
                      type="button" 
                      style={{ color: "#7da4ff", background: "none", border: "none", padding: 0, fontSize: 12, cursor: "pointer" }}
                      onClick={() => window.open('/politica-privacidad', '_blank')}
                    >
                      Ley 1581 de 2012
                    </button>.
                  </label>
                </div>

                <button className="ev-btn-primary" type="submit" disabled={isLoading} style={{ marginTop: 4 }}>
                  {isLoading ? "Registrando..." : <><span>Crear cuenta</span><ArrowRight size={15} /></>}
                </button>
              </form>
            )}

            {/* Divider + Google */}
            <div style={{ marginTop: 26 }}>
              <div className="ev-divider"><span>O continúa con</span></div>
              <button
                className="ev-btn-google"
                type="button"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await signInWithGoogle();
                  } catch (error) {
                    console.error(error);
                    toast({ title: "Error con Google", description: (error as Error)?.message || "No se pudo iniciar con Google", variant: "destructive" });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                style={{ marginTop: 14 }}
              >
                <FcGoogle size={17} />
                Continuar con Google
              </button>
            </div>

            {/* Switch */}
            {view !== "forgot" && (
              <p className="ev-switch" style={{ marginTop: 22 }}>
                {view === "login"
                  ? <>¿No tienes cuenta?<button onClick={() => setView("register")}>Regístrate gratis</button></>
                  : <>¿Ya tienes cuenta?<button onClick={() => setView("login")}>Inicia sesión</button></>}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;