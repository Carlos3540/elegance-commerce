// src/pages/CheckoutSuccess.tsx
// Versión mejorada: verifica el estado real del pago Bold antes de mostrar éxito
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ShoppingBag, Truck, Mail, ArrowRight,
  Clock, AlertCircle, Loader2, RefreshCw, XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

type PaymentState = 'loading' | 'approved' | 'pending' | 'failed';

const CheckoutSuccess: React.FC = () => {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const orderId         = searchParams.get('order');
  const [order, setOrder]           = useState<Order | null>(null);
  const [boldStatus, setBoldStatus] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('loading');
  const [cartCleared, setCartCleared]   = useState(false);
  const { clearCart } = useCart();

  const checkPayment = useCallback(async () => {
    if (!orderId) {
      navigate('/tienda');
      return;
    }

    setPaymentState('loading');

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

      // 2. Obtener el estado de pagos_bold
      const { data: boldData } = await supabase
        .from('pagos_bold')
        .select('bold_status, bold_transaction_id, paid_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const status = boldData?.bold_status ?? null;
      setBoldStatus(status);

      if (status === 'APPROVED') {
        setPaymentState('approved');
        if (!cartCleared) {
          clearCart();
          setCartCleared(true);
        }
      } else if (['DECLINED', 'VOIDED', 'ERROR', 'REJECTED', 'FAILED'].includes(status)) {
        setPaymentState('failed');
      } else {
        // PENDING o sin registro aún: puede que el webhook no haya llegado todavía
        setPaymentState('pending');
      }
    } catch (err) {
      console.error('[CheckoutSuccess] error:', err);
      setPaymentState('failed');
    }
  }, [orderId, clearCart, cartCleared, navigate]);

  useEffect(() => {
    checkPayment();
  }, [checkPayment]);

  // ── Suscripción Realtime: si el webhook Bold llega mientras el cliente está viendo esta página
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`bold-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pagos_bold',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = payload.new?.bold_status;
          setBoldStatus(newStatus);
          if (newStatus === 'APPROVED') {
            setPaymentState('approved');
            if (!cartCleared) { clearCart(); setCartCleared(true); }
          } else if (['DECLINED', 'VOIDED', 'ERROR', 'REJECTED', 'FAILED'].includes(newStatus)) {
            setPaymentState('failed');
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, clearCart, cartCleared]);

  // ── Pantalla de carga ─────────────────────────────────────────────
  if (paymentState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" }}>
        <Loader2 size={36} className="animate-spin text-gray-900 mb-4" />
        <p className="text-gray-500 font-medium">Verificando tu pago...</p>
        <p className="text-gray-400 text-sm mt-1">Esto solo tomará un momento</p>
      </div>
    );
  }

  // ── Pago pendiente (no hay confirmación aún) ──────────────────────
  if (paymentState === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{ background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" }}>
        <LogoLink />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-amber-100 shadow-xl p-10 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Clock size={40} className="text-amber-500" />
          </motion.div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Verificando tu pago
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Tu transacción está siendo procesada por Bold. Esto puede tomar hasta un minuto.
            Esta página se actualizará automáticamente cuando el pago sea confirmado.
          </p>

          {order && (
            <div className="bg-amber-50 rounded-2xl p-4 text-left mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Pedido</span>
                <span className="text-xs font-mono font-bold text-amber-900">{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Total</span>
                <span className="font-black text-amber-900">{COP(order.total)}</span>
              </div>
            </div>
          )}

          <button
            onClick={checkPayment}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-colors mb-3"
          >
            <RefreshCw size={14} /> Verificar estado
          </button>
          <p className="text-xs text-gray-400">
            ¿El pago fue rechazado?{' '}
            <Link to="/checkout" className="underline text-gray-600 hover:text-gray-900">
              Intentar de nuevo
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Pago fallido / rechazado ──────────────────────────────────────
  if (paymentState === 'failed') {
    const emailSubject = encodeURIComponent(`Problema con pago de Pedido #${orderId?.slice(0, 8).toUpperCase() || 'Desconocido'}`);
    const emailBody = encodeURIComponent(`Hola equipo de Evolet 96,\n\nMi pago figura como rechazado pero veo un cobro en mi cuenta. Adjunto los datos para revisión:\n\n- Nombre completo: \n- Cédula (CC): \n- Entidad Bancaria: \n- Fecha del pago: ${new Date().toLocaleDateString('es-CO')}\n- Descripción del pedido: Pedido #${orderId?.slice(0, 8).toUpperCase() || 'Desconocido'}\n\n[POR FAVOR ADJUNTAR AQUÍ EL COMPROBANTE DE PAGO]\n\nGracias.`);
    const supportMailto = `mailto:contactoevolvet.96@gmail.com?subject=${emailSubject}&body=${emailBody}`;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{ background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" }}>
        <LogoLink />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-red-100 shadow-xl p-8 sm:p-10 max-w-md w-full text-center"
        >
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
              Por favor, <strong>revise directamente con su entidad bancaria</strong>. Puede ser por fondos insuficientes, tarjeta bloqueada o rechazo de seguridad por parte del banco.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/tienda"
              className="flex items-center justify-center gap-2 bg-gray-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-700 transition-colors"
            >
              Volver a la tienda
            </Link>

            <a
              href={supportMailto}
              className="flex items-center justify-center gap-2 bg-white text-gray-600 font-bold text-xs uppercase tracking-widest py-4 rounded-2xl border-2 border-gray-200 hover:border-gray-900 hover:text-gray-900 transition-colors mt-2"
            >
              <Mail size={16} /> Reportar si hubo cobro
            </a>
          </div>

          <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">
            Si el dinero fue debitado de tu cuenta, por favor envíanos un correo con el comprobante haciendo clic en el botón superior para realizar la validación manual.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Pago aprobado ✅ ──────────────────────────────────────────────
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
        {/* Icono animado */}
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
            Tu pago fue aprobado por Bold. Recibirás un correo con los detalles y el seguimiento de tu envío.
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
              <span className="text-xs font-mono font-bold text-gray-700">{order.id.slice(0, 8).toUpperCase()}</span>
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
                      <img src={item.product_image} alt={item.product_name}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0" />
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
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-700 transition-colors"
          >
            Ver mi pedido <ArrowRight size={14} />
          </Link>
          <Link
            to="/tienda"
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

const LogoLink = () => (
  <Link to="/" className="flex items-center gap-2 mb-12 opacity-70 hover:opacity-100 transition-opacity">
    <ShoppingBag size={20} className="text-gray-900" />
    <span className="font-black text-gray-900 text-lg tracking-tight">Evolet 96</span>
  </Link>
);

export default CheckoutSuccess;
