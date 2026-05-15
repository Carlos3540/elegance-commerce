// src/pages/user/Pedidos.tsx
// Rediseño completo: stepper visual premium, tracking, historial de estados
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp,
  ExternalLink, AlertCircle, RefreshCw, ShoppingBag, MapPin,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

// ── Helpers ───────────────────────────────────────────────────────────────────

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

// ── Configuración de estados ──────────────────────────────────────────────────

const STEPS = [
  { key: "pending",    label: "Pendiente",   icon: Clock      },
  { key: "confirmed",  label: "Confirmado",  icon: CheckCircle },
  { key: "processing", label: "Preparando",  icon: Package    },
  { key: "shipped",    label: "En camino",   icon: Truck      },
  { key: "delivered",  label: "Entregado",   icon: CheckCircle },
] as const;

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: "Pendiente de pago", color: "#92400e", bg: "#fffbeb", border: "#fcd34d" },
  confirmed:  { label: "Pago confirmado",   color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7" },
  processing: { label: "Preparando",        color: "#4c1d95", bg: "#f5f3ff", border: "#c4b5fd" },
  shipped:    { label: "En camino",         color: "#1e40af", bg: "#eff6ff", border: "#93c5fd" },
  delivered:  { label: "Entregado ✓",       color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7" },
  cancelled:  { label: "Cancelado",         color: "#991b1b", bg: "#fff1f2", border: "#fca5a5" },
  refunded:   { label: "Reembolsado",       color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
};

const getStepIndex = (status: OrderStatus): number => {
  const idx = STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
};

// ── Hook para estado Bold por pedido ─────────────────────────────────────────

function useBoldStatus(orderId: string, orderStatus: OrderStatus) {
  const [boldStatus, setBoldStatus] = useState<string | null>(null);

  useEffect(() => {
    if (orderStatus === "cancelled") return;
    supabase
      .from("pagos_bold")
      .select("bold_status")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setBoldStatus(data.bold_status); });
  }, [orderId, orderStatus]);

  return boldStatus;
}

// ── Stepper visual ────────────────────────────────────────────────────────────

