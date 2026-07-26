// src/pages/CheckoutSuccess.tsx
// ──────────────────────────────────────────────────────────────────────────────
// FIX (2026-06): Se corrigieron tres bugs que causaban congelamiento:
//
//  Bug #1 (Race Condition Realtime): cartCleared era useState → se usaba como
//    dependencia de useEffect → al limpiar carrito, React destruía y recreaba el
//    canal Realtime justo cuando llegaba el evento de rechazo → evento perdido.
//    FIX: cartCleared → useRef. Los refs nunca cambian de referencia, así que
//    los closures de Realtime nunca necesitan re-suscribirse.
//
//  Bug #2 (checkPayment loops): cartCleared en useCallback hacía que la función
//    se recreara y el useEffect la llamara múltiples veces.
//    FIX: checkPayment usa el ref directamente (sin depender de él).
//
//  Bug #3 (Sin fallback): Si Realtime falla o el evento llega antes de
//    suscribirse, el usuario quedaba atrapado en 'pending' para siempre.
//    FIX: Polling cada POLL_INTERVAL_MS + timeout de HARD_TIMEOUT_MS.
// ──────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, ShoppingBag, Truck, Mail, ArrowRight,
  Clock, Loader2, RefreshCw, XCircle, Wifi, WifiOff,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

// ── Constantes de timing ───────────────────────────────────────────────────
const POLL_INTERVAL_MS  = 15_000; // Re-consulta Supabase cada 15s (fallback)
const HARD_TIMEOUT_MS   = 60_000; // Después de 60s, muestra pantalla de contacto

// ── Helpers ────────────────────────────────────────────────────────────────
const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

type PaymentState = 'loading' | 'approved' | 'pending' | 'failed' | 'timeout';

// ── Componente principal ───────────────────────────────────────────────────
const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const orderId        = searchParams.get('order');

  const [order, setOrder]               = useState<Order | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('loading');
  const [realtimeOk, setRealtimeOk]     = useState(false);  // indicador de conexión
  const [elapsed, setElapsed]           = useState(0);       // segundos esperando

  const { clearCart } = useCart();

  // ──────────────────────────────────────────────────────────────────────────
  // FIX #1: useRef en lugar de useState para cartCleared.
  // Al ser un ref, NUNCA aparece como dependencia de useEffect ni useCallback,
  // por lo que los canales Realtime NUNCA se destruyen/recrean por este cambio.
  // ──────────────────────────────────────────────────────────────────────────
  const cartClearedRef = useRef(false);

  // Helper estable para limpiar el carrito exactamente una vez
  const clearCartOnce = useCallback(() => {
    if (!cartClearedRef.current) {
      cartClearedRef.current = true;
      clearCart();
    }
  }, [clearCart]); // clearCart es estable (viene de context con useCallback)

  // ── Helper: aplica el nuevo estado Bold al paymentState ───────────────────
  const applyBoldStatus = useCallback((boldStatus: string | null | undefined) => {
    if (boldStatus === 'APPROVED') {
      setPaymentState('approved');
      clearCartOnce();
    } else if (boldStatus && ['DECLINED', 'VOIDED', 'ERROR', 'REJECTED', 'FAILED'].includes(boldStatus)) {
      setPaymentState('failed');
    }
  }, [clearCartOnce]);

  // ── Helper: aplica el nuevo status de orders al paymentState ──────────────
  const applyOrderStatus = useCallback((orderStatus: string | null | undefined) => {
    if (orderStatus === 'paid') {
      setPaymentState('approved');
      clearCartOnce();
    } else if (orderStatus === 'failed') {
      setPaymentState('failed');
    }
  }, [clearCartOnce]);

  // ──────────────────────────────────────────────────────────────────────────
  // FIX #2: checkPayment ya no depende de cartCleared (ahora usa el ref).
  // Dependencias estables: [orderId, navigate, applyBoldStatus, applyOrderStatus]
  // ──────────────────────────────────────────────────────────────────────────
  const checkPayment = useCallback(async () => {
    if (!orderId) {
      navigate('/tienda');
      return;
    }

    await supabase.auth.getSession();

    try {
      // 1. Obtener la orden
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (orderErr || !orderData) {
        setPaymentState('failed');
        return;
      }

      setOrder(orderData);

      // 2. Obtener estado de pagos_bold
      const { data: boldData } = await supabase
        .from('pagos_bold')
        .select('bold_status, bold_transaction_id, paid_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const boldStatus = boldData?.bold_status ?? null;

      // 3. Aplicar según prioridad: pagos_bold > orders.status
      if (boldStatus) {
        applyBoldStatus(boldStatus);
        return;
      }

      if (orderData.status === 'paid') {
        setPaymentState('approved');
        clearCartOnce();
        return;
      }

      if (orderData.status === 'failed') {
        setPaymentState('failed');
        return;
      }

      // Ninguna fuente confirma el resultado aún → pendiente
      setPaymentState('pending');

    } catch (err) {
      console.error('[CheckoutSuccess] checkPayment error:', err);
      setPaymentState('failed');
    }
  }, [orderId, navigate, applyBoldStatus, applyOrderStatus, clearCartOnce]);

  // ── Consulta inicial (solo se ejecuta una vez) ─────────────────────────
  useEffect(() => {
    checkPayment();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Intencional: solo queremos el fetch inicial. Realtime se encarga del resto.

  // ──────────────────────────────────────────────────────────────────────────
  // FIX #3a — Suscripción Realtime estable a pagos_bold
  // Dependencias: solo [orderId]. applyBoldStatus y clearCartOnce son estables.
  // El ref cartClearedRef ya NO es dependencia → el canal NUNCA se re-crea.
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`bold-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'pagos_bold',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('[CheckoutSuccess] 🔔 pagos_bold UPDATE:', payload.new?.bold_status);
          applyBoldStatus(payload.new?.bold_status);
        }
      )
      .subscribe((status) => {
        console.log('[CheckoutSuccess] Realtime pagos_bold status:', status);
        setRealtimeOk(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(channel); };
  }, [orderId, applyBoldStatus]); // ✅ cartCleared ya no es dependencia

  // ──────────────────────────────────────────────────────────────────────────
  // FIX #3b — Suscripción Realtime estable a orders (fallback rápido)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-paid-${orderId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('[CheckoutSuccess] 🔔 orders UPDATE:', payload.new?.status);
          applyOrderStatus(payload.new?.status as string | undefined);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, applyOrderStatus]); // ✅ cartCleared ya no es dependencia

  // ──────────────────────────────────────────────────────────────────────────
  // FIX #3c — Polling de respaldo cada POLL_INTERVAL_MS mientras 'pending'
  // Si Realtime falla o el evento llega antes de suscribirse, este polling
  // garantiza que eventualmente detectemos el estado correcto.
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (paymentState !== 'pending' || !orderId) return;

    const interval = setInterval(async () => {
      console.log('[CheckoutSuccess] 🔄 Polling Supabase (fallback)...');
      try {
        const { data: boldData } = await supabase
          .from('pagos_bold')
          .select('bold_status')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (boldData?.bold_status) {
          applyBoldStatus(boldData.bold_status);
          return;
        }

        const { data: orderData } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();

        if (orderData?.status) {
          applyOrderStatus(orderData.status);
        }
      } catch (err) {
        console.warn('[CheckoutSuccess] Polling error (ignorado):', err);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [paymentState, orderId, applyBoldStatus, applyOrderStatus]);

  // ── Timer de segundos (visible al usuario mientras espera) ────────────────
  useEffect(() => {
    if (paymentState !== 'pending') {
      setElapsed(0);
      return;
    }

    setElapsed(0);
    const timer = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [paymentState]);

  // ── Hard timeout: después de HARD_TIMEOUT_MS → estado 'timeout' ──────────
  useEffect(() => {
    if (paymentState !== 'pending') return;

    const timeout = setTimeout(async () => {
      console.warn('[CheckoutSuccess] ⏱ Hard timeout alcanzado — verificando BD...');
      // Último intento antes de timeout
      try {
        const { data: boldData } = await supabase
          .from('pagos_bold')
          .select('bold_status')
          .eq('order_id', orderId!)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (boldData?.bold_status && boldData.bold_status !== 'PENDING') {
          applyBoldStatus(boldData.bold_status);
          return;
        }
      } catch (_) {}
      setPaymentState('timeout');
    }, HARD_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [paymentState, orderId, applyBoldStatus]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Pantalla de carga inicial ────────────────────────────────────────────
  if (paymentState === 'loading') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full mb-5"
        />
        <p className="text-gray-700 font-semibold">Verificando tu pago…</p>
        <p className="text-gray-400 text-sm mt-1">Esto solo tomará un momento</p>
      </div>
    );
  }

  // ── Pendiente: esperando webhook de Bold ─────────────────────────────────
  if (paymentState === 'pending') {
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{ background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" }}
      >
        <LogoLink />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-amber-100 shadow-xl p-8 sm:p-10 max-w-md w-full text-center"
        >
          {/* Ícono animado */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-amber-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock size={36} className="text-amber-500" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Verificando tu pago
          </h1>

          {/* Timer */}
          <p className="text-amber-500 font-mono text-2xl font-bold mb-1">{timeStr}</p>
          <p className="text-gray-400 text-xs mb-6">esperando confirmación de Bold</p>

          {/* Barra de progreso indeterminada */}
          <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-amber-500 rounded-full"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '40%' }}
            />
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Tu transacción está siendo procesada por Bold. Esta página se actualiza
            automáticamente cuando el pago sea confirmado.
          </p>

          {/* Indicador Realtime */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {realtimeOk ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-green-600 font-medium">Escuchando en tiempo real</span>
                <Wifi size={12} className="text-green-500" />
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="text-xs text-gray-400">Conectando…</span>
                <WifiOff size={12} className="text-gray-400" />
              </>
            )}
          </div>

          {/* Info del pedido */}
          {order && (
            <div className="bg-amber-50 rounded-2xl p-4 text-left mb-6 space-y-2 border border-amber-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Pedido</span>
                <span className="text-xs font-mono font-bold text-amber-900">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Total</span>
                <span className="font-black text-amber-900">{COP(order.total)}</span>
              </div>
            </div>
          )}

          <button
            id="btn-verificar-pago"
            onClick={checkPayment}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all mb-3"
          >
            <RefreshCw size={14} /> Verificar ahora
          </button>

          <p className="text-xs text-gray-400">
            ¿El pago fue rechazado?{' '}
            <Link to="/checkout" className="underline text-gray-600 hover:text-gray-900 transition-colors">
              Intentar de nuevo
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Timeout: demasiado tiempo esperando ──────────────────────────────────
  if (paymentState === 'timeout') {
    const emailSubject = encodeURIComponent(`Verificación de Pago — Pedido #${orderId?.slice(0, 8).toUpperCase() || 'Desconocido'}`);
    const emailBody    = encodeURIComponent(
      `Hola equipo de Evolet 96,\n\nMi pago no ha sido confirmado después de esperar más de 1 minuto.\n\n` +
      `- ID del pedido: ${orderId || 'Desconocido'}\n- Fecha: ${new Date().toLocaleDateString('es-CO')}\n\n` +
      `Por favor verifiquen el estado del pago. Gracias.`
    );

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{ background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" }}
      >
        <LogoLink />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-orange-100 shadow-xl p-8 sm:p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={36} className="text-orange-500" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Verificación pendiente
          </h1>

          <div className="bg-orange-50 text-orange-800 rounded-2xl p-4 mb-6 border border-orange-100 text-left">
            <p className="text-sm font-semibold mb-1">No recibimos respuesta de Bold en el tiempo esperado.</p>
            <p className="text-xs text-orange-700/80 leading-relaxed">
              Tu pago puede haberse procesado correctamente. Te recomendamos esperar
              unos minutos y revisar tu correo electrónico.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={checkPayment}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={14} /> Verificar de nuevo
            </button>

            <a
              href={`mailto:contactoevolvet.96@gmail.com?subject=${emailSubject}&body=${emailBody}`}
              className="flex items-center justify-center gap-2 bg-white text-gray-600 font-bold text-xs uppercase tracking-widest py-4 rounded-2xl border-2 border-gray-200 hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              <Mail size={14} /> Contactar soporte
            </a>

            <Link
              to="/tienda"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors text-center py-2"
            >
              Volver a la tienda
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Pago fallido / rechazado ─────────────────────────────────────────────
  if (paymentState === 'failed') {
    const emailSubject = encodeURIComponent(`Problema con pago — Pedido #${orderId?.slice(0, 8).toUpperCase() || 'Desconocido'}`);
    const emailBody    = encodeURIComponent(
      `Hola equipo de Evolet 96,\n\nMi pago figura como rechazado pero veo un cobro en mi cuenta.\n\n` +
      `- Nombre completo: \n- Cédula (CC): \n- Entidad Bancaria: \n` +
      `- Fecha del pago: ${new Date().toLocaleDateString('es-CO')}\n` +
      `- Descripción del pedido: Pedido #${orderId?.slice(0, 8).toUpperCase() || 'Desconocido'}\n\n` +
      `[POR FAVOR ADJUNTAR AQUÍ EL COMPROBANTE DE PAGO]\n\nGracias.`
    );

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{ background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" }}
      >
        <LogoLink />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-red-100 shadow-xl p-8 sm:p-10 max-w-md w-full text-center"
        >
          {/* Ícono de rechazo con animación spring */}
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-24 h-24 border-4 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.25)] relative"
          >
            <div className="absolute inset-0 rounded-full border-4 border-red-500 border-dashed animate-[spin_10s_linear_infinite] opacity-30" />
            <XCircle size={48} className="text-red-500" strokeWidth={3} />
          </motion.div>

          <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">
            Pago Rechazado
          </h1>

          <div className="bg-red-50 text-red-800 rounded-2xl p-4 mb-6 border border-red-100">
            <p className="text-sm font-semibold mb-2">
              Bold no pudo procesar tu pago de forma exitosa.
            </p>
            <p className="text-xs text-red-700/80 leading-relaxed">
              Por favor, <strong>revisa directamente con tu entidad bancaria</strong>. Puede ser por
              fondos insuficientes, tarjeta bloqueada o rechazo de seguridad por parte del banco.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 bg-gray-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-700 transition-colors"
            >
              Intentar de nuevo
            </Link>

            <Link
              to="/tienda"
              className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-widest py-4 rounded-2xl border border-gray-200 hover:border-gray-400 transition-colors"
            >
              Volver a la tienda
            </Link>

            <a
              href={`mailto:contactoevolvet.96@gmail.com?subject=${emailSubject}&body=${emailBody}`}
              className="flex items-center justify-center gap-2 bg-white text-gray-600 font-bold text-xs uppercase tracking-widest py-4 rounded-2xl border-2 border-gray-200 hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              <Mail size={16} /> Reportar si hubo cobro
            </a>
          </div>

          <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">
            Si el dinero fue debitado de tu cuenta, envíanos el comprobante por correo
            para realizar la validación manual.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Pago aprobado ✅ ─────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'linear-gradient(135deg, #f8f7f5 0%, #fff 100%)', fontFamily: "'DM Sans', sans-serif" }}
    >
      <LogoLink />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 max-w-lg w-full text-center"
      >
        {/* Ícono de éxito */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={40} className="text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            ¡Pedido confirmado! 🎉
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Tu pago fue aprobado por Bold. Recibirás un correo con los detalles
            y el seguimiento de tu envío.
          </p>
        </motion.div>

        {/* Detalle del pedido */}
        {order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-2xl p-5 text-left mb-6 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pedido</span>
              <span className="text-xs font-mono font-bold text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</span>
              <span className="font-black text-gray-900">{COP(order.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Envío a</span>
              <span className="text-xs font-semibold text-gray-700 text-right max-w-[60%]">
                {order.shipping_name} — {(order.shipping_address as any)?.city ?? ''}
              </span>
            </div>

            {/* Items del pedido */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="border-t border-gray-200 pt-3 space-y-2 mt-2">
                {order.order_items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity} · {COP(item.unit_price)}</p>
                    </div>
                  </div>
                ))}
                {order.order_items.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">+{order.order_items.length - 3} más</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Pasos siguientes */}
        <div className="space-y-3 mb-8 text-left">
          {[
            { icon: Mail,  text: 'Recibirás un email de confirmación en los próximos minutos.' },
            { icon: Truck, text: 'Tu pedido será preparado y enviado en 1-2 días hábiles.' },
            { icon: Clock, text: 'El tiempo de entrega es de 2-5 días hábiles según tu ciudad.' },
          ].map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={14} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-600 leading-snug">{text}</p>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/pedidos"
            id="btn-ver-pedido"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-700 transition-colors"
          >
            Ver mi pedido <ArrowRight size={14} />
          </Link>
          <Link
            to="/tienda"
            id="btn-seguir-comprando"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-900 font-black text-xs uppercase tracking-widest py-4 rounded-2xl border border-gray-200 hover:border-gray-400 transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </motion.div>

      <p className="text-xs text-gray-400 mt-8">
        ¿Alguna pregunta? Escríbenos a{' '}
        <a href="mailto:contactoevolvet.96@gmail.com" className="underline hover:text-gray-700 transition-colors">
          contactoevolvet.96@gmail.com
        </a>
      </p>
    </div>
  );
};

// ── Sub-componentes ────────────────────────────────────────────────────────

const LogoLink = () => (
  <Link to="/" className="flex items-center gap-2 mb-12 opacity-70 hover:opacity-100 transition-opacity">
    <ShoppingBag size={20} className="text-gray-900" />
    <span className="font-black text-gray-900 text-lg tracking-tight">Evolet 96</span>
  </Link>
);

export default CheckoutSuccess;
