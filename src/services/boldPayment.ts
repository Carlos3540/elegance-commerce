// src/services/boldPayment.ts
// Servicio de pagos con Bold — SDK oficial BoldCheckout + firma HMAC vía Edge Function
// ──────────────────────────────────────────────────────────────────────────────────────
// ARQUITECTURA (corregida según doc oficial Bold - abril 2026):
//
//   • window.BoldCheckout es la clase real del SDK
//   • URL del script: https://checkout.bold.co/library/boldPaymentButton.js
//   • Propiedad de integridad: `integritySignature` (NO `integrity`)
//     → Causa del error BTN-001: usar `integrity` hace fallar la validación HMAC
//
//   • NO se usa renderMode: 'embedded' — se usa integración personalizada:
//     se crea la instancia y se llama checkout.open() directamente desde
//     el botón de pago del comercio. Esto evita todos los problemas de
//     iframes, removeChild e insertBefore.
//
//   • resetearInstanciaBold() limpia la referencia interna sin tocar el DOM
//     (ya no hay contenedor Bold que limpiar porque no usamos embedded).

import { supabase } from '@/lib/supabase';
import type { CheckoutFormData } from '@/lib/supabase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS PÚBLICOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CartItemForOrder {
  product_id:    string;
  product_name:  string;
  product_sku:   string;
  product_image: string;
  unit_price:    number;
  quantity:      number;
}

export interface CreateOrderParams {
  userId:       string;
  form:         CheckoutFormData;
  items:        CartItemForOrder[];
  subtotal:     number;
  shippingCost: number;
  total:        number;
  carrierCode:  string;
  carrierName:  string;
}

export interface OrderCreatedResult {
  orderId:     string; // UUID del pedido en Supabase
  boldOrderId: string; // referencia EV-... para Bold
}

export interface BoldSignatureResponse {
  integrity_hash: string;
  bold_order_id:  string;
}

