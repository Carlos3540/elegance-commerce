import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Search, Heart, User, Phone, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Inicio", path: "/" },
  { label: "Tienda", path: "/tienda" },
  { label: "Blog", path: "/blog" },
  { label: "Contacto", path: "/contacto" },
];

const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold tracking-tight">EVOLET</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-widest uppercase transition-colors hover:text-accent ${
                  location.pathname === link.path ? "text-foreground border-b-2 border-accent pb-0.5" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hidden md:flex text-sm text-muted-foreground hover:text-foreground transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="relative text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-background"
          >
            <nav className="flex flex-col p-4 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium tracking-widest uppercase py-2"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium tracking-widest uppercase py-2">
                Admin
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
