import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  Package, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  Store, 
  Globe, 
  TrendingUp, 
  ArrowUpRight,
  Loader2 
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    ordersToday: 0,
    totalRevenue: 0,
    posRevenue: 0,
    posOrdersCount: 0,
    webRevenue: 0,
    webOrdersCount: 0,
    lowStockCount: 0,
  });

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats from Backend
      const res = await axios.get('/admin/dashboard/stats');
      if (res.data?.data) {
        const d = res.data.data;
        const kpis = d.kpis || d.stats || {};
        
        // Parse channel sales
        const salesByChannel = d.sales_by_channel || [];
        const posChannel = salesByChannel.find((s) => s.order_type === 'POS') || {};
        const webChannel = salesByChannel.find((s) => s.order_type === 'WEB') || {};

        setStats({
          totalProducts: kpis.total_products ?? kpis.totalProducts ?? 0,
          totalOrders: kpis.total_orders ?? kpis.totalOrders ?? 0,
          ordersToday: kpis.today_orders ?? kpis.ordersToday ?? 0,
          totalRevenue: kpis.total_revenue ?? kpis.totalRevenue ?? 0,
          posRevenue: posChannel.total ?? kpis.posRevenue ?? kpis.today_revenue ?? 0,
          posOrdersCount: posChannel.count ?? kpis.posOrdersCount ?? kpis.today_orders ?? 0,
          webRevenue: webChannel.total ?? kpis.webRevenue ?? 0,
          webOrdersCount: webChannel.count ?? kpis.webOrdersCount ?? 0,
          lowStockCount: kpis.low_stock_alerts_count ?? kpis.lowStockCount ?? 0,
        });

        // Parse Low Stock
        const lowStock = d.low_stock_alerts || d.low_stock_products || [];
        setLowStockProducts(lowStock.map((p) => ({
          id: p.id,
          title: p.title,
          barcode: p.barcode || 'N/A',
          quantity: p.stock_quantity ?? p.quantity ?? 0,
          price_sell: p.price_sell ?? p.price ?? 0,
        })));

        // Parse Top Sellers
        const topSellers = d.top_selling_products || d.top_products || [];
        setTopProducts(topSellers.map((item) => ({
          title: item.product?.title || item.title || 'Produit',
          total_sold: item.total_sold || 0,
          total_revenue: item.total_revenue || 0,
        })));

        // Fetch recent sales for recent orders table if not provided
        if (d.recent_orders) {
          setRecentOrders(d.recent_orders);
        } else {
          try {
            const salesRes = await axios.get('/admin/sales/history');
            if (salesRes.data?.data) {
              setRecentOrders((salesRes.data.data || []).slice(0, 10));
            }
          } catch (salesErr) {
            console.error('Error fetching sales history for recent orders:', salesErr);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredOrders = recentOrders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toString().includes(searchLower) ||
      (order.customer_name || order.user?.name || '').toLowerCase().includes(searchLower) ||
      (order.phone || '').toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
        <span className="text-sm font-semibold">Chargement du tableau de bord...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50 dark:bg-slate-900 min-h-screen">
      
      {/* 🔍 Top Bar: Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Tableau de Bord Admin
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Aperçu en temps réel des ventes, du stock et des activités du magasin.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders, products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
            />
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-200 rounded-2xl transition shadow-sm cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* 📊 Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Revenue */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold border border-emerald-100 dark:border-emerald-800">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {parseFloat(stats.totalRevenue).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">DH</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Aujourd'hui: {parseFloat(stats.posRevenue).toFixed(2)} DH
          </div>
        </div>

        {/* Card 2: Commandes Totales */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commandes Totales</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalOrders}
          </div>
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Aujourd'hui: {stats.ordersToday} commandes
          </div>
        </div>

        {/* Card 3: Catalogue Produits */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalogue Produits</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalProducts}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-2">
            Produits actifs en stock
          </div>
        </div>

        {/* Card 4: Alertes Stock Bas */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertes Stock Bas</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.lowStockCount || lowStockProducts.length || 0}
          </div>
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-2">
            Réapprovisionnement nécessaire
          </div>
        </div>

      </div>

      {/* 🏪 Breakdown: Ventes POS vs Ventes Web */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* POS Caisse */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Ventes Caisse (POS)</h4>
              <p className="text-xs text-slate-400 dark:text-gray-400">{stats.posOrdersCount || stats.totalOrders} ventes enregistrées en caisse</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {parseFloat(stats.posRevenue).toFixed(2)} DH
            </span>
          </div>
        </div>

        {/* E-Commerce Web */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Ventes Web (E-Commerce)</h4>
              <p className="text-xs text-slate-400 dark:text-gray-400">{stats.webOrdersCount || 0} commandes sur la boutique web</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {parseFloat(stats.webRevenue || 0).toFixed(2)} DH
            </span>
          </div>
        </div>

      </div>

      {/* ⚠️ Low Stock Alerts & Top Products Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Alertes Stock Bas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Alertes de Stock Bas</h3>
            </div>
            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold rounded-full text-xs border border-amber-200 dark:border-amber-800">
              {lowStockProducts.length} Produits
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="pb-3">PRODUIT</th>
                  <th className="pb-3">CODE-BARRES</th>
                  <th className="pb-3 text-center">STOCK RESTANT</th>
                  <th className="pb-3 text-right">PRIX VENTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold">
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      Aucun produit en alerte de stock bas.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{p.title}</td>
                      <td className="py-3 font-mono text-slate-400">{p.barcode}</td>
                      <td className="py-3 text-center">
                        <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-lg font-black border border-rose-200 dark:border-rose-800">
                          {p.quantity} unités
                        </span>
                      </td>
                      <td className="py-3 text-right font-black text-slate-900 dark:text-white">{p.price_sell} DH</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Top Produits Vendus */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Top Produits Vendus</h3>
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Aucun produit vendu pour le moment.
              </div>
            ) : (
              topProducts.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50/80 dark:bg-slate-900 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">{item.title}</span>
                    <span className="text-[11px] text-slate-400 dark:text-gray-400 font-medium">Vendus : {item.total_sold} unités</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                    {parseFloat(item.total_revenue).toFixed(2)} DH
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 📜 Recent Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Orders</h3>
          <a href="/sales-history" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
            View All Orders
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/60 dark:bg-slate-900 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">ORDER ID</th>
                <th className="py-4 px-6">CUSTOMER NAME</th>
                <th className="py-4 px-6">PHONE</th>
                <th className="py-4 px-6">TOTAL PRICE</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      #{order.id.toString().padStart(4, '0')}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-gray-200">
                      {order.customer_name || order.user?.name || 'Client POS'}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-gray-400">
                      {order.phone || '0600000000'}
                    </td>
                    <td className="py-4 px-6 font-black text-slate-900 dark:text-white">
                      {parseFloat(order.total_amount).toFixed(2)} MAD
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Completed
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
