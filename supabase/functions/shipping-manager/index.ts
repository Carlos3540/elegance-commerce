// @ts-nocheck
// supabase/functions/shipping-manager/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// v4 — Corrección del campo de largo del paquete: API V2 de mipaquete.com
//       exige el campo "length" (NO "large") en el payload de /quoteShipping.
//       La v3 identificó el problema en el comentario pero nunca aplicó el fix
//       en el objeto sharedPayload — este parche lo corrige definitivamente.
// ─────────────────────────────────────────────────────────────────────────────
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── CORS ──────────────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
function corsResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ── Configuración origen Evolet 96 ────────────────────────────────────────────
const ORIGIN = {
  divipolaCode: '11001000',
  address:      'Calle 88a # 95h-63',
  neighborhood: 'Boyacá Real',
  name:         'Evolet 96',
  phone:        '3007498007',
  email:        'contactoevolvet.96@gmail.com',
};

// ── Base de Datos Maestra de Empaque ──────────────────────────────────────────
const MASTER_DB = {
  'chaqueta': { l: 40, w: 35, h: 8, wg: 1.2 },
  'hoodie': { l: 35, w: 30, h: 6, wg: 0.8 },
  'pantalon': { l: 35, w: 30, h: 5, wg: 0.8 },
  'camisa': { l: 30, w: 25, h: 2, wg: 0.3 },
  'accesorio': { l: 20, w: 15, h: 1, wg: 0.1 },
  'estandar': { l: 35, w: 30, h: 4, wg: 0.4 }
};

function getDimensions(catName = '') {
  const n = String(catName).toLowerCase();
  if (n.includes('chaqueta')) return MASTER_DB['chaqueta'];
  if (n.includes('hoodie') || n.includes('buzo') || n.includes('sudadera')) return MASTER_DB['hoodie'];
  if (n.includes('pantalon') || n.includes('jean') || n.includes('short')) return MASTER_DB['pantalon'];
  if (n.includes('camisa') || n.includes('camiseta') || n.includes('top')) return MASTER_DB['camisa'];
  if (n.includes('accesorio') || n.includes('pañoleta') || n.includes('gorra') || n.includes('media')) return MASTER_DB['accesorio'];
  return MASTER_DB['estandar'];
}

function consolidarPaquete(items: any[]) {
  if (!items || items.length === 0) return { ...MASTER_DB['estandar'], quantity: 1, declaredValue: 0 };

  let maxL = 0;
  let maxW = 0;
  let sumH = 0;
  let sumWg = 0;
  let sumVal = 0;

  for (const item of items) {
    // Extract name safely from nested product object or fallback
    const pName = item.product?.category?.name || item.product?.name || item.product_category || item.product_name || 'estandar';
    const dim = getDimensions(pName);
    const qty = Number(item.quantity) || 1;
    
    if (dim.l > maxL) maxL = dim.l;
    if (dim.w > maxW) maxW = dim.w;
    
    sumH += (dim.h * qty);
    sumWg += (dim.wg * qty);
    sumVal += (Number(item.unit_price) * qty);
  }

  // Factor de compresión textil del 15%
  let finalH = sumH * 0.85;
  // + 50g del empaque
  let finalWg = sumWg + 0.05;

  return {
    length: Math.ceil(maxL),
    width: Math.ceil(maxW),
    height: Math.ceil(finalH),
    weight: Math.ceil(finalWg),
    declaredValue: sumVal,
    quantity: 1, // Siempre un solo bulto
    isFragile: false
  };
}

const MP_BASE     = 'https://api.mipaquete.com';

// ── Headers ───────────────────────────────────────────────────────────────────
function mpHeaders() {
  const token = Deno.env.get('MIPAQUETE_API_KEY');
  if (!token) throw new Error('MIPAQUETE_API_KEY no configurada en Supabase Secrets');
  const sessionTracker = crypto.randomUUID();
  // ▶ Busca esta línea en Supabase > Edge Functions > Logs para verificar el header
  console.log('[MP] session-tracker generado:', sessionTracker);
  return {
    'Content-Type':    'application/json',
    'apikey':          token,
    'Authorization':   `Bearer ${token}`,
    'session-tracker': sessionTracker,
  };
}

// ── Normalizar DIVIPOLA ───────────────────────────────────────────────────
function normDivipola(code: string): string {
  const s = String(code).trim().replace(/\D/g, '');
  // MiPaquete acepta tanto 5 como 8 dígitos según la ciudad
  // Devolvemos 8 dígitos como primario (formato que acepta la API)
  return s.length >= 8 ? s.slice(0, 8) : s.padEnd(8, '0');
}

