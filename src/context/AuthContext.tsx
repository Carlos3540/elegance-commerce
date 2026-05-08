// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

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
  const fetchCounterRef           = useRef(0);
  const mountedRef                = useRef(true);

  // ── Fetch perfil con reintentos (sin timeout artificial) ──────
  const fetchProfile = async (userId: string) => {
    fetchCounterRef.current += 1;
    const myFetchId = fetchCounterRef.current;

    const delays = [0, 1000, 2500, 4000]; // 4 intentos

    for (let attempt = 0; attempt < delays.length; attempt++) {
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
          console.error(`fetchProfile intento ${attempt + 1}:`, error.code, error.message);
          if (attempt === delays.length - 1) {
            setProfile(null);
            setIsLoading(false);
          }
          continue;
        }

        if (!data) {
          if (attempt === delays.length - 1) {
            setProfile(null);
            setIsLoading(false);
          }
          continue;
        }

        setProfile(data);
        setIsLoading(false);
        return;

      } catch (err) {
        console.error(`fetchProfile excepción intento ${attempt + 1}:`, err);
        if (attempt === delays.length - 1) {
          setProfile(null);
          setIsLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    // ── 1. Leer sesión desde localStorage (sin red, instantáneo) ─
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setIsLoading(false);
      }
    });

    // ── 2. Escuchar cambios (login, logout, token refresh) ────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mountedRef.current) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === 'SIGNED_OUT') {
          fetchCounterRef.current += 1; // cancelar fetch pendiente
          setProfile(null);
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (currentUser) fetchProfile(currentUser.id);
          return;
        }

        // INITIAL_SESSION: ya manejado por getSession, ignorar para no duplicar
      }
    );

    // Safety net: 20s máximo
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current) {
        console.warn('Safety timeout: forzando isLoading=false');
        setIsLoading(false);
      }
    }, 20000);

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

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
          dob: metadata?.dob || '',
        },
      },
    });
    if (error) throw error;

    // Upsert manual del perfil para evitar la condición de carrera con el trigger de BD.
    // El trigger puede tardar varios segundos; creamos el perfil nosotros mismos aquí
    // para que AuthContext lo encuentre en el primer intento de fetchProfile.
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        full_name: metadata?.full_name || '',
        instagram: metadata?.instagram || '',
        dob: metadata?.dob || null,
        role: 'user',
      }, { onConflict: 'id' });
    }

    return data;
  };

  const signOut = async () => {
    fetchCounterRef.current += 1; // cancelar fetch en curso
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
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
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