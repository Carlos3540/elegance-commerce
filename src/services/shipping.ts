// src/services/shipping.ts
import { supabase } from '@/lib/supabase';
import type { ShippingQuoteResponse } from '@/lib/supabase';

/**
 * Cotiza el envío desde Bogotá (Evolet 96) hasta el municipio indicado.
 *
 * @param divipolaCode   - Código DIVIPOLA del municipio (5 u 8 dígitos, ej: "11001" o "11001000")
 * @param items          - Lista de productos en el carrito
 * @param userProvider   - Proveedor de autenticación (ej: 'google')
 */
export async function quotarEnvio(
  divipolaCode: string,
  items: any[] = [],
  userProvider: string = '',
): Promise<ShippingQuoteResponse> {

  const { data, error } = await supabase.functions.invoke('shipping-manager', {
    body: {
      action:        'quote',
      destiny_town:  divipolaCode,
      items:         items,
      user_provider: userProvider,
    },
  });

  if (error) {
    throw new Error(error.message || 'Error al conectar con el servidor de envíos');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as ShippingQuoteResponse;
}