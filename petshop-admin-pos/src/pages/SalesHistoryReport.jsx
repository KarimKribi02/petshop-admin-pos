import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import PosReceipt from '../components/PosReceipt';
import { 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  User, 
  Printer, 
  Search, 
  Eye, 
  Loader2, 
  Filter, 
  Clock 
} from 'lucide-react';

export default function SalesHistoryReport() {
  const [orders, setOrders] = useState([]);
  const [caissiers, setCaissiers] = useState([]);
  const [selectedCaissier, setSelectedCaissier] = useState('');
  const [datePreset, setDatePreset] = useState('today'); // today, month, year, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [kpis, setKpis] = useState({ revenue: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  // Single Order Print State
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);

  // 1. Fetch Caissiers list for filtering
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get('/admin/users');
        setCaissiers(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Error fetching staff list:', err);
      }
    };
    fetchStaff();
  }, []);

  // 2. Fetch Sales History based on Caissier & Date filters
  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCaissier) params.append('user_id', selectedCaissier);
      
      if (datePreset !== 'custom') {
        params.append('preset', datePreset);
      } else if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      }

      const res = await axios.get(`/admin/sales/history?${params.toString()}`);
      const data = res.data?.data || {};
      
      setOrders(data.orders?.data || data.orders || []);
      setKpis({
        revenue: data.total_revenue || 0,
        count: data.total_orders_count || 0,
      });
    } catch (err) {
      console.error('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [selectedCaissier, datePreset]);

  // 🖨️ Batch Print All Tickets Handler
  const handleBatchPrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Historique des Ventes & Clôture de Caisse
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Consultez le chiffre d'affaires, filtrez par Caissier / Date, et imprimez les tickets.
          </p>
        </div>
        
        {/* 🖨️ Batch Print Button */}
        <button
          onClick={handleBatchPrint}
          disabled={orders.length === 0}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
        >
          <Printer className="w-5 h-5" />
          Imprimer Tous les Tickets ({orders.length})
        </button>
      </div>

      {/* 📊 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:hidden">
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chiffre d'Affaires Encaissé</span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {parseFloat(kpis.revenue).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-base font-bold text-gray-500 dark:text-gray-400">DH</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tickets / Commandes</span>
            <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {kpis.count} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">tickets</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <ShoppingBag className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* 🔍 Filters Bar (Caissier & Date Range) */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        
        {/* Filter by Caissier */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Filter par Caissier
          </label>
          <select
            value={selectedCaissier}
            onChange={(e) => setSelectedCaissier(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-800 dark:text-white"
          >
            <option value="">Tous les Caissiers (Global)</option>
            {caissiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({Array.isArray(c.roles) ? (c.roles[0]?.name || c.roles[0]) : (c.role || 'Staff')})
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter Presets */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Période d'Analyse
          </label>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-800 dark:text-white"
          >
            <option value="today">Aujourd'hui (Journalier)</option>
            <option value="month">Ce Mois-ci (Mensuel)</option>
            <option value="year">Cette Année (Annuel)</option>
            <option value="custom">Plage de Dates Personnalisée</option>
          </select>
        </div>

        {/* Custom Date Inputs (if selected) */}
        {datePreset === 'custom' ? (
          <div className="flex gap-2 items-end">
            <div>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-800 dark:text-white" />
            </div>
            <div>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-800 dark:text-white" />
            </div>
            <button onClick={fetchSalesData} className="px-4 py-2 bg-gray-900 dark:bg-emerald-600 text-white font-bold text-xs rounded-lg cursor-pointer">OK</button>
          </div>
        ) : (
          <div className="flex items-end">
            <button onClick={fetchSalesData} className="w-full py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-bold rounded-xl text-xs transition cursor-pointer">
              Actualiser
            </button>
          </div>
        )}

      </div>

      {/* 📜 Sales Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden print:hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm">Chargement des ventes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Ticket N°</th>
                  <th className="py-4 px-6">Date & Heure</th>
                  <th className="py-4 px-6">Caissier</th>
                  <th className="py-4 px-6">Articles</th>
                  <th className="py-4 px-6 text-right">Total Net</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      Aucune vente enregistrée pour cette période / caissier.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const items = order.order_items || order.orderItems || [];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                        <td className="py-4 px-6 font-black text-gray-900 dark:text-white">#{order.id}</td>
                        <td className="py-4 px-6 text-xs text-gray-600 dark:text-gray-300 font-mono">
                          {new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {order.user?.name || 'Caissier 1'}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-600 dark:text-gray-300 max-w-[250px] truncate">
                          {items.map(i => `${i.quantity}x ${i.product?.title || i.title || 'Produit'}`).join(', ')}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-emerald-600 dark:text-emerald-400 text-base">
                          {parseFloat(order.total_amount).toFixed(2)} DH
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setSelectedOrderForPrint({ order, caissier: order.user?.name })}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg font-bold text-xs flex items-center gap-1 mx-auto cursor-pointer transition"
                          >
                            <Printer className="w-4 h-4" /> Ticket
                          </button>
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

      {/* 🖨️ BATCH PRINT CONTAINER (STRICTLY OPTIMIZED FOR THERMAL PRINTERS 80MM) */}
      <div id="batch-print-tickets" className="hidden print:block space-y-0">
        {orders.map((ord) => (
          <div 
            key={ord.id} 
            className="ticket-page bg-white text-black font-sans font-extrabold text-[10px] leading-tight pb-3 mb-2 border-b-2 border-dashed border-black"
          >
            {/* Header */}
            <div className="text-center font-black uppercase text-xs">PETSHOP BOUTIQUE</div>
            <div className="text-center text-[9px] font-bold">Tél: +212 5 24 XX XX XX</div>
            <div className="border-b border-black my-1"></div>
            
            {/* Metadata */}
            <div className="flex justify-between">
              <span>Ticket N°:</span>
              <span className="font-black">#{ord.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(ord.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Caissier:</span>
              <span>{ord.user?.name || 'Caisse'}</span>
            </div>
            <div className="border-b border-black my-1"></div>

            {/* Items List */}
            <div className="space-y-1 my-1">
              {(ord.order_items || ord.orderItems || []).map((it, idx) => (
                <div key={idx} className="flex justify-between items-start text-[10px] font-black">
                  <span className="pr-1 leading-tight">
                    {it.quantity}x {it.product?.title || it.title || 'Produit'}
                  </span>
                  <span className="whitespace-nowrap">
                    {(it.quantity * parseFloat(it.unit_price)).toFixed(2)} DH
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t-2 border-black mt-1.5 pt-1 flex justify-between font-black text-xs">
              <span>TOTAL NET:</span>
              <span>{parseFloat(ord.total_amount).toFixed(2)} DH</span>
            </div>
          </div>
        ))}
      </div>

      {/* Single Ticket Print Modal */}
      {selectedOrderForPrint && (
        <PosReceipt
          orderData={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}

      {/* 🖨️ CSS RULES FOR BATCH PRINT */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0mm !important;
          }
          body * {
            visibility: hidden;
          }
          #batch-print-tickets, #batch-print-tickets * {
            visibility: visible;
          }
          #batch-print-tickets {
            position: absolute;
            left: 0;
            top: 0;
            width: 70mm !important;
            max-width: 70mm !important;
            padding: 2mm 3mm !important;
            box-sizing: border-box !important;
            font-family: 'Arial', sans-serif !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact;
          }
          .ticket-page {
            page-break-after: always;
            break-after: page;
            margin-bottom: 5mm;
          }
        }
      `}</style>

    </div>
  );
}
