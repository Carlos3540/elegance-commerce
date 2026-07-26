// src/hooks/useOrders.ts
import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// ── Cliente: sus propios pedidos ──────────────────────────────────────────────

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          order_status_history(
            id, previous_status, new_status, changed_at, notes
          )
        `)
        .eq('user_id', user.id)
        .not('status', 'in', '("pending","failed")')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('useOrders error:', err);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) { setOrders([]); return; }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fetchOrders]);

  // Obtener estado del pago Bold de una orden específica
  const getBoldStatus = useCallback(async (orderId: string) => {
    const { data } = await supabase
      .from('pagos_bold')
      .select('bold_status, bold_transaction_id, paid_at, amount')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }, []);

  return { orders, isLoading, refetch: fetchOrders, getBoldStatus };
};

// ── Opciones para actualizar estado ──────────────────────────────────────────

export interface UpdateStatusOptions {
  carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;  // ISO date string YYYY-MM-DD
  cancellation_reason?: string;
  notes?: string;
}

// ── Admin: todos los pedidos ──────────────────────────────────────────────────

export const useAdminOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      // Sin join a profiles: RLS solo permite ver el perfil propio,
      // usar shipping_name / shipping_email que ya están en la orden como snapshot
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .not('status', 'in', '("pending","failed")')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useAdminOrders fetch error:', error.message, error.code);
        throw error;
      }

      if (!data || data.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      // Intentar cargar historial por separado (no crítico si falla)
      const orderIds = data.map(o => o.id);
      const { data: historyData } = await supabase
        .from('order_status_history')
        .select('id, order_id, previous_status, new_status, changed_at, notes, changed_by')
        .in('order_id', orderIds)
        .order('changed_at', { ascending: false });

      // Combinar historial con órdenes
      const historyByOrder: Record<string, any[]> = {};
      (historyData || []).forEach(h => {
        if (!historyByOrder[h.order_id]) historyByOrder[h.order_id] = [];
        historyByOrder[h.order_id].push(h);
      });

      const ordersWithHistory = data.map(o => ({
        ...o,
        status_history: historyByOrder[o.id] || [],
      }));

      setOrders(ordersWithHistory as any);
    } catch (err: any) {
      console.error('useAdminOrders error:', err?.message ?? err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) await fetchOrders();
    };

    load();

    // Canal con nombre único para evitar conflictos en Strict Mode
    const channelName = `admin-orders-rt-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => { if (mounted) fetchOrders(); }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Admin Orders] Realtime conectado ✓');
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Admin Orders] Error en canal Realtime');
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  /**
   * Actualiza el estado de un pedido e inserta en el historial de estados.
   * Maneja automáticamente los campos de envío y cancelación.
   */
  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    opts: UpdateStatusOptions = {}
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Orden no encontrada');

    // Construir el update payload
    const updatePayload: Record<string, any> = { status: newStatus };

    if (newStatus === 'shipped') {
      if (opts.carrier)           updatePayload.carrier           = opts.carrier;
      if (opts.tracking_number)   updatePayload.tracking_number   = opts.tracking_number;
      if (opts.tracking_url)      updatePayload.tracking_url      = opts.tracking_url;
      if (opts.estimated_delivery) updatePayload.estimated_delivery = opts.estimated_delivery;
      updatePayload.shipped_at = new Date().toISOString();
    }

    if (newStatus === 'delivered') {
      updatePayload.delivered_at = new Date().toISOString();
    }

    if (newStatus === 'cancelled' && opts.cancellation_reason) {
      updatePayload.cancellation_reason = opts.cancellation_reason;
    }

    // 1. Actualizar la orden
    const { error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (updateError) throw updateError;

    // 2. Insertar en el historial de estados
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id:        orderId,
        previous_status: order.status,
        new_status:      newStatus,
        changed_by:      user?.id ?? null,
        notes:           opts.notes ?? null,
      });

    if (historyError) console.error('Error insertando historial:', historyError);

    // 3. Actualizar estado local inmediatamente (optimistic)
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? {
            ...o,
            ...updatePayload,
            status: newStatus as any,
            status_history: [
              ...(o.status_history || []),
              {
                id:              crypto.randomUUID(),
                order_id:        orderId,
                previous_status: order.status,
                new_status:      newStatus,
                changed_by:      user?.id ?? null,
                changed_at:      new Date().toISOString(),
                notes:           opts.notes ?? null,
              },
            ],
          }
        : o
    ));
  };

  /**
   * Obtiene el estado Bold de una orden específica.
   */
  const getOrderBoldStatus = async (orderId: string) => {
    const { data } = await supabase
      .from('pagos_bold')
      .select('bold_status, bold_transaction_id, paid_at, amount, bold_order_id')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  };

  return {
    orders,
    isLoading,
    refetch: fetchOrders,
    updateOrderStatus,
    getOrderBoldStatus,
  };
};

// ── Verificar si hay una orden pendiente de pago para el usuario actual ───────

export const usePendingOrder = () => {
  const { user } = useAuth();
  const [pendingOrder, setPendingOrder] = useState<{
    orderId: string;
    boldOrderId: string;
    total: number;
    items: any[];
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkPendingOrder = useCallback(async () => {
    if (!user) return;
    setIsChecking(true);
    try {
      // Buscar orden pending creada en las últimas 24 horas
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: orders } = await supabase
        .from('orders')
        .select('id, total, order_items(*)')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!orders || orders.length === 0) {
        setPendingOrder(null);
        return;
      }

      const order = orders[0];

      // Verificar si tiene un pago Bold pendiente
      const { data: boldRecord } = await supabase
        .from('pagos_bold')
        .select('bold_order_id, bold_status')
        .eq('order_id', order.id)
        .eq('bold_status', 'PENDING')
        .limit(1)
        .maybeSingle();

      if (boldRecord) {
        setPendingOrder({
          orderId:     order.id,
          boldOrderId: boldRecord.bold_order_id,
          total:       order.total,
          items:       order.order_items || [],
        });
      } else {
        setPendingOrder(null);
      }
    } catch (err) {
      console.error('usePendingOrder error:', err);
      setPendingOrder(null);
    } finally {
      setIsChecking(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    checkPendingOrder();
  }, [checkPendingOrder]);

  return { pendingOrder, isChecking, recheck: checkPendingOrder };
};
