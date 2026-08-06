import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Loader2, 
  RefreshCw,
  Store,
  Globe
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/admin/dashboard/stats');
      setData(response.data.data);
    } catch (err) {
      console.error('Dashboard Stats Error:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    axios.get('/admin/dashboard/stats')
      .then((response) => {
        if (isMounted) {
          setData(response.data.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Dashboard Stats Error:', err);
          setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="font-medium text-sm">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={fetchDashboardStats} 
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { kpis, low_stock_alerts, top_selling_products, recent_movements, sales_by_channel } = data || {
    kpis: { total_revenue: 0, today_revenue: 0, total_orders: 0, today_orders: 0, total_products: 0, low_stock_alerts_count: 0 },
    low_stock_alerts: [],
    top_selling_products: [],
    sales_by_channel: [],
    recent_movements: [],
  };

  const posSales = sales_by_channel?.find((s) => s.order_type === 'POS') || { count: 0, total: 0 };
  const webSales = sales_by_channel?.find((s) => s.order_type === 'WEB') || { count: 0, total: 0 };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Tableau de Bord Admin</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Aperçu en temps réel des ventes, du stock et des activités du magasin.</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl text-sm transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* 📊 1. Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Chiffre d'Affaires Total */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chiffre d'Affaires</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white">
            {parseFloat(kpis?.total_revenue || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-lg font-bold text-gray-500 dark:text-gray-400">DH</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
             Aujourd'hui: {parseFloat(kpis?.today_revenue || 0).toFixed(2)} DH
          </div>
        </div>

        {/* KPI 2: Total Commandes */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Commandes Totales</span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white">{kpis?.total_orders || 0}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Aujourd'hui: {kpis?.today_orders || 0} commandes
          </div>
        </div>

        {/* KPI 3: Total Produits */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Catalogue Produits</span>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white">{kpis?.total_products || 0}</div>
          <div className="text-xs text-gray-400 font-medium">Produits actifs en stock</div>
        </div>

        {/* KPI 4: Alertes Stock Bas */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alertes Stock Bas</span>
            <div className={`p-2.5 rounded-xl ${(kpis?.low_stock_alerts_count || 0) > 0 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-gray-50 dark:bg-slate-900 text-gray-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-black ${(kpis?.low_stock_alerts_count || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
            {kpis?.low_stock_alerts_count || 0}
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">Réapprovisionnement nécessaire</div>
        </div>

      </div>

      {/* 🛍️ Sales by Channel Widgets (POS vs E-Commerce) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base">Ventes Caisse (POS)</h4>
              <p className="text-xs text-gray-400">{posSales.count} ventes enregistrées en caisse</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-gray-900 dark:text-white">
              {parseFloat(posSales.total || 0).toFixed(2)} DH
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base">Ventes Web (E-Commerce)</h4>
              <p className="text-xs text-gray-400">{webSales.count} commandes sur la boutique web</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-gray-900 dark:text-white">
              {parseFloat(webSales.total || 0).toFixed(2)} DH
            </span>
          </div>
        </div>
      </div>

      {/* ⚠️ 2. Low Stock Alerts & Top Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Low Stock Alerts Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertes de Stock Bas
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Produits ayant atteint le seuil minimum de stock.</p>
            </div>
            <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full">
              {low_stock_alerts?.length || 0} Produits
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Produit</th>
                  <th className="py-3.5 px-6">Code-barres</th>
                  <th className="py-3.5 px-6 text-center">Stock Restant</th>
                  <th className="py-3.5 px-6 text-right">Prix Vente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {!low_stock_alerts || low_stock_alerts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400 font-medium">
                      Aucun produit en alerte de stock. Tout est sous contrôle! 👍
                    </td>
                  </tr>
                ) : (
                  low_stock_alerts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                      <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">{product.title}</td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-500 dark:text-gray-400">{product.barcode}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold px-2.5 py-1 rounded-lg text-xs border border-amber-200 dark:border-amber-900/40">
                          {product.stock_quantity} / Min {product.min_stock_alert}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white">
                        {parseFloat(product.price_sell || 0).toFixed(2)} DH
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 Col): Top Selling Products Ranking */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Top Produits Vendus
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Meilleures ventes enregistrées.</p>
          </div>

          <div className="space-y-4">
            {!top_selling_products || top_selling_products.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucune vente enregistrée pour le moment.</p>
            ) : (
              top_selling_products.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">
                      {item.product?.title || 'Produit Inconnu'}
                    </h4>
                    <span className="text-xs text-gray-400 font-mono">
                      Vendus: <strong className="text-gray-700 dark:text-gray-300">{item.total_sold} unités</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 block">
                      {parseFloat(item.total_revenue || 0).toFixed(2)} DH
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 📜 3. Audit Trail: Recent Stock Movements */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Historique Récent des Mouvements de Stock (Audit Trail)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Traçabilité complète des entrées (Magasinier) et sorties (POS / Caisse).</p>
          </div>
          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
            {recent_movements?.length || 0} Activités
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {!recent_movements || recent_movements.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Aucun mouvement de stock récent.</div>
          ) : (
            recent_movements.map((movement) => (
              <div key={movement.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                    movement.type === 'IN' 
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40' 
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                  }`}>
                    {movement.type === 'IN' ? '+ Entrée' : '- Sortie'}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      {movement.product?.title || `Produit #${movement.product_id}`}
                    </h4>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>Par: <strong className="text-gray-700 dark:text-gray-300">{movement.user?.name || 'Système'}</strong></span>
                      <span>•</span>
                      <span>Source: <strong className="text-gray-600 dark:text-gray-400">{movement.source}</strong></span>
                      {movement.notes && (
                        <>
                          <span>•</span>
                          <span className="italic truncate max-w-xs">{movement.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-extrabold text-base block ${
                    movement.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {movement.type === 'IN' ? `+${movement.quantity}` : `-${movement.quantity}`} unités
                  </span>
                  <span className="text-xs text-gray-400">
                    {movement.created_at ? new Date(movement.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
