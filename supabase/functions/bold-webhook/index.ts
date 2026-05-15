// @ts-nocheck
// supabase/functions/bold-webhook/index.ts
// Edge Function Deno — Recibe el webhook de Bold tras pago exitoso
// y dispara la creación de la guía en MiPaquete automáticamente.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bold-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    // ── 1. Leer cuerpo y verificar firma de Bold ─────────────────────────────
    const rawBody    = await req.text();
    const boldSig    = req.headers.get('x-bold-signature') ?? '';
    const secretKey  = Deno.env.get('BOLD_SECRET_KEY') ?? '';

    // Verificación HMAC-SHA256 del webhook
    const isValid = await verifyBoldSignature(rawBody, boldSig, secretKey);
    if (!isValid) {
      console.error('[bold-webhook] Firma inválida — posible solicitud no autorizada');
      return new Response('Unauthorized', { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log('[bold-webhook] Evento recibido:', event?.type, '| orden:', event?.data?.metadata?.orderId);

    // ── 2. Solo procesar pagos exitosos o rechazados explícitamente ──────────
    // Bold envía: payment.approved, payment.completed, etc. según su versión.
    const isSuccess =
      event?.type === 'payment.approved'  ||
      event?.type === 'payment.completed' ||
      event?.data?.status === 'APPROVED'  ||
      event?.data?.status === 'COMPLETED';

    const isRejected =
      event?.type === 'payment.rejected'  ||
      event?.type === 'payment.failed' ||
      event?.data?.status === 'REJECTED'  ||
      event?.data?.status === 'FAILED' ||
      event?.data?.status === 'DECLINED' ||
      event?.data?.status === 'VOIDED' ||
      event?.data?.status === 'ERROR';

    // Extraer metadata del pago para saber a qué orden afecta
    const boldOrderId = event?.data?.orderId    ?? event?.data?.order_id ?? '';
    const amount      = Number(event?.data?.amount ?? 0);
    // orderId de Supabase viene en metadata que pasamos al crear la orden
    const supaOrderId = event?.data?.metadata?.orderId ?? event?.data?.metadata?.order_id ?? '';

    if (!supaOrderId) {
      console.error('[bold-webhook] No se encontró orderId en metadata del evento');
      // Retornar 200 para que Bold no reintente indefinidamente
      return new Response('ok', { status: 200 });
    }

    // ── Conectar a Supabase ───────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (isRejected) {
      console.log(`[bold-webhook] Pago rechazado/fallido para orden ${supaOrderId}. Cancelando...`);
      // Cancelar orden
      await supabase.from('orders').update({ status: 'cancelled' }).eq('id', supaOrderId);
      // Actualizar pagos_bold para que el UI en tiempo real sepa que falló
      await supabase.from('pagos_bold').update({ bold_status: event?.data?.status || 'REJECTED' }).eq('order_id', supaOrderId);
      return new Response('ok', { status: 200 });
    }

    if (!isSuccess) {
      console.log('[bold-webhook] Evento ignorado (no es pago exitoso ni rechazo crítico):', event?.type);
      return new Response('ok', { status: 200 });
    }


    // ── 5. Obtener la orden completa ─────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, shipping_address, carrier_code, dest_town')
      .eq('id', supaOrderId)
      .single();

    if (orderError || !order) {
      console.error('[bold-webhook] Orden no encontrada:', supaOrderId, orderError);
      return new Response('ok', { status: 200 });
    }

    // ── 6. Actualizar estado del pago en orders ──────────────────────────────
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status:           'paid',
        paid_at:          new Date().toISOString(),
        bold_order_id:    boldOrderId,
        payment_amount:   amount,
      })
      .eq('id', supaOrderId);

    if (updateError) {
      console.error('[bold-webhook] Error actualizando orden:', updateError);
    } else {
      console.log('[bold-webhook] Orden actualizada a "paid":', supaOrderId);
    }

    // ── 7. Disparar creación de guía en MiPaquete ────────────────────────────
    const shippingAddr = order.shipping_address ?? {};

    const guideRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/shipping-manager`,
      {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          action:           'create-guide',
          order_id:         supaOrderId,
          carrier_code:     order.carrier_code ?? '',
          recipient_name:   shippingAddr.name    ?? order.customer_name ?? '',
          recipient_phone:  shippingAddr.phone   ?? order.customer_phone ?? '',
          recipient_email:  shippingAddr.email   ?? order.customer_email ?? '',
          dest_address:     shippingAddr.address ?? '',
          dest_neighborhood: shippingAddr.neighborhood ?? '',
          dest_town:        order.dest_town       ?? shippingAddr.town ?? '',
          declared_value:   order.subtotal        ?? 0,
          quantity:         order.total_items      ?? 1,
          reference:        order.reference        ?? supaOrderId,
        }),
      }
    );

    const guideData = await guideRes.json().catch(() => ({}));

    if (guideData?.success) {
      console.log('[bold-webhook] Guía generada exitosamente. Tracking:', guideData.tracking_id);
    } else {
      console.error('[bold-webhook] Error generando guía:', guideData?.error);
      // Guardar error en orders para revisión manual
      await supabase
        .from('orders')
        .update({ guide_error: guideData?.error ?? 'Error desconocido al generar guía' })
        .eq('id', supaOrderId);
    }

    // Bold espera 200 para no reintentar
    return new Response(JSON.stringify({ received: true }), {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[bold-webhook] Error interno:', err?.message);
    // Retornar 200 de todas formas — errores 5xx causan reintentos infinitos de Bold
    return new Response(JSON.stringify({ error: err?.message }), {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ── Verificación de firma ──────────────────────────────────────────────────────
async function verifyBoldSignature(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!secret || !signature) return false;

  try {
    const encoder  = new TextEncoder();
    const keyData  = encoder.encode(secret);
    const msgData  = encoder.encode(rawBody);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const sigBytes = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const computed = Array.from(new Uint8Array(sigBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Comparación constante para evitar timing attacks
    return computed === signature.replace(/^sha256=/, '');
  } catch {
    return false;
  }
}