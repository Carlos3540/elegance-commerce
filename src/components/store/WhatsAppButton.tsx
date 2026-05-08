import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import waLogo from "@/assets/whatsapp-logo.png";

const PHONE = "573134620799";
const MESSAGE = "Hola, me gustaría obtener más información sobre sus productos 😊";
const WA_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

const WhatsAppButton = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 99, display: "flex", alignItems: "center", gap: 10, flexDirection: "row-reverse" }}>
      <motion.a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ width: 66, height: 66, borderRadius: "50%", background: "linear-gradient(135deg,#25D366,#128C7E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(37,211,102,0.45)", cursor: "pointer", textDecoration: "none", flexShrink: 0, position: "relative" }}
      >
        <img
            src={waLogo}
            alt="WhatsApp"
            style={{ width: 42, height: 42, objectFit: "contain" }}
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", width: 56, height: 56, borderRadius: "50%", background: "rgba(37,211,102,0.3)", pointerEvents: "none" }}
        />
      </motion.a>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ background: "#fff", color: "#1a1a1a", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", padding: "8px 14px", borderRadius: 10, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", pointerEvents: "none" }}
          >
            💬 Chatea con nosotros
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppButton;