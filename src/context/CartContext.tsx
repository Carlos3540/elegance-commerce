// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, CartItem, Product } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

// ── Tipos ────────────────────────────────────────────────────────
interface GuestItem {
  id: string;           // product.id usado como id temporal
  product_id: string;
  quantity: number;
  unit_price: number;
  size?: string | null;
  color?: string | null;
  product: Product;
}

interface CartContextType {
  items: (CartItem | GuestItem)[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, qty?: number, size?: string | null, color?: string | null) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  isGuest: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'evolet_guest_cart';

// ── Helpers guest cart ────────────────────────────────────────────
const loadGuestCart = (): GuestItem[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveGuestCart = (items: GuestItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartId, setCartId]       = useState<string | null>(null);
  const [items, setItems]         = useState<(CartItem | GuestItem)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen]       = useState(false);

  const isGuest = !user;

  // 💥 NUEVO: Función explícita para limpiar el localStorage de forma segura
  const clearGuestCart = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (e) {
      console.warn('CartContext: No se pudo limpiar localStorage:', e);
    }
  }, []);

  // ── GUEST: cargar desde localStorage ─────────────────────────
  const loadGuest = useCallback(() => {
    setItems(loadGuestCart());
  }, []);

  // ── SUPABASE: obtener o crear carrito ─────────────────────────
  const getOrCreateCart = useCallback(async (userId: string): Promise<string> => {
    const tryOnce = async () => {
      const { data: existing, error: findErr } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (findErr) {
        console.error('CartContext: error buscando carrito:', findErr.message);
        throw findErr;
      }
      if (existing) return existing.id;

      const { data: newCart, error: insertErr } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .maybeSingle();

      if (insertErr) {
        console.error('CartContext: error creando carrito:', insertErr.code, insertErr.message);
        throw insertErr;
      }
      return newCart?.id ?? '';
    };

    try {
      return await tryOnce();
    } catch (err: any) {
      const shouldRetry = err?.code === '42501' || err?.status === 401;

      if (!shouldRetry) throw err;

      const { error: refreshErr } = await supabase.auth.refreshSession();
      if (refreshErr) throw refreshErr;

      return await tryOnce();
    }
  }, []);

  // ── SUPABASE: cargar items ────────────────────────────────────
  const fetchItems = useCallback(async (cId: string) => {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (
          id, name, slug, image_url, price,
          compare_price, stock, sku, is_active
        )
      `)
      .eq('cart_id', cId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    setItems(data || []);
  }, []);

  // ── SUPABASE: migrar carrito guest al loguearse ───────────────
  // 💥 MODIFICADO: Ahora recibe los items directamente desde la memoria
  const migrateGuestCart = useCallback(async (cId: string, guestItems: GuestItem[]) => {
    if (guestItems.length === 0) return;

    for (const gi of guestItems) {
      let query = supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cId)
        .eq('product_id', gi.product_id);

      if (gi.size) query = query.eq('size', gi.size);
      else query = query.is('size', null);

      if (gi.color) query = query.eq('color', gi.color);
      else query = query.is('color', null);

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + gi.quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cId,
            product_id: gi.product_id,
            unit_price: gi.unit_price,
            quantity: gi.quantity,
            size: gi.size || null,
            color: gi.color || null,
          });
      }
    }
  }, []);

  // ── Inicializar ───────────────────────────────────────────────
  // NOTA: Solo depende de `user`, NO de `profile`.
  // Incluir `profile` causaba que el carrito se re-inicializara cada vez que
  // AuthContext terminaba de cargar el perfil, generando peticiones extra
  // que contribuían al error 429 de Supabase.
  useEffect(() => {
    if (!user) {
      setCartId(null);
      loadGuest();
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      setIsLoading(true);
      try {
        // 💥 NUEVO & CRÍTICO: Capturamos los datos locales INMEDIATAMENTE al autenticarse
        const guestItemsToMigrate = loadGuestCart();

        // 💥 NUEVO: Limpiamos el localStorage al instante para evitar ejecuciones duplicadas
        if (guestItemsToMigrate.length > 0) {
          clearGuestCart();
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        const uid = session.user.id;
        const cId = await getOrCreateCart(uid);
        if (!cId) {
          setIsLoading(false);
          return;
        }
        setCartId(cId);

        // 💥 MODIFICADO: Migramos usando la copia segura que guardamos en memoria
        if (guestItemsToMigrate.length > 0) {
          await migrateGuestCart(cId, guestItemsToMigrate);
        }

        await fetchItems(cId);

        // Realtime
        channel = supabase
          .channel(`cart-${cId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'cart_items', filter: `cart_id=eq.${cId}` },
            () => fetchItems(cId)
          )
          .subscribe();
      } catch (err) {
        console.error('CartContext init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Solo reacciona a cambios de sesión (login/logout), no al perfil o token refreshes

  // ── Agregar producto ──────────────────────────────────────────
  const addItem = useCallback(async (product: Product, qty: number = 1, size: string | null = null, color: string | null = null) => {
    if (isGuest) {
      const current = loadGuestCart();
      const idx = current.findIndex(i => i.product_id === product.id && i.size === size && i.color === color);
      if (idx >= 0) {
        current[idx].quantity = Math.min(current[idx].quantity + qty, product.stock);
      } else {
        current.push({
          id: `${product.id}-${size || ''}-${color || ''}-${Date.now()}`,
          product_id: product.id,
          quantity: qty,
          unit_price: product.price,
          size,
          color,
          product,
        });
      }
      saveGuestCart(current);
      setItems(current);
      setIsOpen(true);
      return;
    }

    if (!cartId) return;

    const existing = items.find(i => i.product_id === product.id && i.size === size && i.color === color);

    if (existing) {
      const newQty = Math.min(existing.quantity + qty, product.stock);
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', existing.id);

      if (error) throw error;
      setItems(prev => prev.map(i => i.id === existing.id ? { ...i, quantity: newQty } : i));
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: product.id,
          unit_price: product.price,
          quantity: qty,
          size,
          color,
        })
        .select(`
          *,
          product:products (
            id, name, slug, image_url, price,
            compare_price, stock, sku, is_active
          )
        `)
        .single();

      if (error) throw error;
      if (data) {
        setItems(prev => [...prev, data]);
      } else {
        await fetchItems(cartId);
      }
    }

    setIsOpen(true);
  }, [isGuest, cartId, items, fetchItems]);

  // ── Eliminar item ─────────────────────────────────────────────
  const removeItem = useCallback(async (cartItemId: string) => {
    if (isGuest) {
      const updated = loadGuestCart().filter(i => i.id !== cartItemId);
      saveGuestCart(updated);
      setItems(updated);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    setItems(prev => prev.filter(i => i.id !== cartItemId));
  }, [isGuest]);

  // ── Actualizar cantidad ───────────────────────────────────────
  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(cartItemId);

    if (isGuest) {
      const updated = loadGuestCart().map(i =>
        i.id === cartItemId ? { ...i, quantity } : i
      );
      saveGuestCart(updated);
      setItems(updated);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (error) throw error;
    setItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity } : i));
  }, [isGuest, removeItem]);

  // ── Vaciar carrito ────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (isGuest) {
      clearGuestCart(); // 💥 MODIFICADO: Uso de la función limpia para consistencia
      setItems([]);
      return;
    }

    if (!cartId) return;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) throw error;
    setItems([]);
  }, [isGuest, cartId, clearGuestCart]);

  // ── Cálculos ──────────────────────────────────────────────────
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal   = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const tax        = 0;
  const total      = subtotal;

  return (
    <CartContext.Provider value={{
      items,
      isLoading,
      isOpen,
      setIsOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      tax,
      total,
      isGuest,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};