import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, Users, Settings, LogOut, Menu, X,
  TrendingUp, DollarSign, Eye, ChevronUp, Edit, Trash2, Plus,
} from "lucide-react";
import { products as mockProducts, Product } from "@/data/products";
import { Link } from "react-router-dom";

type AdminTab = "dashboard" | "products" | "orders" | "inventory";

const statCards = [
  { label: "Ventas del Mes", value: "$12,450", icon: DollarSign, change: "+12%", color: "text-success" },
  { label: "Órdenes Recientes", value: "156", icon: ShoppingBag, change: "+8%", color: "text-info" },
  { label: "Productos Activos", value: "89", icon: Package, change: "+3%", color: "text-warning" },
  { label: "Visitantes", value: "2,340", icon: Eye, change: "+18%", color: "text-accent" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminProducts, setAdminProducts] = useState<Product[]>(mockProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const sidebarItems = [
    { id: "dashboard" as AdminTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "products" as AdminTab, label: "Productos", icon: Package },
    { id: "orders" as AdminTab, label: "Órdenes", icon: ShoppingBag },
    { id: "inventory" as AdminTab, label: "Inventario", icon: BarChart3 },
  ];

  const deleteProduct = (id: number) => {
    setAdminProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-admin-bg flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="bg-admin-sidebar border-r border-border overflow-hidden shrink-0"
      >
        <div className="p-6">
          <Link to="/" className="font-display text-xl font-bold">EVOLET</Link>
          <p className="text-xs text-muted-foreground mt-1">Panel de Administración</p>
        </div>
        <nav className="px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-admin-accent text-admin-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 px-3 w-[260px]">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-5 h-5" /> Volver a Tienda
          </Link>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-admin-sidebar border-b border-border px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-admin-accent text-admin-accent-foreground flex items-center justify-center text-sm font-bold">A</div>
            <span className="text-sm font-medium">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  {statCards.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-admin-card p-6 rounded-xl border border-border shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        <span className={`text-xs font-semibold ${stat.color} flex items-center gap-1`}>
                          <ChevronUp className="w-3 h-3" /> {stat.change}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Simple chart placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-admin-card p-6 rounded-xl border border-border">
                    <h3 className="font-display text-lg font-semibold mb-4">Ventas Mensuales</h3>
                    <div className="flex items-end gap-2 h-40">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-admin-accent/80 rounded-t hover:bg-admin-accent transition-colors cursor-pointer"
                          title={`Mes ${i + 1}: ${h}%`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                      <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
                      <span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
                    </div>
                  </div>

                  <div className="bg-admin-card p-6 rounded-xl border border-border">
                    <h3 className="font-display text-lg font-semibold mb-4">Productos Más Vendidos</h3>
                    <div className="space-y-3">
                      {adminProducts.slice(0, 5).map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">${p.price.toFixed(2)}</p>
                          </div>
                          <span className="text-xs font-semibold text-success">{Math.floor(Math.random() * 50 + 10)} vendidos</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "products" && (
              <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-2xl font-bold">Productos</h1>
                  <button className="bg-admin-accent text-admin-accent-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" /> Nuevo Producto
                  </button>
                </div>
                <div className="bg-admin-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Producto</th>
                        <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">SKU</th>
                        <th className="text-left px-4 py-3 font-semibold">Precio</th>
                        <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Stock</th>
                        <th className="text-left px-4 py-3 font-semibold">Categoría</th>
                        <th className="text-right px-4 py-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminProducts.map((p) => (
                        <motion.tr key={p.id} layout className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                            <span className="font-medium">{p.name}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.sku}</td>
                          <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className={p.stock < 15 ? "text-accent font-semibold" : ""}>{p.stock}</span>
                          </td>
                          <td className="px-4 py-3">{p.category}</td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-muted-foreground hover:text-foreground p-1"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteProduct(p.id)} className="text-muted-foreground hover:text-accent p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "inventory" && (
              <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className="font-display text-2xl font-bold mb-6">Gestión de Inventario</h1>
                <div className="bg-admin-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Producto</th>
                        <th className="text-left px-4 py-3 font-semibold">Stock Actual</th>
                        <th className="text-left px-4 py-3 font-semibold">Estado</th>
                        <th className="text-left px-4 py-3 font-semibold">Último Movimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminProducts.map((p) => (
                        <tr key={p.id} className="border-t border-border">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                            <span className="font-medium">{p.name}</span>
                          </td>
                          <td className="px-4 py-3">{p.stock} unidades</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              p.stock > 20 ? "bg-success/10 text-success" : p.stock > 10 ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"
                            }`}>
                              {p.stock > 20 ? "Disponible" : p.stock > 10 ? "Bajo" : "Crítico"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">Entrada - Hace 2 días</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className="font-display text-2xl font-bold mb-6">Órdenes Recientes</h1>
                <div className="bg-admin-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Orden #</th>
                        <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                        <th className="text-left px-4 py-3 font-semibold">Total</th>
                        <th className="text-left px-4 py-3 font-semibold">Estado</th>
                        <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "#1001", client: "María García", total: "$156.00", status: "Completada", date: "Feb 12, 2026" },
                        { id: "#1002", client: "Carlos López", total: "$89.99", status: "En Proceso", date: "Feb 11, 2026" },
                        { id: "#1003", client: "Ana Martínez", total: "$245.50", status: "Pendiente", date: "Feb 10, 2026" },
                        { id: "#1004", client: "Juan Rodríguez", total: "$72.00", status: "Completada", date: "Feb 9, 2026" },
                      ].map((order) => (
                        <tr key={order.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="px-4 py-3 font-medium">{order.id}</td>
                          <td className="px-4 py-3">{order.client}</td>
                          <td className="px-4 py-3 font-semibold">{order.total}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              order.status === "Completada" ? "bg-success/10 text-success" :
                              order.status === "En Proceso" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
