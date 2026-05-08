// @ts-nocheck
// supabase/functions/payment-handler/index.ts
// Edge Function Deno — Firma HMAC para Bold + Webhook de confirmación de pago
// ──────────────────────────────────────────────────────────────────────────────
// SEGURIDAD:
//   • BOLD_SECRET_KEY nunca se expone al cliente.
//   • La firma HMAC incluye el total COMPLETO (subtotal + envío).
//   • El servidor valida matemáticamente: subtotal + shippingCost === amount.
//   • El webhook Bold se verifica con HMAC-SHA256 (x-bold-signature).
//   • La guía MiPaquete solo se genera cuando el estado es estrictamente APPROVED.

import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── CORS ──────────────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-bold-signature',
};

function corsResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ── Supabase admin ─────────────────────────────────────────────────────────────
function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HMAC-SHA256 — firma de integridad Bold
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Genera el hash de integridad requerido por Bold.
 * Formato del mensaje (documentación Bold Colombia):
 *   `{orderId}{amount}{currency}{secretKey}`
 *
 * `amount` debe ser el total COMPLETO en COP como entero.
 */
async function generarFirmaBold(
  orderId:  string,
  amount:   number,
  currency: string,
  secret:   string
): Promise<string> {
  const amountInt = Math.round(amount);
  const message   = `${orderId}${amountInt}${currency}${secret}`;

  const encoder   = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  const hashHex   = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Loguear solo los primeros 8 chars — nunca el hash completo en logs
  console.log(
    `[sign] orderId=${orderId} | amount=${amountInt} ${currency} | ` +
    `hash=${hashHex.slice(0, 8)}...`
  );

  return hashHex;
}

