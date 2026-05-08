// src/pages/user/Pedidos.tsx
import { useState } from "react";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Pedidos = () => {
  const { orders, isLoading } = useOrders();

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { icon: any, text: string, color: string, bg: string, step: number }> = {
      pending: { icon: Clock, text: "Pendiente de pago", color: "text-gray-600", bg: "bg-gray-50", step: 0 },
      processing: { icon: Clock, text: "Procesando", color: "text-yellow-600", bg: "bg-yellow-50", step: 1 },
      shipped: { icon: Truck, text: "En camino", color: "text-blue-600", bg: "bg-blue-50", step: 2 },
      delivered: { icon: CheckCircle, text: "Entregado", color: "text-green-600", bg: "bg-green-50", step: 3 },
      cancelled: { icon: Package, text: "Cancelado", color: "text-red-600", bg: "bg-red-50", step: -1 },
    };
    return statuses[status] || { icon: Package, text: status, color: "text-gray-600", bg: "bg-gray-50", step: 0 };
  };

  const steps = ["Procesando", "En camino", "Entregado"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes pedidos aún</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = getStatusInfo(order.status);
            const Icon = status.icon;
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-2xl font-bold">${order.total.toLocaleString()}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full w-max ${status.bg}`}>
                    <Icon className={`w-5 h-5 ${status.color}`} />
                    <span className={`font-medium ${status.color}`}>{status.text}</span>
                  </div>
                </div>

                {/* Stepper */}
                {status.step >= 1 && (
                  <div className="mb-6 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-black -translate-y-1/2 rounded-full transition-all duration-500"
                      style={{ width: `${((status.step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                      {steps.map((stepLabel, idx) => {
                        const isActive = status.step >= idx + 1;
                        return (
                          <div key={stepLabel} className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${isActive ? 'border-black text-black' : 'border-gray-300 text-gray-300'}`}>
                              {isActive ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-black' : 'text-gray-400'}`}>{stepLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Info adicional (Guía de envío) */}
                {order.status === 'shipped' && order.tracking_number && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Transportadora</p>
                      <p className="font-medium text-gray-900">{order.carrier || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Guía de Rastreo</p>
                      <p className="font-medium text-gray-900">{order.tracking_number}</p>
                    </div>
                    {order.tracking_url && (
                      <a href={order.tracking_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 text-center">
                        Rastrear Envío
                      </a>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4 mt-4">
                  <span>{order.order_items?.length || 0} producto(s)</span>
                  <span>{format(new Date(order.created_at), "dd 'de' MMMM, yyyy", { locale: es })}</span>
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