import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";

const UpdatePassword = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasSession(false);
      } else {
        setHasSession(true);
        // Verificar si es un usuario de Google
        if (user.app_metadata?.provider === 'google') {
          setIsOAuthUser(true);
        }
      }
      setIsVerifying(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast({ title: "Contraseña corta", description: "La contraseña debe tener al menos 8 caracteres.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", description: "Asegúrate de escribir la misma contraseña en ambos campos.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada exitosamente." });
      navigate("/");
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: (error as Error)?.message || "Ocurrió un error al actualizar la contraseña", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0D1526] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7da4ff] animate-spin" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-[#0D1526] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#162136] rounded-2xl p-8 text-center border border-white/5 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Sesión inválida o expirada</h2>
          <p className="text-slate-400 mb-6">El enlace de recuperación puede haber expirado o ser incorrecto.</p>
          <button 
            onClick={() => navigate("/")}
            className="w-full py-3 bg-[#221ba9] hover:bg-[#2450cc] text-white rounded-xl font-semibold transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (isOAuthUser) {
    return (
      <div className="min-h-screen bg-[#0D1526] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#162136] rounded-2xl p-8 text-center border border-white/5 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-[#7da4ff] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Cuenta de Google</h2>
          <p className="text-slate-400 mb-6">
            Tu cuenta está vinculada a Google. No necesitas gestionar una contraseña localmente. 
            Por favor, inicia sesión con Google.
          </p>
          <button 
            onClick={() => navigate("/")}
            className="w-full py-3 bg-[#221ba9] hover:bg-[#2450cc] text-white rounded-xl font-semibold transition-all"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1526] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#162136] rounded-2xl p-8 border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#221ba9]/20 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-[#7da4ff]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Nueva Contraseña</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-evenly flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Contraseña Nueva
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-[#7da4ff]/50 focus:bg-white/10 transition-all"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Confirmar Contraseña
            </label>
            <input 
              type={showPassword ? "text" : "password"}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-[#7da4ff]/50 focus:bg-white/10 transition-all"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#221ba9] hover:bg-[#2450cc] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Cambiar Contraseña"
            )}
          </button>

          <button 
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mt-2"
          >
            <ArrowLeft size={14} />
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
