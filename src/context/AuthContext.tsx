// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, metadata?: { full_name?: string; instagram?: string; dob?: string }) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser]           = useState<User | null>(null);
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Guards para evitar llamadas duplicadas ─────────────────────
  const fetchCounterRef = useRef(0);   // cancela fetches en vuelo al llegar uno nuevo
  const mountedRef      = useRef(true);
  const initializedRef  = useRef(false); // ← CLAVE: evita que onAuthStateChange
                                         //   vuelva a fetchear lo que getSession ya hizo

  // ── fetchProfile: único punto de acceso al perfil ─────────────
  // Usa un contador para descartar respuestas de llamadas anteriores
  // (race-condition safe). Máx. 3 reintentos con backoff.
  const fetchProfile = useCallback(async (userId: string) => {
    fetchCounterRef.current += 1;
    const myFetchId = fetchCounterRef.current;

    // Delays de backoff: 0 ms → 1 s → 3 s (3 intentos totales)
    const delays = [0, 1000, 3000];

    for (let attempt = 0; attempt < delays.length; attempt++) {
      // ¿Llegó una llamada más nueva? Abortamos esta.
      if (fetchCounterRef.current !== myFetchId || !mountedRef.current) return;

      if (delays[attempt] > 0) {
        await new Promise(r => setTimeout(r, delays[attempt]));
      }

      if (fetchCounterRef.current !== myFetchId || !mountedRef.current) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (fetchCounterRef.current !== myFetchId || !mountedRef.current) return;

        if (error) {
          console.error(`[AuthContext] fetchProfile intento ${attempt + 1}:`, error.code, error.message);
          if (attempt === delays.length - 1) {
            setProfile(null);
            setIsLoading(false);
          }
          continue; // reintento
        }

        setProfile(data ?? null);
        setIsLoading(false);
        return; // éxito → salimos

      } catch (err) {
        console.error(`[AuthContext] fetchProfile excepción intento ${attempt + 1}:`, err);
        if (attempt === delays.length - 1) {
          setProfile(null);
          setIsLoading(false);
        }
      }
    }
  }, []);

  // ── Efecto principal: inicialización única ─────────────────────
  useEffect(() => {
    mountedRef.current    = true;
    initializedRef.current = false;

    // ── PASO 1: leer sesión local (sin petición de red extra) ────
    // getSession() lee desde localStorage primero; solo hace red si
    // el token expiró. Es la fuente de verdad inicial.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;

      initializedRef.current = true; // marcamos: ya inicializamos

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setIsLoading(false);
      }
    });

    // ── PASO 2: escuchar cambios posteriores ─────────────────────
    // REGLA CRÍTICA: ignoramos INITIAL_SESSION porque getSession() ya
    // lo manejó. Solo reaccionamos a eventos que ocurren DESPUÉS.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mountedRef.current) return;

        // INITIAL_SESSION siempre llega justo tras suscribirse.
        // Lo ignoramos: getSession() es nuestra fuente de verdad inicial.
        if (event === 'INITIAL_SESSION') return;

        const currentUser = session?.user ?? null;

        if (event === 'SIGNED_OUT') {
          fetchCounterRef.current += 1; // cancela cualquier fetch pendiente
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        // SIGNED_IN: usuario acaba de autenticarse (login real, no recarga).
        // Solo actuamos si ya pasó la inicialización de getSession para
        // no procesar el SIGNED_IN que llega junto al INITIAL_SESSION.
        if (event === 'SIGNED_IN') {
          setUser(currentUser);
          if (currentUser) fetchProfile(currentUser.id);
          return;
        }

        // USER_UPDATED: datos del usuario cambiaron (nombre, avatar, etc.)
        if (event === 'USER_UPDATED') {
          setUser(currentUser);
          if (currentUser) fetchProfile(currentUser.id);
          return;
        }

        // TOKEN_REFRESHED: SOLO actualizamos el objeto user en memoria.
        // NO llamamos fetchProfile: el perfil no cambió, y esta era la
        // causa principal del bucle 429 (refresh → fetchProfile → más requests).
        if (event === 'TOKEN_REFRESHED') {
          setUser(currentUser);
          return;
        }
      }
    );

    // Safety net: si en 15 s no termina, liberamos la UI
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current) {
        console.warn('[AuthContext] Safety timeout: forzando isLoading=false');
        setIsLoading(false);
      }
    }, 15000);

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // fetchProfile está memorizada con useCallback y no necesita estar en deps

  // ── Métodos de autenticación ───────────────────────────────────

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; instagram?: string; dob?: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: metadata?.full_name || '',
          instagram: metadata?.instagram || '',
          dob:       metadata?.dob       || '',
        },
      },
    });
    if (error) throw error;

    // Upsert manual del perfil para evitar condición de carrera con el trigger de BD.
    if (data.user) {
      await supabase.from('profiles').upsert({
        id:        data.user.id,
        email:     email,
        full_name: metadata?.full_name || '',
        instagram: metadata?.instagram || '',
        dob:       metadata?.dob       || null,
        role:      'user',
      }, { onConflict: 'id' });
    }

    return data;
  };

  const signOut = async () => {
    fetchCounterRef.current += 1; // cancela fetch en curso
    setProfile(null);
    setUser(null);
    setIsLoading(false);
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};