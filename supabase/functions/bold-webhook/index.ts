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
  console.log(`[bold-webhook] ⚡ NUEVA INVOCACIÓN - Method: ${req.method}, URL: ${req.url}`);
  console.log(`[bold-webhook] Headers recibidos:`, Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log('[bold-webhook] Respondiendo a preflight OPTIONS');
    return new Response('ok', { headers: CORS });
  }

  try {
    // ── 1. Leer cuerpo crudo (Raw Buffer) y verificar firma de Bold ───────────
    // IMPORTANTE: En lugar de req.text(), leemos el arrayBuffer() directo.
    // Esto garantiza que los bytes originales (tildes, espacios, saltos de línea)
    // no sean alterados o parseados incorrectamente por el motor UTF-8.
    const arrayBuffer = await req.arrayBuffer();
    
    // Log del cuerpo (solo para debug, convirtiéndolo a texto de forma segura)
    const decoder = new TextDecoder('utf-8');
    const rawBodyText = decoder.decode(arrayBuffer);
    console.log("Cuerpo recibido:", rawBodyText);

    const boldSig    = req.headers.get('x-bold-signature') ?? '';
    const secretKey  = Deno.env.get('BOLD_SECRET_KEY') ?? '';

    // Verificación HMAC-SHA256 del webhook usando los bytes crudos
    const isValid = await verifyBoldSignature(arrayBuffer, boldSig, secretKey);
    if (!isValid) {
      console.error('[bold-webhook] Firma inválida — posible solicitud no autorizada');
      return new Response('Unauthorized', { status: 401 });
    }

    const event = JSON.parse(rawBodyText);
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

    // Extraer metadata del pago
    const boldOrderId = event?.data?.orderId ?? event?.data?.order_id ?? '';
    const amount      = Number(event?.data?.amount ?? 0);
    
    // ── Conectar a Supabase ───────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Intentar obtener el orderId directamente del metadata
    let supaOrderId = event?.data?.metadata?.orderId ?? event?.data?.metadata?.order_id ?? '';

    // Fallback: Si no vino orderId en metadata, pero sí vino reference (ej: EV-1779909128894-INQTU)
    // Buscamos el order_id real en nuestra tabla pagos_bold
    if (!supaOrderId && event?.data?.metadata?.reference) {
      console.log(`[bold-webhook] Buscando orden con referencia: ${event.data.metadata.reference}`);
      const { data: pagoBold } = await supabase
        .from('pagos_bold')
        .select('order_id')
        .eq('bold_order_id', event.data.metadata.reference)
        .single();
      
      if (pagoBold?.order_id) {
        supaOrderId = pagoBold.order_id;
        console.log(`[bold-webhook] Orden encontrada en DB: ${supaOrderId}`);
      }
    }

    if (!supaOrderId) {
      console.error('[bold-webhook] No se encontró orderId en metadata del evento ni en BD');
      return new Response('ok', { status: 200 });
    }

    if (isRejected) {
      console.log(`[bold-webhook] ❌ Pago rechazado para orden ${supaOrderId}`);

      // 1. Marcar la orden como fallida (Realtime emite UPDATE → frontend muestra toast)
      await supabase
        .from('orders')
        .update({ status: 'failed', bold_order_id: boldOrderId })
        .eq('id', supaOrderId);

      // 2. Actualizar pagos_bold para que CheckoutSuccess detecte el rechazo
      await supabase
        .from('pagos_bold')
        .update({
          bold_status:        event?.data?.status || 'REJECTED',
          bold_transaction_id: event?.data?.id    ?? null,
          webhook_payload:    event,
        })
        .eq('order_id', supaOrderId);

      console.log('[bold-webhook] ✅ Orden y pagos_bold marcados como fallidos');
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
    // Esto dispara el evento Realtime que el hook useOrderStatusListener
    // escucha en el frontend → muestra toast "✅ Pago exitoso" + redirige.
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
      console.log('[bold-webhook] ✅ Orden actualizada a "paid":', supaOrderId);
    }

    // ── 6b. Actualizar pagos_bold a APPROVED ─────────────────────────────────
    // CheckoutSuccess.tsx escucha pagos_bold via Realtime para detectar aprobación.
    // Sin este UPDATE la página queda atascada en estado "pendiente".
    const { error: boldUpdateErr } = await supabase
      .from('pagos_bold')
      .update({
        bold_status:         'APPROVED',
        bold_transaction_id: event?.data?.id ?? boldOrderId,
        paid_at:             new Date().toISOString(),
        webhook_payload:     event,
      })
      .eq('order_id', supaOrderId);

    if (boldUpdateErr) {
      console.error('[bold-webhook] Error actualizando pagos_bold:', boldUpdateErr);
    } else {
      console.log('[bold-webhook] ✅ pagos_bold actualizado a APPROVED');
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

// ── Utilidad Base64 para Raw Buffers ──────────────────────────────────────────
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binString = "";
  // chunkSize previene el error "Maximum call stack size exceeded" 
  // en strings/arrays muy grandes si se usa String.fromCharCode.apply
  for (let i = 0; i < bytes.byteLength; i++) { 
    binString += String.fromCharCode(bytes[i]); 
  }
  return btoa(binString);
}

// ── Verificación de firma (Híbrida: Prod & Sandbox) ────────────────────────────
async function verifyBoldSignature(
  rawBuffer: ArrayBuffer,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!signature) return false;

  try {
    const encoder = new TextEncoder();
    
    // 1. Convertir el buffer BINARIO directamente a Base64 sin pasar por parseo de strings
    const bodyBase64 = bufferToBase64(rawBuffer);
    
    // 2. Preparar el mensaje que será firmado (los bytes de la cadena Base64)
    const msgData = encoder.encode(bodyBase64);

    const checkSignature = async (keyToUse: string) => {
      const keyData  = encoder.encode(keyToUse);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );

      const sigBytes = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
      
      // Formato Hexadecimal exigido por Bold
      const computed = Array.from(new Uint8Array(sigBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Comparación ignorando case y eliminando el prefijo si existiera
      return computed.toLowerCase() === signature.replace(/^sha256=/, '').toLowerCase();
    };

    // 1. Intentar primero con la clave de producción
    let isValid = await checkSignature(secret);

    // 2. Si falla, reintentar con clave vacía "" (Modo Sandbox/Pruebas de Bold)
    if (!isValid) {
      console.log('[bold-webhook] Firma falló con clave principal, reintentando con fallback Sandbox ("")');
      isValid = await checkSignature("");
    }

    return isValid;
  } catch (err) {
    console.error('[bold-webhook] Error al verificar firma:', err);
    return false;
  }
}