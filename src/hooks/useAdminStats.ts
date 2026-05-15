import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminStats {
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  revenueChange: number;
  totalOrders: number;
  activeOrders: number;
  deliveredToday: number;
  pendingDispatch: number;
  ordersThisMonth: number;
  ordersChange: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalUsers: number;
  newUsersThisMonth: number;
  recentOrders: {
    id: string;
    shortId: string;
    customer: string;
    product: string;
    amount: number;
    status: string;
    created_at: string;
  }[];
  topProducts: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    totalSold: number;
  }[];
  monthlySales: number[];
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);

      const now = new Date();
      const startOfDay       = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const startOfYear      = new Date(now.getFullYear(), 0, 1).toISOString();

      const [
        allOrdersRes, monthOrdersRes, lastMonthOrdersRes,
        productsRes, usersRes, usersMonthRes,
        recentOrdersRes, orderItemsRes, yearOrdersRes,
      ] = await Promise.all([
        supabase.from('orders').select('total, status, created_at').neq('status', 'cancelled'),
        supabase.from('orders').select('total, status, created_at').gte('created_at', startOfMonth).neq('status', 'cancelled'),
        supabase.from('orders').select('total, status, created_at').gte('created_at', startOfLastMonth).lt('created_at', startOfMonth).neq('status', 'cancelled'),
        supabase.from('products').select('id, is_active, stock, low_stock_threshold'),
        supabase.from('profiles').select('id').neq('role', 'admin'),
        supabase.from('profiles').select('id').gte('created_at', startOfMonth).neq('role', 'admin'),
        // Sin join a profiles (bloqueado por RLS) — usar shipping_name del snapshot
        supabase.from('orders')
          .select('id, total, status, created_at, shipping_name, shipping_email, order_items(product_name)')
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('order_items')
          .select('product_id, product_name, quantity, products(id, name, price, image_url)')
          .not('product_id', 'is', null),
        supabase.from('orders')
          .select('total, created_at')
          .gte('created_at', startOfYear)
          .neq('status', 'cancelled'),
      ]);

      const allOrders       = allOrdersRes.data || [];
      const monthOrders     = monthOrdersRes.data || [];
      const lastMonthOrders = lastMonthOrdersRes.data || [];
      const products        = productsRes.data || [];

      // Filtros específicos
      const deliveredOrShipped = allOrders.filter(o => ['shipped', 'delivered'].includes(o.status));
      const ordersToday = allOrders.filter(o => o.created_at && o.created_at >= startOfDay);
      
      const totalRevenue     = deliveredOrShipped.reduce((s, o) => s + Number(o.total), 0);
      const revenueToday     = ordersToday.filter(o => ['shipped', 'delivered'].includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
      const revenueThisMonth = monthOrders.filter(o => ['shipped', 'delivered'].includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
      const revenueLastMonth = lastMonthOrders.filter(o => ['shipped', 'delivered'].includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
      const revenueChange    = revenueLastMonth > 0
        ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) : 0;

      const activeOrders     = allOrders.filter(o => ['processing', 'shipped'].includes(o.status)).length;
      const deliveredToday   = ordersToday.filter(o => o.status === 'delivered').length;
      const pendingDispatch  = allOrders.filter(o => o.status === 'processing').length;

      const ordersChange = lastMonthOrders.length > 0
        ? Math.round(((monthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100) : 0;

      const activeProducts   = products.filter(p => p.is_active).length;
      const lowStockProducts = products.filter(p => p.stock <= p.low_stock_threshold).length;

      // Órdenes recientes
      const recentOrders = (recentOrdersRes.data || []).map((o: any) => ({
        id: o.id,
        shortId: `#${o.id.slice(0, 8).toUpperCase()}`,
        customer: o.shipping_name || o.shipping_email || 'Cliente',
        product: o.order_items?.[0]?.product_name || '—',
        amount: Number(o.total),
        status: o.status,
        created_at: o.created_at,
      }));

      // Top productos
      const productSales: Record<string, any> = {};
      (orderItemsRes.data || []).forEach((item: any) => {
        const pid = item.product_id;
        if (!productSales[pid]) {
          productSales[pid] = {
            id: pid,
            name: item.products?.name || item.product_name,
            price: Number(item.products?.price || 0),
            image_url: item.products?.image_url || '',
            totalSold: 0,
          };
        }
        productSales[pid].totalSold += item.quantity;
      });
      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.totalSold - a.totalSold)
        .slice(0, 5);

      // Ventas por mes
      const monthlySales = Array(12).fill(0);
      (yearOrdersRes.data || []).forEach((o: any) => {
        const month = new Date(o.created_at).getMonth();
        monthlySales[month] += Number(o.total);
      });

      setStats({
        totalRevenue,
        revenueToday,
        revenueThisMonth,
        revenueChange,
        totalOrders: allOrders.length,
        activeOrders,
        deliveredToday,
        pendingDispatch,
        ordersThisMonth: monthOrders.length,
        ordersChange,
        totalProducts: products.length,
        activeProducts,
        lowStockProducts,
        totalUsers: usersRes.data?.length || 0,
        newUsersThisMonth: usersMonthRes.data?.length || 0,
        recentOrders,
        topProducts,
        monthlySales,
      });
    } catch (err) {
      console.error('useAdminStats error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => { if (mounted) await fetchStats(); };
    load();

    // Nombre único para evitar conflictos con React Strict Mode
    const channelName = `admin-stats-rt-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },   () => { if (mounted) fetchStats(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { if (mounted) fetchStats(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { if (mounted) fetchStats(); })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('[AdminStats] Realtime ✓');
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
};
















