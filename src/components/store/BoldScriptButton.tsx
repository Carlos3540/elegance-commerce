import React, { useEffect, useRef } from 'react';

interface BoldScriptButtonProps {
  apiKey: string;
  orderId: string;
  currency: string;
  amount: number;
  integritySignature: string;
  redirectionUrl: string;
}

export const BoldScriptButton: React.FC<BoldScriptButtonProps> = ({
  apiKey,
  orderId,
  currency,
  amount,
  integritySignature,
  redirectionUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Limpiar el contenedor por si hay renders múltiples en React
    containerRef.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
    
    // Atributos requeridos por Bold para la "Integración Manual" (mediante script HTML)
    // Se usa 'dark-L' como valor del atributo data-bold-button para tener estilo oscuro y tamaño grande
    script.setAttribute('data-bold-button', 'dark-L');
    script.setAttribute('data-api-key', apiKey);
    script.setAttribute('data-order-id', orderId);
    script.setAttribute('data-currency', currency);
    script.setAttribute('data-amount', String(Math.round(amount)));
    script.setAttribute('data-integrity-signature', integritySignature);
    script.setAttribute('data-redirection-url', redirectionUrl);
    script.setAttribute('data-render-mode', 'embedded');
    
    // Opcional: Para evitar advertencias de CORS al cargar el script
    script.crossOrigin = 'anonymous';

    // Insertar el script en el contenedor
    containerRef.current.appendChild(script);

    return () => {
      // Limpieza al desmontar
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [apiKey, orderId, currency, amount, integritySignature, redirectionUrl]);

  return <div ref={containerRef} className="w-full flex justify-center items-center overflow-hidden min-h-[60px]" />;
};
