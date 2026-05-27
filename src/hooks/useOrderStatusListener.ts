// src/hooks/useOrderStatusListener.ts
// ──────────────────────────────────────────────────────────────────────────────
// Hook que escucha cambios de status en la tabla `orders` en tiempo real.
// Se activa en el paso 2 del checkout (mientras el cliente está en Bold)
// y muestra alertas inmediatas de aprobación o rechazo del pago.
//
// Flujo:
//   1. El cliente abre Bold y procesa el pago.
//   2. Bold llama al webhook → bold-webhook actualiza `orders.status`.
//   3. Supabase Realtime emite el evento UPDATE.
//   4. Este hook lo recibe y:
//      - 'failed' → toast de rechazo (cliente puede reintentar en checkout)
//      - 'paid'   → toast de éxito → redirige a /checkout/exitoso?order=UUID
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseOrderStatusListenerProps {
  /** UUID de la orden en Supabase. Si es undefined/null, el listener no se activa. */
  orderId?: string | null;
  /** Solo escucha cuando enabled=true. Útil para activar solo en el paso 2. */
  enabled?: boolean;
  /**
   * Callback opcional cuando el pago es rechazado.
   * Se llama ADEMÁS del toast, para que el componente pueda resetear su UI.
   */
  onRejected?: () => void;
}

export function useOrderStatusListener({
  orderId,
  enabled = true,
  onRejected,
}: UseOrderStatusListenerProps) {
  const navigate   = useNavigate();
  // Ref para evitar redirigir / toastear más de una vez por mismo status
  const handledRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!enabled || !orderId) return;

    console.log(`[useOrderStatusListener] ✅ Monitoreando orden: ${orderId}`);

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = payload.new?.status as string | undefined;
          if (!newStatus) return;

          // Guardia: no procesar el mismo status dos veces
          if (handledRef.current[newStatus]) return;
          handledRef.current[newStatus] = true;

          console.log(`[useOrderStatusListener] 🔔 Status cambió a: ${newStatus}`);

          // ─────────────────────────────────────────────────────────────
          // PAGO RECHAZADO → toast de error, cliente puede reintentar
          // ─────────────────────────────────────────────────────────────
          if (newStatus === 'failed') {
            toast.error('❌ Pago rechazado', {
              id:          'payment-rejected',
              duration:    9000,
              description: 'Intenta con otra tarjeta o método de pago. Si el problema persiste, contacta a tu banco.',
            });
            onRejected?.();
            return;
          }

          // ─────────────────────────────────────────────────────────────
          // PAGO EXITOSO → toast de éxito + redirección a página de confirmación
          // ─────────────────────────────────────────────────────────────
          if (newStatus === 'paid') {
            toast.success('✅ ¡Pago exitoso!', {
              id:          'payment-approved',
              duration:    4000,
              description: 'Tu pedido fue procesado correctamente. Redirigiendo…',
            });

            // Redirige a página de éxito tras 2 segundos (da tiempo al toast)
            setTimeout(() => {
              navigate(`/checkout/exitoso?order=${orderId}`);
            }, 2000);

            return;
          }

          // ─────────────────────────────────────────────────────────────
          // ESTADOS POSTERIORES gestionados por el admin
          // ─────────────────────────────────────────────────────────────
          const adminMessages: Record<string, string> = {
            processing: '📦 Tu pedido está siendo preparado',
            shipped:    '🚚 Tu pedido está en camino',
            delivered:  '✔️ ¡Tu pedido fue entregado!',
          };

          if (adminMessages[newStatus]) {
            toast.success(adminMessages[newStatus], { duration: 6000 });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[useOrderStatusListener] 🔌 Conectado a Supabase Realtime');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useOrderStatusListener] ❌ Error en canal Realtime');
        }
      });

    return () => {
      console.log('[useOrderStatusListener] 🔕 Limpiando suscripción Realtime');
      supabase.removeChannel(channel);
    };
  }, [orderId, enabled]); // navigate y onRejected son estables entre renders
}
