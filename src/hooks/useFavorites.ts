// src/hooks/useFavorites.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface FavoriteProduct {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price: number | null;
    image_url: string;
    stock: number;
    low_stock_threshold: number;
    is_featured: boolean;
    tags: string[];
    metadata: Record<string, any>;
    categories?: { id: string; name: string; slug: string } | null;
  };
}

interface UseFavoritesReturn {
  favorites: FavoriteProduct[];
  isLoading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useFavorites = (): UseFavoritesReturn => {
  const { user } = useAuth();
  const [favorites, setFavorites]   = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading]   = useState(false);

  // Prevent concurrent fetches
  const fetchingRef = useRef(false);

  /* ── Fetch ── */
  const fetchFavorites = useCallback(async () => {
    if (!user?.id || fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          product:products (
            id, name, slug, price, compare_price,
            image_url, stock, low_stock_threshold,
            is_featured, tags, metadata,
            categories ( id, name, slug )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFavorites((data as unknown as FavoriteProduct[]) ?? []);
    } catch (err: any) {
      console.error("[useFavorites] fetch:", err?.message);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]);

  /* ── Fetch + reset on auth change ── */
  useEffect(() => {
    // Limpiamos favoritos al cerrar sesión para evitar estado basura
    if (!user?.id) {
      setFavorites([]);
      return;
    }
    fetchFavorites();
  }, [user?.id, fetchFavorites]);

  /* ── Realtime ─────────────────────────────────────────────── */
  useEffect(() => {
    // GUARD: sin usuario autenticado no subscribimos nada.
    // Antes, el canal se creía con filter `user_id=eq.undefined`,
    // lo que generaba errores 401/400 en el websocket de Supabase.
    if (!user?.id) return;

    const channel = supabase
      .channel(`fav:${user.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "favorites",
        filter: `user_id=eq.${user.id}`,
      }, () => fetchFavorites())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchFavorites]);

  /* ── isFavorite (O1 set lookup) ── */
  const favIds = favorites.map(f => f.product_id);

  const isFavorite = useCallback(
    (productId: string) => favIds.includes(productId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favorites]
  );

  /* ── Ensure profile row exists before inserting favorite ──
     The favorites.user_id FK now points to auth.users(id),
     but we still need the profile row for RLS policy reads.
     This upserts it silently if the trigger missed it.        */
  const ensureProfile = useCallback(async () => {
    if (!user?.id || !user?.email) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? "",
        avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? "",
        role: "user",
        instagram: "",
      }, { onConflict: "id", ignoreDuplicates: true });
    if (error && error.code !== "23505") {
      console.warn("[useFavorites] ensureProfile:", error.message);
    }
  }, [user]);

  /* ── Toggle ── */
  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!user?.id) return;

      const alreadySaved = favIds.includes(productId);

      if (alreadySaved) {
        // Optimistic remove
        setFavorites(prev => prev.filter(f => f.product_id !== productId));
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) {
          console.error("[useFavorites] remove:", error.message);
          fetchFavorites(); // rollback
        }
      } else {
        // Optimistic add
        const optimistic: FavoriteProduct = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          product_id: productId,
          created_at: new Date().toISOString(),
        };
        setFavorites(prev => [optimistic, ...prev]);

        // Make sure profile row exists (handles Google OAuth race condition)
        await ensureProfile();

        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, product_id: productId });

        if (error) {
          if (error.code === "23505") {
            // Already exists (double-click) — just refresh
            fetchFavorites();
          } else {
            console.error("[useFavorites] insert:", error.message, error.code);
            setFavorites(prev => prev.filter(f => f.id !== optimistic.id)); // rollback
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, favIds, fetchFavorites, ensureProfile]
  );

  /* ── Remove ── */
  const removeFavorite = useCallback(
    async (productId: string) => {
      if (!user?.id) return;
      setFavorites(prev => prev.filter(f => f.product_id !== productId));
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) {
        console.error("[useFavorites] removeFavorite:", error.message);
        fetchFavorites();
      }
    },
    [user?.id, fetchFavorites]
  );

  return { favorites, isLoading, isFavorite, toggleFavorite, removeFavorite, refetch: fetchFavorites };
};