// Formato de 5 dígitos (DIVIPOLA DANE estándar)
function normDivipola5(code: string): string {
  const s = String(code).trim().replace(/\D/g, '');
  return s.length >= 5 ? s.slice(0, 5) : s;
}

// ── Estrategia multi-endpoint ─────────────────────────────────────────────────
// La API V2 de mipaquete.com exige el campo "length" (NO "large") en el
// payload de /quoteShipping. Enviar "large" provoca HTTP 404:
// "The service is not valid in API V2 mipaquete.com".
// Referencia: Postman collection oficial (variable uriApiV2).
async function tryAllEndpoints(
  originCode: string,
  destCode: string,
  weight: number,
  height: number,
  width: number,
  length: number,
  quantity: number,
  declaredValue: number,
): Promise<{ rates: any[]; endpointUsed: string }> {

  const sharedPayload = {
    originLocationCode:  originCode,
    destinyLocationCode: destCode,
    weight:        Math.max(1, Math.ceil(weight)),
    height:        Math.max(1, Math.ceil(height)),
    width:         Math.max(1, Math.ceil(width)),
    length:        Math.max(1, Math.ceil(length)),   // ✅ FIX: API V2 requiere "length", no "large"
    quantity:      Math.max(1, quantity),
    declaredValue: Math.max(0, declaredValue),
    saleValue:     0,
  };

  console.log('[MP] Payload enviado:', JSON.stringify(sharedPayload));

  // Extractor universal que maneja todos los formatos conocidos de MiPaquete V2
  function extractRates(json: any): any[] {
    // Caso 1: { data: [...] }
    if (Array.isArray(json?.data) && json.data.length > 0) return json.data;
    // Caso 2: { data: { quotes: [...] } }
    if (Array.isArray(json?.data?.quotes) && json.data.quotes.length > 0) return json.data.quotes;
    // Caso 3: Respuesta directamente como array
    if (Array.isArray(json) && json.length > 0) return json;
    // Caso 4: { quotes: [...] }
    if (Array.isArray(json?.quotes) && json.quotes.length > 0) return json.quotes;
    // Caso 5: { result: [...] } o { results: [...] }
    if (Array.isArray(json?.result) && json.result.length > 0) return json.result;
    if (Array.isArray(json?.results) && json.results.length > 0) return json.results;
    // Caso 6: { data: { data: [...] } } (nested)
    if (Array.isArray(json?.data?.data) && json.data.data.length > 0) return json.data.data;
    return [];
  }

  const endpoints = [
    // 1. V2 - Ruta oficial (api-v2.mipaquete.com/quoteShipping)
    { url: `${MP_BASE}/api/quoteShipping`,           code: destCode },
  ];

  let lastError = 'Sin intentos realizados';

  for (const ep of endpoints) {
    console.log(`[MP] Intentando: ${ep.url} con destino=${ep.code}`);
    try {
      const payload = { ...sharedPayload, destinyLocationCode: ep.code };
      const res  = await fetch(ep.url, { method: 'POST', headers: mpHeaders(), body: JSON.stringify(payload) });
      const text = await res.text();
      let json: any;
      try { json = JSON.parse(text); } catch { json = {}; }

      console.log(`[MP] ${ep.url} (dest=${ep.code}) → HTTP ${res.status}`);
      console.log(`[MP] Respuesta: ${text.slice(0, 600)}`);

      if (res.ok) {
        const opts = extractRates(json);
        if (opts.length > 0) {
          console.log(`[MP] ✅ Éxito: ${ep.url} con dest=${ep.code} | ${opts.length} opciones`);
          return { rates: opts, endpointUsed: `${ep.url}?dest=${ep.code}` };
        }
        lastError = `${ep.url}(dest=${ep.code}): HTTP 200 sin tarifas. Resp: ${text.slice(0, 200)}`;
        console.log(`[MP] HTTP 200 pero sin tarifas. Raw: ${text.slice(0, 400)}`);
      } else {
        const detail = json?.message?.detail ?? json?.detail ?? json?.message ?? text;
        lastError = `${ep.url}: HTTP ${res.status} → ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
      }
    } catch (e: any) {
      lastError = `${ep.url}: Error de red → ${e.message}`;
      console.error(`[MP] Error de red:`, e.message);
    }
  }

  throw new Error(`Todos los endpoints fallaron. Último: ${lastError}`);
}

// ── Normalizar opciones de envío ──────────────────────────────────────────────
// Maneja TODOS los formatos de campo conocidos de MiPaquete V1 y V2
function normalizeRates(raw: any[]) {
  console.log('[MP] normalizeRates input[0]:', JSON.stringify(raw[0]));

  const normalized = raw.map((item: any) => {
    // Carrier name: varios formatos posibles
    const carrier =
      item.deliveryCompanyName ??
      item.operator?.name ??
      item.carrier?.name  ??
      'Transportadora';

    // Servicio
    const service_type =
      item.service?.name    ??
      item.serviceType?.name ??
      item.serviceType      ??
      item.serviceName      ??
      item.type             ??
      'Estándar';

    // Precio: buscar en TODOS los campos posibles
    // FIX CRÍTICO: Usar shippingCost que es lo que viene en tu log
    const rawPrice =
      item.shippingCost   ??
      item.rate           ??
      item.total_price    ??
      item.totalPrice     ??
      item.price          ??
      item.freight        ??
      item.freightValue   ??
      item.value          ??
      item.totalFreight   ??
      item.baseRate       ??
      0;
    const price = Number(rawPrice);

    // Días estimados (convertir shippingTime en minutos a días)
    const estimated_days = item.shippingTime 
      ? Math.ceil(item.shippingTime / 1440) 
      : Number(
          item.estimatedDays       ??
          item.estimatedDeliveryDays ??
          item.days                ??
          item.delivery_time       ??
          item.deliveryDays        ??
          item.deliveryTime        ??
          3
        );

    // Código de transportadora (para generar guía)
    const carrier_code =
      item.deliveryCompanyId ??
      item.operator?.code ??
      item.carrier?.code  ??
      item.carrierCode    ??
      item.operatorCode   ??
      item.code           ??
      item._id            ??
      '';

    return { carrier, service_type, price, estimated_days, carrier_code };
  });

  // Log para ver qué se normalizó
  console.log('[MP] normalizeRates resultado:', JSON.stringify(normalized.slice(0, 3)));

  return normalized
    .filter((r) => r.price > 0)
    .sort((a, b) => a.price - b.price);
}

// ── Acción: quote ─────────────────────────────────────────────────────────────
async function handleQuote(body: Record<string, any>) {
  console.log('[MP] handleQuote body:', JSON.stringify(body));

  // Acepta CUALQUIER nombre de campo que el frontend pueda enviar
  const rawDest = body.destiny_town
               ?? body.destiny_divipola
               ?? body.destination_divipola
               ?? body.destinationId
               ?? body.dest_divipola
               ?? '';

  if (!rawDest) {
    return corsResponse({ error: 'Falta el código de destino (destiny_town)', rates: [], cheapest: null });
  }

  const destCode    = normDivipola(String(rawDest));
  const items       = Array.isArray(body.items) ? body.items : [];
  const parcel      = consolidarPaquete(items);
  
  // Log si el usuario es de google
  if (body.user_provider === 'google') {
    console.log('[MP] Cotización para Perfil Social (Google User)');
  }

  console.log(`[MP] Cotizando: ${ORIGIN.divipolaCode} → ${destCode} | Bulto: ${parcel.length}x${parcel.width}x${parcel.height}cm, ${parcel.weight}kg | items=${items.length}`);

  let rawRates: any[];
  let endpointUsed: string;

  try {
    ({ rates: rawRates, endpointUsed } =
      await tryAllEndpoints(ORIGIN.divipolaCode, destCode, parcel.weight, parcel.height, parcel.width, parcel.length, parcel.quantity, parcel.declaredValue));
  } catch (err: any) {
    console.error('[MP] ❌ Todos los endpoints fallaron:', err.message);
    // Tarifa de respaldo fija cuando la API no está disponible
    const fallback = { carrier: 'Servicio estándar', service_type: 'Nacional', price: 15000, estimated_days: 5, carrier_code: 'fallback' };
    console.log('[MP] Usando tarifa de respaldo:', JSON.stringify(fallback));
    return corsResponse({ rates: [fallback], cheapest: fallback, _fallback: true, _error: err.message });
  }

  const rates = normalizeRates(rawRates);
  console.log(`[MP] Rates finales (${rates.length}):`, JSON.stringify(rates[0]));

  // _endpointUsed es visible en los logs del frontend: úsalo para hardcodear el
  // endpoint correcto una vez identificado y eliminar el fallback.
  return corsResponse({ rates, cheapest: rates[0] ?? null, _endpointUsed: endpointUsed });
}

// ── Acción: create-guide ──────────────────────────────────────────────────────
async function handleCreateGuide(body: Record<string, any>) {
  console.log('[MP] handleCreateGuide body:', JSON.stringify(body));

  const destRaw = body.dest_divipola ?? body.destiny_divipola ?? body.destinationId ?? '';
  const {
    order_id, carrier_code, recipient_name, recipient_phone,
    recipient_email, dest_address, dest_neighborhood,
    declared_value = 0, quantity = 1, reference,
  } = body;

  if (!order_id || !carrier_code || !destRaw) {
    return corsResponse({ error: 'Faltan campos: order_id, carrier_code, dest_divipola' });
  }

  const destStr = normDivipola(String(destRaw));

  const items = Array.isArray(body.items) ? body.items : [];
  const parcel = consolidarPaquete(items);
  
  if (body.user_provider === 'google') {
    console.log('[MP] Generando guía para Perfil Social (Google User)');
  }

  const guidePayload = {
    origin: {
      name: ORIGIN.name, address: ORIGIN.address,
      neighborhood: ORIGIN.neighborhood, divipolaCode: ORIGIN.divipolaCode,
      phone: ORIGIN.phone, email: ORIGIN.email,
    },
    destination: {
      name: recipient_name, address: dest_address,
      neighborhood: dest_neighborhood ?? '', divipolaCode: destStr,
      phone: recipient_phone, email: recipient_email ?? '',
    },
    parcel: {
      weight:        parcel.weight,
      height:        parcel.height, 
      width:         parcel.width, 
      large:         parcel.length,
      quantity:      parcel.quantity, 
      declaredValue: parcel.declaredValue,
      isFragile:     parcel.isFragile,
      description:   `Pedido Evolet 96 #${reference || order_id} (Consolidado)`,
    },
    carrierCode: carrier_code, reference1: order_id,
    reference2: reference ?? order_id, cashOnDelivery: false,
  };

  const mpRes = await fetch(`${MP_BASE}/api/v2/deliveries`, {
    method: 'POST', headers: mpHeaders(), body: JSON.stringify(guidePayload),
  });

  if (!mpRes.ok) {
    const err = await mpRes.json().catch(() => ({}));
    console.error('[MP] create-guide error:', err);
    return corsResponse({ error: `MiPaquete error ${mpRes.status}`, detail: err });
  }

  const guideData = await mpRes.json();
  const guide     = guideData?.data ?? guideData;

  // Persistir (no bloqueamos si falla)
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  
  // Agregar nota si es google
  const isGoogle = body.user_provider === 'google';
  
  supabase.from('logistica_envios').insert({
    order_id,
    mipaquete_id:  guide?.id            ?? null,
    tracking_id:   guide?.trackingNumber ?? guide?.tracking ?? null,
    carrier:       guide?.carrier?.name  ?? carrier_code,
    service_type:  guide?.service?.name  ?? '',
    guia_pdf_url:  guide?.label?.url     ?? guide?.pdfUrl ?? '',
    shipping_cost: guide?.rate           ?? 0,
    currency:      'COP',
    destination:   { divipola: destStr, address: dest_address, name: recipient_name },
    status:        'generada',
    api_response:  isGoogle ? { ...guide, user_profile: 'Perfil Social' } : guide,
  }).then(({ error }) => { if (error) console.error('[MP] DB error:', error); });

  await supabase.from('orders').update({
    tracking_number: guide?.trackingNumber ?? guide?.tracking ?? null,
    status:          'processing',
    shipped_at:      new Date().toISOString(),
  }).eq('id', order_id);

  return corsResponse({
    success:     true,
    tracking_id: guide?.trackingNumber ?? guide?.tracking,
    pdf_url:     guide?.label?.url     ?? guide?.pdfUrl,
    carrier:     guide?.carrier?.name  ?? carrier_code,
    guide_data:  guide,
  });
}

// ── Handler principal ─────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const body = await req.json() as Record<string, any>;
    switch (body?.action) {
      case 'quote':        return await handleQuote(body);
      case 'create-guide': return await handleCreateGuide(body);
      default: return corsResponse({ error: `Acción desconocida: ${body?.action}` });
    }
  } catch (err: any) {
    console.error('[MP] Error interno:', err?.message);
    return corsResponse({ error: err?.message ?? 'Error interno del servidor' });
  }
});