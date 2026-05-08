// src/pages/user/Pedidos.tsx
import { useState } from "react";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

const Pedidos = () => {
  // Mock data - luego conectas con tu BD
  const [orders] = useState([
    { id: "#1001", date: "2026-02-15", total: 156.00, status: "entregado", items: 3 },
    { id: "#1002", date: "2026-02-10", total: 89.99, status: "en_camino", items: 1 },
    { id: "#1003", date: "2026-02-05", total: 245.50, status: "procesando", items: 5 },
  ]);

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { icon: any, text: string, color: string, bg: string }> = {
      entregado: { icon: CheckCircle, text: "Entregado", color: "text-green-600", bg: "bg-green-50" },
      en_camino: { icon: Truck, text: "En camino", color: "text-blue-600", bg: "bg-blue-50" },
      procesando: { icon: Clock, text: "Procesando", color: "text-yellow-600", bg: "bg-yellow-50" },
    };
    return statuses[status] || { icon: Package, text: status, color: "text-gray-600", bg: "bg-gray-50" };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes pedidos aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getStatusInfo(order.status);
            const Icon = status.icon;
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Pedido {order.id}</p>
                    <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
                    <Icon className={`w-5 h-5 ${status.color}`} />
                    <span className={`font-medium ${status.color}`}>{status.text}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                  <span>{order.items} productos</span>
                  <span>{new Date(order.date).toLocaleDateString("es-ES", { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Pedidos;