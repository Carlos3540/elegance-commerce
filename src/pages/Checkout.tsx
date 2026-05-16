// src/pages/Checkout.tsx
// ──────────────────────────────────────────────────────────────────────────────
// ARQUITECTURA DOM (actualizada - integración personalizada Bold):
//
//   • NO hay <div id="bold-checkout-container"> — Bold maneja su propio
//     modal overlay global. Eliminamos completamente el embedded mode
//     que causaba los errores de insertBefore / removeChild.
//
//   • Flujo de pago:
//       1. handleStep1Submit() → crea orden en Supabase → pasa a paso 2
//       2. useEffect dispara handlePrepararBold() → carga SDK + firma HMAC
//          + crea instancia BoldCheckout (sin abrir)
//       3. El botón "Pagar ahora con Bold" llama abrirCheckoutBold() → open()
//
//   • Cuando cambia cheapest (envío):
//       → se destruye la instancia, se pide nueva firma, se re-prepara Bold.
//
//   • El error BTN-001 estaba causado por usar `integrity` en vez de
//     `integritySignature` (propiedad correcta según doc oficial Bold).

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, MapPin, User, Phone, Mail, FileText,
  Home, Building2, Briefcase, Warehouse, ChevronDown,
  Truck, CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  Shield, CreditCard, MessageCircle,
} from 'lucide-react';
import { BoldScriptButton } from '@/components/store/BoldScriptButton';
import { useCart }          from '@/context/CartContext';
import { useAuth }          from '@/context/AuthContext';
import { useShippingQuote } from '@/hooks/useShippingQuote';
import { DEPARTAMENTOS }    from '@/data/divipola';
import {
  crearOrdenEnSupabase,
  pedirFirmaBold,
  prepararCheckoutBold,
  abrirCheckoutBold,
  resetearInstanciaBold,
  type CartItemForOrder,
} from '@/services/boldPayment';
import type { CheckoutFormData } from '@/lib/supabase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style:                 'currency',
    currency:              'COP',
    minimumFractionDigits: 0,
  }).format(n);

