import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, ShieldCheck, Wrench, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Maintenance: React.FC = () => {
  const whatsappNumber = '573007498007'; // Número de Evolet 96
  const whatsappMessage = encodeURIComponent('¡Hola Evolet 96! Quisiera información sobre sus prendas y el estado de la plataforma.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Luces y efectos de fondo premium */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-neutral-800 to-amber-600/20 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-neutral-900/50 rounded-full blur-[100px] pointer-events-none" />

      {/* Encabezado / Logo */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl flex justify-center items-center pt-6 z-10"
      >
        <div className="text-3xl font-extrabold tracking-widest uppercase text-white flex items-center gap-3">
          <span className="bg-white text-black px-3 py-1 font-black text-2xl tracking-tighter rounded-sm">E96</span>
          <span>EVOLET 96</span>
        </div>
      </motion.header>

      {/* Tarjeta central Glassmorphism */}
      <motion.main 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="max-w-2xl w-full mx-auto my-auto z-10 text-center px-6 py-12 md:py-16 bg-neutral-950/80 backdrop-blur-xl border border-neutral-800/80 rounded-3xl shadow-2xl flex flex-col items-center gap-8"
      >
        <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-amber-400 inline-flex items-center justify-center animate-pulse shadow-lg">
          <Wrench className="w-10 h-10" />
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs md:text-sm font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4" />
            <span>Modo Mantenimiento Activo</span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Estamos Elevando Nuestra Experiencia
          </h1>

          <p className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            Actualmente nos encontramos realizando mejoras técnicas y de seguridad en nuestra plataforma para brindarte un proceso de compra aún más fluido, rápido y premium.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md text-left pt-2">
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/60 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white">Regreso Pronto</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Estaremos operativos en breve con nuevas colecciones.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white">Seguridad Total</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Optimizando pasarelas y envíos para tu tranquilidad.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto rounded-full bg-white hover:bg-neutral-200 text-black font-bold px-8 h-12 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-white/20"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Send className="w-4 h-4 text-black" />
              <span>Contactar por WhatsApp</span>
            </a>
          </Button>
        </div>
      </motion.main>

      {/* Pie de página */}
      <footer className="w-full text-center text-xs text-neutral-500 py-6 z-10 border-t border-neutral-900 mt-12">
        <p>© {new Date().getFullYear()} EVOLET 96. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Maintenance;