const OrderStepper = ({ status }: { status: OrderStatus }) => {
  if (status === "cancelled" || status === "refunded") {
    const cfg = STATUS_CONFIG[status];
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 12, padding: "10px 16px", marginBottom: 16,
      }}>
        <AlertCircle size={15} style={{ color: cfg.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color, fontFamily: "'DM Sans', sans-serif" }}>
          {cfg.label}
        </span>
      </div>
    );
  }

  const currentIdx = getStepIndex(status);

  return (
    <div style={{ marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 380, gap: 0 }}>
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone    = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast    = idx === STEPS.length - 1;

          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1 }}>
              {/* Nodo */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: isCurrent ? 36 : 30,
                  height: isCurrent ? 36 : 30,
                  borderRadius: "50%",
                  background: isDone ? "#111" : isCurrent ? "#111" : "#f3f4f6",
                  border: isCurrent ? "3px solid #111" : isDone ? "none" : "2px solid #e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}>
                  <Icon size={isCurrent ? 16 : 14}
                    style={{ color: (isDone || isCurrent) ? "#fff" : "#9ca3af" }} />
                </div>
                <span style={{
                  fontSize: 10, fontWeight: isCurrent ? 800 : 600,
                  color: (isDone || isCurrent) ? "#111" : "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                  letterSpacing: isCurrent ? "-0.01em" : 0,
                }}>
                  {step.label}
                </span>
              </div>
              {/* Línea conectora */}
              {!isLast && (
                <div style={{
                  flex: 1,
                  height: 3,
                  margin: "0 4px",
                  marginBottom: 20,
                  borderRadius: 2,
                  background: isDone ? "#111" : "#e5e7eb",
                  transition: "background 0.4s ease",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Tarjeta de tracking ───────────────────────────────────────────────────────

const TrackingCard = ({ order }: { order: any }) => {
  if (order.status !== "shipped" && order.status !== "delivered") return null;
  if (!order.tracking_number && !order.carrier) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      style={{
        background: "#eff6ff",
        border: "1px solid #93c5fd",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Truck size={14} style={{ color: "#1e40af", flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif" }}>
          Información de envío
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {order.carrier && (
          <div>
            <p style={{ fontSize: 10, color: "#60a5fa", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>Transportadora</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", fontFamily: "'DM Sans', sans-serif" }}>{order.carrier}</p>
          </div>
        )}
        {order.tracking_number && (
          <div>
            <p style={{ fontSize: 10, color: "#60a5fa", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>Guía de rastreo</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", fontFamily: "'DM Sans', sans-serif", fontVariantNumeric: "tabular-nums" }}>{order.tracking_number}</p>
          </div>
        )}
        {order.estimated_delivery && (
          <div>
            <p style={{ fontSize: 10, color: "#60a5fa", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>Entrega estimada</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", fontFamily: "'DM Sans', sans-serif" }}>
              {format(new Date(order.estimated_delivery), "dd 'de' MMMM", { locale: es })}
            </p>
          </div>
        )}
      </div>
      {order.tracking_url && (
        <a
          href={order.tracking_url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            marginTop: 10, padding: "8px 14px",
            background: "#1e40af", color: "#fff",
            borderRadius: 8, textDecoration: "none",
            fontSize: 12, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            width: "fit-content",
          }}
        >
          Rastrear envío <ExternalLink size={12} />
        </a>
      )}
    </motion.div>
  );
};

// ── Historial de estados ──────────────────────────────────────────────────────

const StatusHistory = ({ history }: { history: any[] }) => {
  if (!history || history.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {[...history].reverse().map((h, i) => (
        <div key={h.id || i} style={{ display: "flex", gap: 12, position: "relative" }}>
          {/* Línea vertical */}
          {i < history.length - 1 && (
            <div style={{
              position: "absolute", left: 8, top: 22,
              width: 2, height: "calc(100% - 10px)",
              background: "#e5e7eb",
            }} />
          )}
          {/* Punto */}
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            background: "#111", border: "3px solid #e5e7eb",
            flexShrink: 0, marginTop: 4,
          }} />
          {/* Contenido */}
          <div style={{ paddingBottom: 16, flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>
              {STATUS_CONFIG[h.new_status as OrderStatus]?.label ?? h.new_status}
            </p>
            {h.notes && (
              <p style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>
                {h.notes}
              </p>
            )}
            <p style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
              {format(new Date(h.changed_at), "dd MMM yyyy · HH:mm", { locale: es })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Tarjeta de pedido ─────────────────────────────────────────────────────────

const OrderCard = ({ order }: { order: any }) => {
  const [expanded, setExpanded] = useState(false);
  const boldStatus = useBoldStatus(order.id, order.status);
  const cfg = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p style={{ fontSize: 22, fontWeight: 900, color: "#111", letterSpacing: "-0.03em" }}>
              {COP(order.total)}
            </p>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {format(new Date(order.created_at), "dd 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          <div style={{
            padding: "5px 12px",
            borderRadius: 100,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color }}>{cfg.label}</span>
          </div>
        </div>

        {/* Stepper */}
        <OrderStepper status={order.status as OrderStatus} />

        {/* Tracking card */}
        <TrackingCard order={order} />

        {/* Badge pago Bold */}
        {boldStatus && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 8,
            background: boldStatus === "APPROVED" ? "#ecfdf5" : boldStatus === "PENDING" ? "#fffbeb" : "#fff1f2",
            border: `1px solid ${boldStatus === "APPROVED" ? "#6ee7b7" : boldStatus === "PENDING" ? "#fcd34d" : "#fca5a5"}`,
            marginBottom: 12, width: "fit-content",
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: boldStatus === "APPROVED" ? "#065f46" : boldStatus === "PENDING" ? "#92400e" : "#991b1b",
            }}>
              Pago Bold: {boldStatus === "APPROVED" ? "Aprobado ✓" : boldStatus === "PENDING" ? "Pendiente ⏳" : "Rechazado ✗"}
            </span>
          </div>
        )}

        {/* Items del pedido (preview) */}
        {order.order_items && order.order_items.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {order.order_items.slice(0, 4).map((item: any) => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#f9fafb", border: "1px solid #f3f4f6",
                borderRadius: 10, padding: "6px 10px 6px 6px",
              }}>
                {item.product_image && (
                  <img src={item.product_image} alt={item.product_name}
                    style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                )}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.product_name}
                  </p>
                  <p style={{ fontSize: 10, color: "#9ca3af" }}>x{item.quantity}</p>
                </div>
              </div>
            ))}
            {order.order_items.length > 4 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#f3f4f6", borderRadius: 10, padding: "6px 14px",
                fontSize: 12, fontWeight: 700, color: "#6b7280",
              }}>
                +{order.order_items.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón expandir historial */}
      {order.order_status_history && order.order_status_history.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: "100%", padding: "12px 24px",
              borderTop: "1px solid #f3f4f6",
              background: "none", border: "none", borderTop: "1px solid #f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#6b7280",
              fontFamily: "'DM Sans', sans-serif",
            } as any}
          >
            <span>Historial de estados ({order.order_status_history.length})</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ padding: "16px 24px 20px", borderTop: "1px solid #f3f4f6" }}>
                  <StatusHistory history={order.order_status_history} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

const Pedidos = () => {
  const { orders, isLoading, refetch } = useOrders();

  return (
    <div style={{
      maxWidth: 760, margin: "0 auto", padding: "32px 16px 64px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
            Mi cuenta
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Mis Pedidos
          </h1>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 10,
            background: "#f9fafb", border: "1px solid #e5e7eb",
            cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#374151",
          }}
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              background: "#fff", border: "1px solid #e5e7eb",
              borderRadius: 20, padding: 24, height: 200,
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Estado vacío */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 24, padding: "64px 32px", textAlign: "center",
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#f9fafb", border: "2px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <ShoppingBag size={28} style={{ color: "#d1d5db" }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 8 }}>
            Aún no tienes pedidos
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
            Cuando realices tu primera compra, aparecerá aquí.
          </p>
          <Link
            to="/tienda"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "12px 24px", background: "#111", color: "#fff",
              borderRadius: 12, textDecoration: "none", fontSize: 13, fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            Explorar la tienda <MapPin size={13} />
          </Link>
        </motion.div>
      ) : (
        /* Lista de pedidos */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Pedidos;