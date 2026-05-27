-- ============================================================
-- HABILITAR REALTIME EN SUPABASE PARA EL SISTEMA DE PAGOS
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Habilitar Realtime en tabla `orders`
--    (necesario para que useOrderStatusListener funcione en Checkout.tsx)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 2. Habilitar Realtime en tabla `pagos_bold`
--    (necesario para que CheckoutSuccess.tsx detecte aprobación via Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.pagos_bold;

-- ============================================================
-- VERIFICACIÓN: Ejecutar después para confirmar
-- ============================================================
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('orders', 'pagos_bold');

-- Resultado esperado:
-- tablename
-- -----------
-- orders
-- pagos_bold
