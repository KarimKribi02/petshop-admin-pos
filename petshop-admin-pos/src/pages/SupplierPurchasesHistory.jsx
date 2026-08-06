import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FileText, 
  Truck, 
  Search, 
  Calendar, 
  PackageCheck, 
  DollarSign, 
  User, 
  Loader2 
} from 'lucide-react';

export default function SupplierPurchasesHistory() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [blSearch, setBlSearch] = useState('');
  
  const [historyData, setHistoryData] = useState([]);
  const [totals, setTotals] = useState({ quantity: 0, cost: 0 });
  const [loading, setLoading] = useState(true);

  // 1. Fetch Suppliers list for dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get('/suppliers/list');
        setSuppliers(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Error fetching suppliers list:', err);
      }
    };
    fetchSuppliers();
  }, []);

  // 2. Fetch Purchases History based on filters
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSupplier) params.append('supplier_id', selectedSupplier);
      if (blSearch) params.append('bl_number', blSearch);

      const res = await axios.get(`/admin/suppliers/purchases-history?${params.toString()}`);
      const movements = res.data?.data?.movements?.data || res.data?.data?.data || [];
      
      setHistoryData(movements);

      // Calculate total quantity & total cost
      let totalQty = 0;
      let totalCost = 0;
      movements.forEach((m) => {
        const qty = m.quantity || 0;
        const buyPrice = m.product?.price_buy || 0;
        totalQty += qty;
        totalCost += qty * buyPrice;
      });

      setTotals({ quantity: totalQty, cost: totalCost });
    } catch (err) {
      console.error('Error fetching supplier history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedSupplier]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            Historique d'Achats & Entrées par Fournisseur
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Visualisez en détail toutes les livraisons de stock reçues (Bons de Livraison & Quantités).
          </p>
        </div>
      </div>

      {/* 📊 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Articles Reçus</span>
            <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {totals.quantity} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">unités</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Montant Total d'Achats (Valeur Stock)</span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {totals.cost.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-gray-500 dark:text-gray-400">DH</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 🔍 Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Supplier Selector Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Filter par Fournisseur
          </label>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-800 dark:text-white"
          >
            <option value="">Tous les Fournisseurs</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.company_name}</option>
            ))}
          </select>
        </div>

        {/* N° BL Search Input */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-gray-400" /> Recherche N° Bon de Livraison (BL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: BL-2026-99"
              value={blSearch}
              onChange={(e) => setBlSearch(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-mono text-gray-800 dark:text-white"
            />
            <button
              onClick={fetchHistory}
              className="px-4 bg-gray-900 dark:bg-amber-600 hover:bg-black dark:hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Filtrer
            </button>
          </div>
        </div>

        {/* Clear Filter Button */}
        <div className="flex items-end">
          <button
            onClick={() => { setSelectedSupplier(''); setBlSearch(''); }}
            className="w-full py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Réinitialiser les Filtres
          </button>
        </div>

      </div>

      {/* 📜 Purchases History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="text-sm">Chargement de l'historique...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Date & Magasinier</th>
                  <th className="py-4 px-6">Fournisseur</th>
                  <th className="py-4 px-6">N° Bon de Livraison (BL)</th>
                  <th className="py-4 px-6">Produit Reçu</th>
                  <th className="py-4 px-6 text-center">Quantité (+)</th>
                  <th className="py-4 px-6 text-right">Prix d'Achat U.</th>
                  <th className="py-4 px-6 text-right">Total Achats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {historyData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400">
                      Aucune entrée de stock enregistrée avec ces filtres.
                    </td>
                  </tr>
                ) : (
                  historyData.map((m) => {
                    const buyPrice = parseFloat(m.product?.price_buy || 0);
                    const totalLine = m.quantity * buyPrice;

                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-bold text-gray-900 dark:text-white block text-xs flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {new Date(m.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <User className="w-3 h-3" /> {m.user?.name || 'Magasinier'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-amber-800 dark:text-amber-400">
                          {m.supplier?.company_name || 'Fournisseur Inconnu'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                            {m.bl_number || m.notes || 'Sans BL'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-bold text-gray-900 dark:text-white block">{m.product?.title || 'Produit'}</span>
                            <span className="font-mono text-xs text-gray-400">{m.product?.barcode}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold px-3 py-1 rounded-lg text-xs border border-emerald-200 dark:border-emerald-800">
                            +{m.quantity} hba
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-gray-600 dark:text-gray-300 font-medium">
                          {buyPrice.toFixed(2)} DH
                        </td>
                        <td className="py-4 px-6 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {totalLine.toFixed(2)} DH
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