// ── Comparación de strings en tiempo constante (anti timing-attack) ────────────
function tiempoConstanteIgual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACCIÓN: sign — Generar firma HMAC para el checkout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleSign(body: Record<string, any>) {
  const {
    bold_order_id,
    amount,       // total completo (subtotal + shippingCost)
    subtotal,     // productos sin envío
    shipping_cost,
    currency = 'COP',
  } = body;

  // ── Validaciones de entrada ────────────────────────────────────
  if (!bold_order_id) {
    return corsResponse({ error: 'bold_order_id es requerido' }, 400);
  }
  if (amount === undefined || amount === null) {
    return corsResponse({ error: 'amount (total completo) es requerido' }, 400);
  }
  if (currency !== 'COP') {
    return corsResponse({ error: 'La moneda debe ser COP' }, 400);
  }

  const amountInt   = Math.round(Number(amount));
  const subtotalInt = Math.round(Number(subtotal  ?? 0));
  const shipInt     = Math.round(Number(shipping_cost ?? 0));

  if (amountInt <= 0) {
    return corsResponse({ error: 'El monto a cobrar no puede ser cero o negativo' }, 400);
  }

  // ── Validación matemática anti-fraude ─────────────────────────
  // Si el cliente envía subtotal y shipping_cost, verificamos que sumen
  // correctamente. Un margen de 1 COP cubre redondeos.
  if (subtotalInt > 0 && shipInt >= 0) {
    const expectedTotal = subtotalInt + shipInt;
    if (Math.abs(expectedTotal - amountInt) > 1) {
      console.error(
        `[sign] Validación matemática FALLÓ: ` +
        `subtotal(${subtotalInt}) + envío(${shipInt}) = ${expectedTotal} ≠ amount(${amountInt})`
      );
      return corsResponse(
        { error: `Total no coincide: ${subtotalInt} + ${shipInt} ≠ ${amountInt}` },
        400
      );
    }
  }

  const secret = Deno.env.get('BOLD_SECRET_KEY');
  if (!secret) {
    console.error('[sign] BOLD_SECRET_KEY no configurada en Supabase Secrets');
    return corsResponse({ error: 'Configuración de pago incompleta en el servidor' }, 500);
  }

  console.log(
    `[sign] boldOrderId=${bold_order_id} | ` +
    `subtotal=${subtotalInt} + envío=${shipInt} = total=${amountInt} ${currency}`
  );

  const integrity_hash = await generarFirmaBold(bold_order_id, amountInt, currency, secret);

  return corsResponse({
    integrity_hash,
    bold_order_id,
    amount:   amountInt,
    currency,
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACCIÓN: webhook — Procesar resultado de pago enviado por Bold
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleWebhook(rawBody: string, headers: Headers) {
  const boldSig = headers.get('x-bold-signature') ?? '';
  const secret  = Deno.env.get('BOLD_SECRET_KEY');

  // ── Verificación de firma del webhook ──────────────────────────
  if (boldSig && secret) {
    const encoder   = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig    = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(rawBody));
    const sigHex = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (!tiempoConstanteIgual(sigHex, boldSig)) {
      console.error('[webhook] Firma Bold inválida — request rechazado');
      return corsResponse({ error: 'Firma de webhook inválida' }, 401);
    }
  } else if (boldSig && !secret) {
    console.warn('[webhook] No se puede verificar la firma: BOLD_SECRET_KEY ausente');
  }

  let payload: Record<string, any>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return corsResponse({ error: 'Payload JSON inválido' }, 400);
  }

  console.log('[webhook] Payload recibido:', JSON.stringify(payload));

  const boldOrderId = (
    payload?.order_id
    ?? payload?.orderId
    ?? payload?.reference
    ?? payload?.metadata?.orderId
    ?? null
  ) as string | null;

  const boldStatus = String(
    payload?.payment?.status
    ?? payload?.status
    ?? payload?.transaction_status
    ?? 'UNKNOWN'
  ).toUpperCase();

  const boldTransactionId = (
    payload?.payment?.id
    ?? payload?.transaction_id
    ?? payload?.id
    ?? null
  ) as string | null;

  if (!boldOrderId) {
    console.error('[webhook] bold_order_id no encontrado en el payload');
    // Respondemos 200 para que Bold no reintente indefinidamente
    return corsResponse({ received: true, warning: 'order_id no encontrado' });
  }

  const supabase = getSupabaseAdmin();

  // ── Actualizar pagos_bold ──────────────────────────────────────
  const { data: pagoBold, error: boldErr } = await supabase
    .from('pagos_bold')
    .update({
      bold_status:         boldStatus,
      bold_transaction_id: boldTransactionId,
      webhook_payload:     payload,
      paid_at:             boldStatus === 'APPROVED' ? new Date().toISOString() : null,
    })
    .eq('bold_order_id', boldOrderId)
    .select('order_id, amount, currency')
    .single();

  if (boldErr || !pagoBold) {
    console.error('[webhook] Error actualizando pagos_bold:', boldErr);
    return corsResponse({ received: true, error: boldErr?.message }, 200);
  }

  const orderId = pagoBold.order_id as string;

  // ── Solo APPROVED dispara la confirmación y la guía ────────────
  if (boldStatus === 'APPROVED') {
    // 1. Confirmar pedido
    await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', orderId);

    // 2. Registrar pago
    const userId = await getUserIdFromOrder(supabase, orderId);
    await supabase
      .from('payments')
      .insert({
        order_id:      orderId,
        user_id:       userId,
        provider:      'bold',
        provider_ref:  boldTransactionId,
        provider_data: payload,
        status:        'paid',
        amount:        pagoBold.amount,
        currency:      pagoBold.currency ?? 'COP',
        paid_at:       new Date().toISOString(),
      });

    // 3. Disparar creación de guía MiPaquete
    await dispararCreacionGuia(supabase, orderId);

    console.log(`✅ Pedido ${orderId} APPROVED. Guía en proceso.`);

  } else if (['DECLINED', 'ERROR', 'VOIDED'].includes(boldStatus)) {
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    console.log(`❌ Pedido ${orderId} cancelado — estado Bold: ${boldStatus}`);
  }
  // Cualquier otro estado (PENDING, etc.) → no tocar la orden

  return corsResponse({ received: true, status: boldStatus, order_id: orderId });
}

// ── Obtener user_id de la orden ───────────────────────────────────────────────
async function getUserIdFromOrder(supabase: any, orderId: string): Promise<string> {
  const { data } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', orderId)
    .single();
  return data?.user_id ?? '';
}

// ── Disparar creación de guía MiPaquete ───────────────────────────────────────
async function dispararCreacionGuia(supabase: any, orderId: string): Promise<void> {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select(
        'shipping_name, shipping_phone, shipping_email, ' +
        'shipping_address, shipping_method, total, ' +
        'order_items(quantity)'
      )
      .eq('id', orderId)
      .single();

    if (!order) {
      console.error(`[dispararCreacionGuia] Orden ${orderId} no encontrada`);
      return;
    }

    const totalQty = (order.order_items ?? []).reduce(
      (s: number, i: any) => s + (i.quantity ?? 1),
      0
    );

    // shipping_method se guardó como "CARRIER_CODE|Carrier Name"
    const [carrierCode] = (order.shipping_method ?? '').split('|');

    // Intentar obtener el carrier de logistica_envios (cotización previa)
    const { data: logistic } = await supabase
      .from('logistica_envios')
      .select('carrier')
      .eq('order_id', orderId)
      .eq('status', 'cotizada')
      .maybeSingle();

    const addr = order.shipping_address ?? {};

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

    const res = await fetch(`${supabaseUrl}/functions/v1/shipping-manager`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'apikey':         Deno.env.get('SUPABASE_ANON_KEY')!,
      },
      body: JSON.stringify({
        action:            'create-guide',
        order_id:          orderId,
        carrier_code:      logistic?.carrier ?? carrierCode ?? '',
        recipient_name:    order.shipping_name,
        recipient_phone:   order.shipping_phone,
        recipient_email:   order.shipping_email,
        dest_divipola:     addr.divipola_code    ?? '11001',
        dest_address:      addr.address_line1    ?? '',
        dest_neighborhood: addr.address_line2    ?? '',
        declared_value:    order.total,
        quantity:          totalQty,
        reference:         orderId.slice(0, 8).toUpperCase(),
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(
        `[dispararCreacionGuia] shipping-manager respondió ${res.status}: ${txt}`
      );
    }
  } catch (e) {
    // No relanzamos — un error en guía no debe revertir el pago ya confirmado
    console.error('[dispararCreacionGuia] Error inesperado:', e);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HANDLER PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return corsResponse({ error: 'Content-Type debe ser application/json' }, 415);
    }

    // Leemos el body UNA sola vez como texto para poder tanto
    // parsear el JSON como verificar la firma del webhook.
    const bodyText = await req.text();
    let body: Record<string, any> = {};
    try {
      body = JSON.parse(bodyText);
    } catch {
      return corsResponse({ error: 'JSON inválido en el cuerpo de la petición' }, 400);
    }

    const action = body?.action ?? req.headers.get('x-action') ?? 'webhook';

    switch (action) {
      case 'sign':
        return await handleSign(body);

      case 'webhook':
        return await handleWebhook(bodyText, req.headers);

      default:
        return corsResponse({ error: `Acción desconocida: ${action}` }, 400);
    }

  } catch (err: any) {
    console.error('[payment-handler] Error no capturado:', err?.message ?? err);
    return corsResponse({ error: err?.message ?? 'Error interno del servidor' }, 500);
  }
});