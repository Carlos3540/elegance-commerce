// src/pages/CheckoutSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, Truck, Mail, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const CheckoutSuccess: React.FC = () => {
  const [searchParams]  = useSearchParams();
  const orderId         = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();
      if (data) {
        setOrder(data);
        clearCart();
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, clearCart]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'linear-gradient(135deg, #f8f7f5 0%, #fff 100%)', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-12 opacity-70 hover:opacity-100 transition-opacity">
        <ShoppingBag size={20} className="text-gray-900" />
        <span className="font-black text-gray-900 text-lg tracking-tight">Evolet 96</span>
      </Link>

      {/* Card principal */}
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

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          ¡Pedido confirmado! 🎉
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Tu pedido ha sido procesado exitosamente. Recibirás un correo de confirmación con los detalles y el seguimiento de tu envío.
        </p>

        {/* Detalle del pedido */}
        {!loading && order && (
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
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                order.status === 'confirmed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status === 'confirmed' ? 'Confirmado' : 'Procesando'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Envío a</span>
              <span className="text-xs font-semibold text-gray-700 text-right max-w-[60%]">
                {order.shipping_name} — {order.shipping_address?.city ?? ''}
              </span>
            </div>
            {order.tracking_number && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tracking</span>
                <span className="text-xs font-mono font-bold text-blue-600">{order.tracking_number}</span>
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
            Mis pedidos <ArrowRight size={14} />
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

export default CheckoutSuccess;
