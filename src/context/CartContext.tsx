// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // 💥 NUEVO: guardia contra ejecuciones concurrentes de init()
  const initInFlightRef = useRef(false);

  // Limpiar localStorage de forma segura
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
  const { data: existing, error: findErr } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (findErr) {
    console.error('CartContext: error buscando carrito:', findErr.code, findErr.message);
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
  useEffect(() => {
    if (!user) {
      setCartId(null);
      loadGuest();
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const init = async () => {
      // 💥 NUEVO: evita ejecuciones concurrentes de init()
      if (initInFlightRef.current) return;
      initInFlightRef.current = true;

      setIsLoading(true);
      try {
        // 💥 NUEVO: espera sesión fresca (resuelve solo cuando el
        // refresh de token en curso, si lo hay, ya terminó)
        const { data: { session } } = await supabase.auth.getSession();

        if (cancelled) return;

        if (!session) {
          setIsLoading(false);
          return;
        }

        const uid = session.user.id;

        if (import.meta.env.DEV) {
          console.debug(
            'CartContext init →',
            session.access_token ? 'token presente' : 'SIN TOKEN',
            'uid:', uid
          );
        }

        const guestItemsToMigrate = loadGuestCart();
        if (guestItemsToMigrate.length > 0) {
          clearGuestCart();
        }

        const cId = await getOrCreateCart(uid);
        if (!cId || cancelled) {
          setIsLoading(false);
          return;
        }
        setCartId(cId);

        if (guestItemsToMigrate.length > 0) {
          await migrateGuestCart(cId, guestItemsToMigrate);
        }

        await fetchItems(cId);

        if (cancelled) return;

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
        initInFlightRef.current = false;
        setIsLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
      clearGuestCart();
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