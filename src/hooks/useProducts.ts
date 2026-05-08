// src/hooks/useProducts.ts
import { useEffect, useState, useCallback } from 'react';
import { supabase, Product } from '@/lib/supabase';

export const useProducts = (options: {
  featured?: boolean;
  categorySlug?: string;
  limit?: number;
  search?: string;
} = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select('*, categories(id, name, slug), product_images(url, alt_text, sort_order, is_primary)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (options.featured)     query = query.eq('is_featured', true);
      if (options.limit)        query = query.limit(options.limit);
      if (options.search)       query = query.ilike('name', `%${options.search}%`);
      if (options.categorySlug) query = query.eq('categories.slug', options.categorySlug);

      const { data, error: err } = await query;
      if (err) throw err;
      setProducts(data || []);
    } catch (err: any) {
      console.error('useProducts error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [options.featured, options.categorySlug, options.limit, options.search]);

  useEffect(() => {
    fetchProducts();

    // ✅ Realtime para que la vista de cliente se actualice sin F5
    const channel = supabase
      .channel('public-products-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
};

// ── Un solo producto por id o slug ────────────────────────────
export const useProduct = (idOrSlug: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(idOrSlug);

    const fetchProduct = async () => {
      try {
        const { data, error: err } = await supabase
          .from('products')
          .select('*, categories(id, name, slug), product_images(url, alt_text, sort_order, is_primary)')
          .eq(isUUID ? 'id' : 'slug', idOrSlug)
          .single();

        if (err) throw err;
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [idOrSlug]);

  return { product, isLoading, error };
};

// ── Admin: todos los productos + realtime ─────────────────────
export const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: err } = await supabase
        .from('products')
        .select('*, categories(id, name, slug), product_images(url, alt_text, is_primary)')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Refresh silencioso — sin setIsLoading(true) para evitar flash/pantalla blanca
  const silentRefresh = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*, categories(id, name, slug), product_images(url, alt_text, is_primary)')
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
    } catch (err) {
      console.error('silentRefresh error:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    // ✅ Realtime usa silentRefresh para no mostrar spinner al guardar
    const channel = supabase
      .channel('admin-products-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, silentRefresh)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProducts, silentRefresh]);

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from('products').update({ is_active }).eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active } : p));
  };

  const toggleFeatured = async (id: string, is_featured: boolean) => {
    const { error } = await supabase.from('products').update({ is_featured }).eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured } : p));
  };

  return { products, isLoading, error, refetch: silentRefresh, deleteProduct, toggleActive, toggleFeatured };
};