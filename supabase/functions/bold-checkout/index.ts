// @ts-nocheck
// supabase/functions/bold-checkout/index.ts
// Edge Function Deno — Genera el hash HMAC-SHA256 que Bold requiere para validar la transacción
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { orderId, amount, currency = 'COP' } = await req.json();

    if (!orderId || !amount) {
      return response({ error: 'orderId y amount son requeridos' });
    }

    const secretKey = Deno.env.get('BOLD_SECRET_KEY');
    if (!secretKey) throw new Error('BOLD_SECRET_KEY no configurada en Supabase Secrets');

    // Bold calcula el hash con: orderId + amount + currency + secretKey
    // Formato exacto según documentación Bold Colombia
    const rawString = `${orderId}${amount}${currency}${secretKey}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const msgData = encoder.encode(rawString);

    // Importar la clave para HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);

    // Convertir ArrayBuffer → hex string
    const hashArray  = Array.from(new Uint8Array(signature));
    const hashHex    = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const integrityHash = `${hashHex}`;

    console.log(`[bold-checkout] Hash generado para orden ${orderId} | monto ${amount} ${currency}`);

    return response({ integrity_hash: integrityHash, order_id: orderId });

  } catch (err: any) {
    console.error('[bold-checkout] Error:', err?.message);
    return response({ error: err?.message ?? 'Error generando el hash de seguridad' });
  }
});

function response(body: unknown) {
  return new Response(JSON.stringify(body), {
    status:  200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}