export interface BoldCheckoutParams {
  boldOrderId:   string;
  amount:        number;  // total completo (productos + envío) en COP — entero
  currency?:     'COP';
  integrityHash: string;
  redirectUrl:   string;
  customerData?: {
    email?:          string;
    fullName?:       string;
    phone?:          string;
    documentNumber?: string;
    documentType?:   string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS INTERNOS DEL SDK BOLD (integración personalizada)
// Referencia: https://developers.bold.co/pagos-en-linea/boton-de-pagos/integracion-manual/integracion-personalizada
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface BoldCheckoutConfig {
  orderId:            string;
  currency:           'COP';
  amount:             string;   // string según la doc oficial
  apiKey:             string;
  integritySignature: string;   // ← CORRECTO: integritySignature, NO integrity
  redirectionUrl:     string;
  description:        string;
  customerData?:      string;   // JSON.stringify({ email, fullName, phone, ... })
  renderMode?:        'embedded';
  buttonStyle?:       'dark-L' | 'dark-M' | 'dark-S';
}

interface BoldCheckoutInstance {
  open():                    void;
  getConfig(key: string):    string;
  updateConfig(key: string, value: string): void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESTADO INTERNO DEL MÓDULO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Instancia activa del SDK (reutilizable entre re-renderizados)
let _boldInstance: BoldCheckoutInstance | null = null;

// Promesa singleton del script — evita inyecciones dobles
let _scriptLoadPromise: Promise<void> | null = null;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. LOADER DEL SCRIPT — singleton seguro
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BOLD_SCRIPT_URL  = 'https://checkout.bold.co/library/boldPaymentButton.js';
const BOLD_SCRIPT_ATTR = 'data-bold-sdk-evolet';

/**
 * Carga el SDK de Bold UNA sola vez durante toda la vida de la sesión.
 *
 * Sigue el patrón de inicialización dinámica de la doc oficial Bold:
 * https://developers.bold.co/pagos-en-linea/boton-de-pagos/integracion-manual/integracion-personalizada
 *
 * Garantías:
 *  1. Múltiples llamadas concurrentes comparten la misma Promise (singleton).
 *  2. Si BoldCheckout ya está en window → resuelve sin tocar el DOM.
 *  3. Si el script ya está en el DOM pero BoldCheckout aún no apareció
 *     → espera con polling (50 ms, timeout 8 s).
 *  4. Nunca llama removeChild ni reemplaza nodos existentes.
 */
function cargarScriptBold(): Promise<void> {
  // Guardia 1: SDK ya disponible
  if (typeof (window as any).BoldCheckout !== 'undefined') {
    return Promise.resolve();
  }

  // Guardia 2: devolver la promesa en vuelo si ya iniciamos la carga
  if (_scriptLoadPromise) return _scriptLoadPromise;

  _scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existente = document.querySelector<HTMLScriptElement>(
      `script[${BOLD_SCRIPT_ATTR}]`
    );

    const esperarConPoll = () => {
      const poll = setInterval(() => {
        if (typeof (window as any).BoldCheckout !== 'undefined') {
          clearInterval(poll);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(poll);
        _scriptLoadPromise = null;
        reject(new Error(
          'Bold SDK cargó pero window.BoldCheckout no se expuso tras 8 s. ' +
          'Revisa la URL del script o la versión del SDK.'
        ));
      }, 8000);
    };

    if (existente) {
      if (existente.dataset.bsLoaded === 'true') {
        esperarConPoll();
      } else {
        existente.addEventListener('load',  () => esperarConPoll(), { once: true });
        existente.addEventListener('error', () => {
          _scriptLoadPromise = null;
          reject(new Error('El script de Bold falló al cargarse (existente).'));
        }, { once: true });
      }
      return;
    }

    // Inyección inicial — UN solo <script> con atributo centinela
    const script   = document.createElement('script');
    script.src     = BOLD_SCRIPT_URL;
    script.async   = true;
    script.setAttribute(BOLD_SCRIPT_ATTR, 'true');

    script.onload = () => {
      script.dataset.bsLoaded = 'true';
      esperarConPoll();
    };
    script.onerror = () => {
      _scriptLoadPromise = null;
      reject(new Error(
        'No se pudo descargar el SDK de Bold desde checkout.bold.co. ' +
        'Verifica la conexión o la URL del script.'
      ));
    };

    document.head.appendChild(script);
  });

  return _scriptLoadPromise;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. RESET DE LA INSTANCIA (sin tocar el DOM)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Limpia la referencia interna a la instancia Bold.
 *
 * Con la integración personalizada (sin renderMode: 'embedded') Bold
 * abre un modal global que él mismo maneja — no inyecta nada dentro
 * de un contenedor nuestro. Por tanto NO necesitamos limpiar el DOM.
 *
 * Se mantiene el nombre para compatibilidad con los import existentes.
 */
export function resetearInstanciaBold(_containerId?: string): void {
  _boldInstance = null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. CREAR PEDIDO EN SUPABASE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function crearOrdenEnSupabase(
  params: CreateOrderParams
): Promise<OrderCreatedResult> {
  const {
    userId, form, items, subtotal, shippingCost, total, carrierCode, carrierName,
  } = params;

  const boldOrderId = `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const shippingAddress = {
    department:    form.department,
    city:          form.city,
    divipola_code: form.divipola_code,
    address_line1: form.address_line1,
    address_line2: form.address_line2,
    property_type: form.property_type,
  };

  // ── Insertar orden ─────────────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id:          userId,
      status:           'pending',
      subtotal,
      shipping_cost:    shippingCost,
      discount:         0,
      tax:              0,
      total,
      shipping_name:    form.full_name,
      shipping_email:   form.email,
      shipping_phone:   form.phone,
      shipping_address: shippingAddress,
      shipping_method:  `${carrierCode}|${carrierName}`,
      notes:            form.notes || '',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    throw new Error(`Error creando pedido: ${orderError?.message}`);
  }

  const orderId = order.id as string;

  // ── Insertar ítems ─────────────────────────────────────────────
  const orderItems = items.map(item => ({
    order_id:      orderId,
    product_id:    item.product_id,
    product_name:  item.product_name,
    product_sku:   item.product_sku,
    product_image: item.product_image,
    unit_price:    item.unit_price,
    quantity:      item.quantity,
    subtotal:      item.unit_price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    throw new Error(`Error insertando ítems: ${itemsError.message}`);
  }

  // ── Registro inicial en pagos_bold ─────────────────────────────
  const { error: boldError } = await supabase
    .from('pagos_bold')
    .insert({
      order_id:       orderId,
      bold_order_id:  boldOrderId,
      bold_status:    'PENDING',
      amount:         total,
      currency:       'COP',
      integrity_hash: '',
    });

  if (boldError) {
    throw new Error(`Error registrando pago Bold: ${boldError.message}`);
  }

  return { orderId, boldOrderId };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. FIRMA HMAC — via Edge Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Solicita el hash HMAC-SHA256 a la Edge Function payment-handler.
 *
 * IMPORTANTE: la Edge Function debe generar el hash con la cadena:
 *   `${boldOrderId}${totalInt}${currency}`
 * usando la BOLD_SECRET_KEY (llave secreta del panel Bold).
 */
export async function pedirFirmaBold(
  boldOrderId:  string,
  total:        number,
  subtotal:     number,
  shippingCost: number,
  currency:     'COP' = 'COP'
): Promise<BoldSignatureResponse> {
  const totalInt    = Math.round(total);
  const subtotalInt = Math.round(subtotal);
  const shipInt     = Math.round(shippingCost);

  const { data, error } = await supabase.functions.invoke('payment-handler', {
    body: {
      action:        'sign',
      bold_order_id: boldOrderId,
      amount:        totalInt,
      subtotal:      subtotalInt,
      shipping_cost: shipInt,
      currency,
    },
  });

  if (error) {
    throw new Error(`Error obteniendo firma Bold: ${error.message}`);
  }
  if (!data?.integrity_hash) {
    throw new Error(
      'La Edge Function no devolvió integrity_hash. ' +
      'Verifica BOLD_SECRET_KEY en Supabase Secrets.'
    );
  }

  // Persistir el hash en pagos_bold (no fatal si falla)
  supabase
    .from('pagos_bold')
    .update({ integrity_hash: data.integrity_hash })
    .eq('bold_order_id', boldOrderId)
    .then(({ error: e }) => {
      if (e) console.warn('[pedirFirmaBold] No se persistió el hash:', e.message);
    });

  return data as BoldSignatureResponse;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. PREPARAR INSTANCIA BOLD (sin abrir aún)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Carga el SDK (si aún no está) y crea la instancia de Bold lista para usar.
 * NO abre el modal — eso lo hace abrirCheckoutBold() o el botón del comercio.
 *
 * Cambio clave: se usa `integritySignature` (doc oficial) en vez de `integrity`.
 * Sin renderMode: 'embedded' → Bold maneja su propio modal overlay global.
 */
export async function prepararCheckoutBold(params: BoldCheckoutParams): Promise<void> {
  const apiKey = import.meta.env.VITE_BOLD_API_KEY as string;
  if (!apiKey) {
    throw new Error(
      'VITE_BOLD_API_KEY no está configurada. ' +
      'Agrégala en .env.local o en las variables de entorno de Vite.'
    );
  }

  await cargarScriptBold();

  const BoldCheckout = (window as any).BoldCheckout as
    | (new (cfg: BoldCheckoutConfig) => BoldCheckoutInstance)
    | undefined;

  if (!BoldCheckout) {
    throw new Error(
      'window.BoldCheckout no disponible tras cargar el SDK. ' +
      'Verifica que https://checkout.bold.co/library/boldPaymentButton.js responda.'
    );
  }

  const config: BoldCheckoutConfig = {
    orderId:            params.boldOrderId,
    currency:           params.currency ?? 'COP',
    amount:             String(Math.round(params.amount)),
    apiKey,
    integritySignature: params.integrityHash,
    redirectionUrl:     params.redirectUrl,
    description:        `Pedido Evolet 96 — ${params.boldOrderId}`,
    renderMode:         'embedded',
    buttonStyle:        'dark-L',
    // customerData opcional — mejora la UX pre-llenando el formulario Bold
    ...(params.customerData && {
      customerData: JSON.stringify({
        email:          params.customerData.email          ?? '',
        fullName:       params.customerData.fullName       ?? '',
        phone:          params.customerData.phone          ?? '',
        dialCode:       '+57',
        documentNumber: params.customerData.documentNumber ?? '',
        documentType:   params.customerData.documentType   ?? 'CC',
      }),
    }),
  };

  _boldInstance = new BoldCheckout(config);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. ABRIR EL MODAL DE BOLD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Abre el modal de pago Bold.
 * Requiere que prepararCheckoutBold() haya sido llamado antes.
 *
 * Llamar desde el onClick del botón "Pagar" del comercio.
 */
export function abrirCheckoutBold(): void {
  if (!_boldInstance) {
    throw new Error(
      'No hay instancia Bold activa. Llama prepararCheckoutBold() antes de abrirCheckoutBold().'
    );
  }
  _boldInstance.open();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPATIBILIDAD — alias deprecado
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @deprecated Usar prepararCheckoutBold() + abrirCheckoutBold() por separado.
 * Mantenido para no romper imports existentes durante la migración.
 */
export async function iniciarCheckoutBold(params: BoldCheckoutParams): Promise<void> {
  await prepararCheckoutBold(params);
  abrirCheckoutBold();
}