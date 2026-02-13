import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <div className="container mx-auto px-4 lg:px-8 py-4">
        <p className="text-sm text-muted-foreground">
          <span>🏠 Inicio</span> &gt; <span className="font-medium text-foreground">Contacto</span>
        </p>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl font-bold mb-8">CONTÁCTANOS</h1>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Dirección</h3>
                  <p className="text-sm text-muted-foreground">Calle 123 #45-67, Bogotá, Colombia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Teléfono</h3>
                  <p className="text-sm text-muted-foreground">+57 1 234 5678 | +57 300 123 4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Soporte</h3>
                  <p className="text-sm text-muted-foreground">soporte@evolet96.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Horario de Atención</h3>
                  <p className="text-sm text-muted-foreground">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  <p className="text-sm text-muted-foreground">Sábados: 9:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl font-bold mb-6">ENVÍANOS UN MENSAJE</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nombre completo" className="w-full border border-border px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground" />
                  <input type="email" placeholder="Correo electrónico" className="w-full border border-border px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground" />
                </div>
                <input type="text" placeholder="Asunto" className="w-full border border-border px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground" />
                <textarea placeholder="Mensaje" rows={5} className="w-full border border-border px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-none" />
                <button className="bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.8!2d-74.06!3d4.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMzknMDAuMCJOIDc0wrAwMycwMC4wIlc!5e0!3m2!1ses!2sco!4v1234567890"
              width="100%"
              height="100%"
              style={{ minHeight: "500px", border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación EVOLET"
            />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