const PROPERTY_TYPES = [
  { value: 'Casa',        icon: Home      },
  { value: 'Apartamento', icon: Building2 },
  { value: 'Oficina',     icon: Briefcase },
  { value: 'Bodega',      icon: Warehouse },
  { value: 'Otro',        icon: MapPin    },
] as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Checkout: React.FC = () => {
  const navigate          = useNavigate();
  const { user, profile, isLoading } = useAuth();
  const { items, subtotal } = useCart();

  // ── Refs ───────────────────────────────────────────────────────
  const citySelectRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<{ orderId: string; boldOrderId: string } | null>(null);
  const isPreparingRef = useRef(false); // Guard para evitar llamadas concurrentes

  // ── Steps ──────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);

  // ── Estados de pago ────────────────────────────────────────────
  const [isProcessing, setProcessing] = useState(false);
  const [isPreparingBold, setPreparingBold] = useState(false); // cargando SDK + firma
  const [canPay, setCanPay]           = useState(false);       // hash listo
  const [boldHash, setBoldHash]       = useState<string | null>(null);
  const [formError, setFormError]     = useState<string | null>(null);

  // ── Formulario ─────────────────────────────────────────────────
  const [form, setForm] = useState<CheckoutFormData>({
    full_name:       profile?.full_name ?? '',
    document_number: '',
    phone:           '',
    email:           user?.email ?? '',
    department:      '',
    city:            '',
    divipola_code:   '',
    address_line1:   '',
    address_line2:   '',
    property_type:   'Casa',
    notes:           '',
  });

  useEffect(() => {
    if (user?.email     && !form.email)     setForm(f => ({ ...f, email:     user.email! }));
    if (profile?.full_name && !form.full_name) setForm(f => ({ ...f, full_name: profile.full_name }));
  }, [user, profile]);

  // ── Cotización de envío (MiPaquete) ────────────────────────────
  const userProvider = user?.app_metadata?.provider || '';
  const {
    cheapest,
    isLoading: loadingShipping,
    error:     shippingError,
  } = useShippingQuote(form.divipola_code, items, userProvider);

  const shippingCost = cheapest?.price ?? 0;
  const total        = subtotal + shippingCost;

  // ── Redireccionamiento ─────────────────────────────────────────
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/');
        return;
      }
      if (items.length === 0) {
        navigate('/tienda');
      }
    }
  }, [user, items, navigate, isLoading]);

  // Si la sesión está cargando, mostramos un spinner para no expulsar al usuario
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-gray-900 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Cargando tu sesión...</h2>
        <p className="text-gray-500 text-sm mt-2">Estamos preparando todo para tu compra.</p>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // handlePrepararBold — carga SDK + pide firma + crea instancia Bold
  // Se dispara cuando hay orden creada Y cheapest está confirmado.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handlePrepararBold = useCallback(async () => {
    if (step !== 2)        return;
    if (loadingShipping)   return;
    if (!cheapest)         return;
    if (!user)             return;
    if (isPreparingRef.current) return;
    
    try {
      isPreparingRef.current = true;
      setPreparingBold(true);
      setCanPay(false);
      setFormError(null);

      // 1. Pedir firma HMAC con un timeout de seguridad (10s)
      const firmaPromise = pedirFirmaBold(
        orderRef.current.boldOrderId,
        total,
        subtotal,
        shippingCost,
      );

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera agotado al preparar el pago. Reintenta.')), 12000)
      );

      const { integrity_hash } = await Promise.race([firmaPromise, timeoutPromise]) as any;

      // 2. Guardar el hash en estado para renderizar el botón de Bold
      setBoldHash(integrity_hash);
      setCanPay(true);
    } catch (err: any) {
      console.error('[handlePrepararBold] Error:', err);
      setFormError(err?.message ?? 'Error al preparar el pago. Intenta de nuevo.');
      setCanPay(false);
    } finally {
      setPreparingBold(false);
      isPreparingRef.current = false;
    }
  }, [step, loadingShipping, cheapest, user, subtotal, form.email, form.full_name, form.phone, form.document_number]);

  // Cuando MiPaquete confirma el precio (y ya estamos en paso 2), preparamos Bold
  useEffect(() => {
    if (step === 2 && !loadingShipping && cheapest && orderRef.current) {
      handlePrepararBold();
    }
  }, [cheapest?.price, loadingShipping, step]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // handleStep1Submit — valida datos y crea la orden en Supabase
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const validateStep1 = (): string | null => {
    if (!form.full_name.trim())       return 'Nombre completo requerido';
    if (!form.document_number.trim()) return 'Número de documento requerido';
    if (!form.phone.trim())           return 'Teléfono requerido';
    if (!form.email.trim())           return 'Email requerido';
    if (!form.department)             return 'Selecciona un departamento';
    if (!form.divipola_code)          return 'Selecciona una ciudad';
    if (!form.address_line1.trim())   return 'Dirección requerida';
    return null;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setFormError(err); return; }

    if (!cheapest) {
      setFormError('Espera a que se calcule el costo de envío antes de continuar.');
      return;
    }
    if (!user) { setFormError('Debes iniciar sesión'); return; }

    setProcessing(true);
    setFormError(null);

    try {
      const orderItems: CartItemForOrder[] = items.map(item => ({
        product_id:    item.product_id,
        product_name:  item.product?.name      ?? 'Producto',
        product_sku:   item.product?.sku       ?? '',
        product_image: item.product?.image_url ?? '',
        unit_price:    item.unit_price,
        quantity:      item.quantity,
      }));

      const result = await crearOrdenEnSupabase({
        userId:       user.id,
        form,
        items:        orderItems,
        subtotal,
        shippingCost: cheapest.price,
        total:        subtotal + cheapest.price,
        carrierCode:  cheapest.carrier_code,
        carrierName:  cheapest.carrier,
      });

      orderRef.current = result;

      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // handlePrepararBold se disparará automáticamente vía useEffect
    } catch (err: any) {
      console.error('[handleStep1Submit]', err);
      setFormError(err?.message ?? 'Error creando el pedido. Intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // handlePagar — abre el modal Bold (instancia ya preparada)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handlePagar = () => {
    if (!canPay) {
      setFormError(
        isPreparingBold
          ? 'Espera a que se prepare el pago...'
          : 'El pago no está listo. Intenta de nuevo en unos segundos.'
      );
      return;
    }

    try {
      abrirCheckoutBold(); // llama checkout.open() de la instancia Bold
    } catch (err: any) {
      console.error('[handlePagar] Error abriendo Bold:', err);
      setFormError(err?.message ?? 'No se pudo abrir la pasarela de pago. Intenta de nuevo.');
    }
  };

  // ── Handlers formulario ────────────────────────────────────────
  const set = (field: keyof CheckoutFormData, val: string) =>
    setForm(f => ({ ...f, [field]: val }));

  const handleDepartmentChange = (depCode: string) => {
    const dep = DEPARTAMENTOS.find(d => d.code === depCode);
    setForm(f => ({
      ...f,
      department:    dep?.name ?? '',
      city:          '',
      divipola_code: '',
    }));

    // Scroll suave hacia el selector de ciudad (clave en móviles)
    if (depCode) {
      setTimeout(() => {
        citySelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleCityChange = (divipola: string) => {
    const dep = DEPARTAMENTOS.find(d => d.municipios.some(m => m.code === divipola));
    const mun = dep?.municipios.find(m => m.code === divipola);
    setForm(f => ({
      ...f,
      city:          mun?.name ?? '',
      divipola_code: divipola,
    }));
  };

  const selectedDep = DEPARTAMENTOS.find(d => d.name === form.department);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f7f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ─── Overlay de carga global ──────────────────────────────
          position:fixed — flota sobre toda la página, nunca dentro
          de un nodo que Bold pueda mutar.                           */}
      {(isProcessing || isPreparingBold) && (
        <div
          style={{
            position:       'fixed',
            inset:          0,
            background:     'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(4px)',
            zIndex:         9999,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '12px',
          }}
        >
          <Loader2 size={36} className="animate-spin text-gray-900" />
          <p className="text-sm font-semibold text-gray-700">
            {isProcessing && <span key="processing">Creando tu pedido...</span>}
            {isPreparingBold && <span key="preparing">Preparando el pago...</span>}
          </p>
        </div>
      )}

      {/* ─── Header ───────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => step === 2 ? setStep(1) : navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            {step === 2 ? 'Editar datos' : 'Volver'}
          </button>

          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-gray-900" />
            <span className="font-black text-gray-900 text-lg tracking-tight">Evolet 96</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`px-3 py-1 rounded-full transition-all ${step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
              1. Envío
            </span>
            <div className="w-4 h-px bg-gray-300" />
            <span className={`px-3 py-1 rounded-full transition-all ${step >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
              2. Pago
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

          {/* ─── Columna izquierda ──────────────────────────────── */}
          <div>
            <AnimatePresence mode="wait">

              {/* ── PASO 1: Formulario de envío ───────────────────── */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  onSubmit={handleStep1Submit}
                >
                  <SectionCard title="Datos personales" icon={<User size={16} />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Nombre completo *"
                        value={form.full_name}
                        onChange={v => set('full_name', v)}
                        placeholder="María García"
                        autoComplete="name"
                      />
                      <Field
                        label="CC / NIT *"
                        value={form.document_number}
                        onChange={v => set('document_number', v)}
                        placeholder="1234567890"
                        inputMode="numeric"
                      />
                      <Field
                        label="Teléfono / WhatsApp *"
                        value={form.phone}
                        onChange={v => set('phone', v)}
                        placeholder="3001234567"
                        type="tel"
                        autoComplete="tel"
                      />
                      <Field
                        label="Correo electrónico *"
                        value={form.email}
                        onChange={v => set('email', v)}
                        placeholder="tu@email.com"
                        type="email"
                        autoComplete="email"
                      />
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Dirección de envío"
                    icon={<MapPin size={16} />}
                    className="mt-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Departamento */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Departamento *
                        </label>
                        <div className="relative">
                          <select
                            value={DEPARTAMENTOS.find(d => d.name === form.department)?.code ?? ''}
                            onChange={e => handleDepartmentChange(e.target.value)}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-base sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          >
                            <option value="">Selecciona departamento</option>
                            {DEPARTAMENTOS.map(d => (
                              <option key={d.code} value={d.code}>{d.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Ciudad */}
                      <div ref={citySelectRef} className="scroll-mt-32">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Ciudad / Municipio *
                        </label>
                        <div className="relative">
                          <select
                            value={form.divipola_code}
                            onChange={e => handleCityChange(e.target.value)}
                            disabled={!selectedDep}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-base sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {selectedDep ? 'Selecciona ciudad' : 'Primero elige departamento'}
                            </option>
                            {selectedDep?.municipios.map(m => (
                              <option key={m.code} value={m.code}>{m.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Aviso WhatsApp */}
                      <div className="col-span-full mt-1">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3 group hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <MessageCircle size={16} className="text-green-600" />
                            </div>
                            <p className="text-[11px] leading-tight text-gray-600 font-medium">
                              ¿No encuentras tu ciudad o municipio?<br/>
                              <span className="text-gray-400 font-normal">Contáctanos para gestionar tu envío manualmente.</span>
                            </p>
                          </div>
                          <a 
                            href="https://wa.me/573134620799?text=Hola,%20no%20encuentro%20mi%20ciudad%20en%20el%20checkout"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whitespace-nowrap px-4 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Tipo de inmueble */}
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Tipo de inmueble *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PROPERTY_TYPES.map(({ value, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => set('property_type', value)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                              form.property_type === value
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <Icon size={14} />
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <Field
                        label="Dirección *"
                        value={form.address_line1}
                        onChange={v => set('address_line1', v)}
                        placeholder="Calle 45 # 20-30"
                        className="sm:col-span-2"
                      />
                      <Field
                        label="Apartamento / Piso / Bloque"
                        value={form.address_line2}
                        onChange={v => set('address_line2', v)}
                        placeholder="Apto 301, Torre B"
                        className="sm:col-span-2"
                      />
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Notas adicionales"
                    icon={<FileText size={16} />}
                    className="mt-4"
                  >
                    <textarea
                      value={form.notes}
                      onChange={e => set('notes', e.target.value)}
                      placeholder="Instrucciones especiales para el mensajero..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                  </SectionCard>

                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm font-medium px-4 py-3 rounded-xl"
                    >
                      <AlertCircle size={15} />
                      {formError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing || loadingShipping || !cheapest}
                    className="mt-6 w-full bg-gray-900 text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing && <span key="processing">Creando pedido...</span>}
                    {!isProcessing && loadingShipping && <span key="loading">Calculando envío...</span>}
                    {!isProcessing && !loadingShipping && <span key="continue">Continuar al pago &rarr;</span>}
                  </button>
                </motion.form>
              )}

              {/* ── PASO 2: Resumen y pago ────────────────────────── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                >
                  {/* Resumen de datos de envío */}
                  <SectionCard title="Datos de envío" icon={<MapPin size={16} />}>
                    <div className="space-y-2 text-sm">
                      <p className="font-bold text-gray-900">{form.full_name}</p>
                      <p className="text-gray-500">{form.email} · {form.phone}</p>
                      <p className="text-gray-700">
                        {form.property_type}: {form.address_line1}
                        {form.address_line2 && `, ${form.address_line2}`}
                      </p>
                      <p className="text-gray-700">{form.city}, {form.department}</p>
                      {form.notes && <p className="italic text-gray-400">"{form.notes}"</p>}
                    </div>
                  </SectionCard>

                  {/* Error paso 2 */}
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm font-medium px-4 py-3 rounded-xl"
                    >
                      <AlertCircle size={15} />
                      {formError}
                    </motion.div>
                  )}

                  {/* Cotización de envío */}
                  <SectionCard title="Envío" icon={<Truck size={16} />} className="mt-4">
                    <div className="min-h-[44px] flex flex-col justify-center relative w-full overflow-hidden">
                      {loadingShipping ? (
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Loader2 size={16} className="animate-spin" />
                          Cotizando con MiPaquete...
                        </div>
                      ) : shippingError ? (
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                          <AlertCircle size={15} />
                          <span>{shippingError}</span>
                          <span className="text-gray-400 text-xs ml-auto">Tarifa estándar</span>
                        </div>
                      ) : cheapest ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{cheapest.carrier}</p>
                            <p className="text-xs text-gray-500">
                              {cheapest.service_type} · {cheapest.estimated_days} días hábiles
                            </p>
                          </div>
                          <p className="font-black text-gray-900">{COP(cheapest.price)}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Sin cotización disponible</p>
                      )}
                    </div>
                  </SectionCard>

                  {/* Badge de seguridad */}
                  <div className="mt-4 flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                    <Shield size={16} className="text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-700 font-medium">
                      Tu pago está protegido con cifrado SSL y procesado por Bold —
                      la pasarela de pagos más segura de Colombia.
                    </p>
                  </div>

                  {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      BOTÓN DE PAGO — integración manual script Bold.
                      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                  <div className="mt-6">
                    {isPreparingBold || (!canPay && !formError) ? (
                      /* Estado de espera mientras se prepara Bold */
                      <div className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-500 font-semibold text-sm py-5 rounded-2xl">
                        <Loader2 size={18} className="animate-spin" />
                        {isPreparingBold ? 'Preparando el pago...' : 'Cargando pasarela de pago...'}
                      </div>
                    ) : canPay && boldHash && orderRef.current ? (
                      /* Botón oficial de Bold inyectado vía Script */
                      <BoldScriptButton
                        apiKey={import.meta.env.VITE_BOLD_API_KEY as string}
                        orderId={orderRef.current.boldOrderId}
                        currency="COP"
                        amount={Math.round(total)}
                        integritySignature={boldHash}
                        redirectionUrl={`${window.location.origin}/checkout/exitoso?order=${orderRef.current.orderId}`}
                      />
                    ) : null}

                    {canPay && (
                      <p className="text-center text-xs text-gray-400 mt-3">
                        Al pagar aceptas nuestros términos y condiciones
                      </p>
                    )}
                  </div>

                  {/* Botón de reintentar si hubo error preparando Bold */}
                  {formError && !isPreparingBold && (
                    <button
                      type="button"
                      onClick={handlePrepararBold}
                      className="mt-3 w-full border-2 border-gray-200 text-gray-600 font-semibold text-sm py-3 rounded-2xl hover:border-gray-400 transition-colors"
                    >
                      Reintentar preparar el pago
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Columna derecha: Resumen del pedido ──────────────── */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-5 flex items-center gap-2">
                <ShoppingBag size={15} />
                Tu pedido
              </h2>

              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product?.image_url || '/placeholder.svg'}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-400">Cant: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {COP(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{COP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Envío</span>
                  <span className="font-semibold text-gray-900 min-h-[20px] flex items-center justify-end">
                    {loadingShipping ? (
                      <span key="load" className="flex items-center gap-1 text-gray-400">
                        <Loader2 size={12} className="animate-spin" /> Calculando
                      </span>
                    ) : shippingCost > 0 ? (
                      <span key="cost">{COP(shippingCost)}</span>
                    ) : (
                      <span key="none" className="text-gray-400">—</span>
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-black text-gray-900">Total</span>
                    <span className="font-black text-gray-900 text-lg">{COP(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                  Envío rastreable con MiPaquete
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={13} className="text-blue-500 shrink-0" />
                  Pago seguro con Bold
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SectionCardProps {
  title:      string;
  icon?:      React.ReactNode;
  children:   React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

interface FieldProps {
  label:        string;
  value:        string;
  onChange:     (v: string) => void;
  placeholder?: string;
  type?:        string;
  autoComplete?: string;
  inputMode?:   React.HTMLAttributes<HTMLInputElement>['inputMode'];
  className?:   string;
}

const Field: React.FC<FieldProps> = ({
  label, value, onChange, placeholder, type = 'text', autoComplete, inputMode, className = '',
}) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
    />
  </div>
);

export default Checkout;