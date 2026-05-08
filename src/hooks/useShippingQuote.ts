// src/hooks/useShippingQuote.ts
// Hook reactivo para cotizar envíos con MiPaquete — versión estable DOM
import { useState, useEffect, useRef, useCallback } from 'react';
import { quotarEnvio } from '@/services/shipping';
import type { ShippingRate } from '@/lib/supabase';

export interface UseShippingQuoteReturn {
  cheapest:  ShippingRate | null;
  rates:     ShippingRate[];
  isLoading: boolean;
  error:     string | null;
  refetch:   () => void;
}

/**
 * Cotiza automáticamente cuando cambia el código de municipio o la cantidad.
 *
 * Corrección DOM: los cambios de estado (isLoading → false) se aplican
 * en un solo setState batched para evitar el error React removeChild.
 *
 * @param destinyTownId  - ID interno de MiPaquete del municipio destino, o '' para no cotizar
 * @param items          - Lista de productos en el carrito
 * @param userProvider   - Proveedor de autenticación (ej: 'google')
 */
export function useShippingQuote(
  destinyTownId: string,
  items: any[] = [],
  userProvider: string = '',
): UseShippingQuoteReturn {
  const [state, setState] = useState<{
    cheapest:  ShippingRate | null;
    rates:     ShippingRate[];
    isLoading: boolean;
    error:     string | null;
  }>({
    cheapest:  null,
    rates:     [],
    isLoading: false,
    error:     null,
  });

  // Ref para ignorar respuestas de solicitudes anteriores (race condition)
  const abortRef = useRef<AbortController | null>(null);
  const [counter, setCounter] = useState(0);

  const fetchQuote = useCallback(async () => {
    // No cotizar si el ID no está disponible
    if (!destinyTownId || destinyTownId.trim() === '') return;

    // Cancelar solicitud previa si aún estaba en vuelo
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    // Un solo setState para iniciar loading — evita renders intermedios que rompen DOM
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await quotarEnvio(destinyTownId, items, userProvider);

      if (signal.aborted) return; // Respuesta stale: ignorar

      // Un solo setState para aplicar resultado — crítico para estabilidad DOM
      setState({
        cheapest:  result.cheapest  ?? null,
        rates:     result.rates     ?? [],
        isLoading: false,
        error:     null,
      });
    } catch (err: any) {
      if (signal.aborted) return;

      console.error('[useShippingQuote] Error al cotizar:', err?.message);

      // Mensaje amigable según el tipo de error
      const friendly = friendlyError(err?.message ?? '');

      // Aplicar error y apagar loader en el mismo tick de setState
      setState({
        cheapest:  null,
        rates:     [],
        isLoading: false,
        error:     friendly,
      });
    }
  }, [destinyTownId, JSON.stringify(items), userProvider]);

  useEffect(() => {
    fetchQuote();
    return () => {
      // Cleanup: cancelar en desmontaje
      abortRef.current?.abort();
    };
  }, [fetchQuote, counter]);

  const refetch = useCallback(() => setCounter(c => c + 1), []);

  return {
    cheapest:  state.cheapest,
    rates:     state.rates,
    isLoading: state.isLoading,
    error:     state.error,
    refetch,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Transforma mensajes técnicos de la API en textos amigables para el usuario.
 * Nunca rompe el render — siempre retorna un string.
 */
function friendlyError(raw: string): string {
  const msg = raw.toLowerCase();

  if (msg.includes('404') || msg.includes('not found') || msg.includes('not valid')) {
    return 'Destino no disponible en este momento. Contacta con nosotros para coordinar tu envío.';
  }
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('apikey')) {
    return 'Error de configuración de envíos. Por favor contáctanos.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Sin conexión con el servidor de envíos. Verifica tu internet e intenta de nuevo.';
  }
  if (msg.includes('timeout')) {
    return 'El servicio de cotización tardó demasiado. Intenta de nuevo.';
  }
  if (msg.includes('no se encontraron opciones')) {
    return 'No hay servicios de envío disponibles para esta ciudad en este momento.';
  }

  // Fallback genérico — nunca exponer stack trace al usuario
  return 'No pudimos cotizar el envío automáticamente. Continuarás con tarifa estándar.';
}