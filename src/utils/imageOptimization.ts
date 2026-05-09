/**
 * Utilidades para la optimización de imágenes.
 * Aprovecha la API de transformación de Supabase si está disponible,
 * o simplemente ayuda a manejar formatos y tamaños.
 */

interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
}

/**
 * Transforma una URL de Supabase Storage para usar el endpoint de renderizado optimizado.
 * Nota: Requiere que el proyecto tenga habilitada la transformación de imágenes.
 */
export const optimizeSupabaseImage = (url: string | null | undefined, options: OptimizeOptions = {}) => {
  if (!url) return "/assets/placeholder.svg";
  
  // Si no es una URL de Supabase, devolver tal cual
  if (!url.includes("supabase.co/storage/v1/object/public/")) return url;

  // IMPORTANTE: La transformación de imágenes (endpoint /render/) es una función de PAGO en Supabase.
  // Si tu proyecto está en el plan gratuito, las imágenes NO cargarán si usamos /render/.
  // Por ahora, devolvemos la URL original para asegurar que el sitio funcione.
  
  /* 
  // Descomenta esto si tienes un plan Pro:
  const { width, height, quality = 75, format = 'webp' } = options;
  const renderUrl = url.replace("/object/public/", "/render/image/public/");
  const params = new URLSearchParams();
  if (width) params.append("width", width.toString());
  if (height) params.append("height", height.toString());
  params.append("quality", quality.toString());
  params.append("format", format);
  return `${renderUrl}?${params.toString()}`;
  */

  return url;
};

/**
 * Devuelve un srcset básico para imágenes responsivas
 */
export const getSupabaseSrcSet = (url: string | null | undefined, sizes = [300, 600, 900, 1200]) => {
  if (!url || !url.includes("supabase.co")) return undefined;
  
  return sizes
    .map(s => `${optimizeSupabaseImage(url, { width: s })} ${s}w`)
    .join(", ");
};
