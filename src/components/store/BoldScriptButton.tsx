import React, { useEffect, useRef } from 'react';

interface BoldScriptButtonProps {
  apiKey: string;
  orderId: string;
  currency: string;
  amount: number;
  integritySignature: string;
  redirectionUrl: string;
  supabaseOrderId: string;
}

export const BoldScriptButton: React.FC<BoldScriptButtonProps> = ({
  apiKey,
  orderId,
  currency,
  amount,
  integritySignature,
  redirectionUrl,
  supabaseOrderId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let isMounted = true;
    const container = containerRef.current;

    const init = async () => {
      try {
        // Usar el cargador centralizado para evitar duplicados
        const { cargarScriptBold } = await import('@/services/boldPayment');
        await cargarScriptBold();
        
        if (!isMounted) return;

        // Limpiar el contenedor
        container.innerHTML = '';
        
        const script = document.createElement('script');
        script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
        
        // Atributos requeridos por Bold para la "Integración Manual"
        script.setAttribute('data-bold-button', 'dark-L');
        script.setAttribute('data-api-key', apiKey);
        script.setAttribute('data-order-id', orderId);
        script.setAttribute('data-currency', currency);
        script.setAttribute('data-amount', String(Math.round(amount)));
        script.setAttribute('data-integrity-signature', integritySignature);
        script.setAttribute('data-metadata', JSON.stringify({
          orderId: supabaseOrderId
        }));
        script.setAttribute('data-redirection-url', redirectionUrl);
        script.setAttribute('data-render-mode', 'embedded');
        
        container.appendChild(script);
      } catch (err) {
        console.error('[BoldScriptButton] Error initializing Bold SDK:', err);
      }
    };

    init();

    return () => {
      isMounted = false;
      container.innerHTML = '';
    };
  }, [apiKey, orderId, currency, amount, integritySignature, redirectionUrl, supabaseOrderId]);

  return <div ref={containerRef} className="w-full flex justify-center items-center overflow-hidden min-h-[60px]" />;
};
