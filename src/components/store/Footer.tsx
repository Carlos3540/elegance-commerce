import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold mb-4">EVOLET</h3>
          <p className="text-sm opacity-70 leading-relaxed">
            Moda exclusiva diseñada para quienes buscan elegancia y estilo en cada momento.
          </p>
        </div>
        <div>
          <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Tienda</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/tienda" className="hover:opacity-100 transition-opacity">Mujer</Link></li>
            <li><Link to="/tienda" className="hover:opacity-100 transition-opacity">Hombre</Link></li>
            <li><Link to="/tienda" className="hover:opacity-100 transition-opacity">Accesorios</Link></li>
            <li><Link to="/tienda" className="hover:opacity-100 transition-opacity">Outlet</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Empresa</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/contacto" className="hover:opacity-100 transition-opacity">Contacto</Link></li>
            <li><Link to="/blog" className="hover:opacity-100 transition-opacity">Blog</Link></li>
            <li><a href="#" className="hover:opacity-100 transition-opacity">Política de Privacidad</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Contacto</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li>Calle 123 #45-67, Bogotá</li>
            <li>+57 1 234 5678</li>
            <li>soporte@evolet96.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-sm opacity-50">
        © 2026 EVOLET. Todos los derechos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;
