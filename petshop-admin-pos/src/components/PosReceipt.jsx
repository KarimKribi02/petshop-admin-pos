import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, X } from 'lucide-react';
import axios from '../api/axios';

export default function PosReceipt({ orderData, onClose }) {
  const [storeSettings, setStoreSettings] = useState({
    store_name: 'PETSHOP BOUTIQUE',
    phone_number: '+212 6 00 00 00 00',
    address: 'Marrakech, Maroc',
    logo_url: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/settings');
        if (res.data?.data) {
          setStoreSettings(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching receipt store settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Helper for Logo Full Path
  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (!orderData) return null;

  const { order, caissier } = orderData;
  const items = order?.order_items || order?.items || [];
  const dateStr = new Date(order?.created_at || Date.now()).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Header Modal */}
        <div className="p-4 bg-gray-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Vente Réussie!</span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🖨️ Thermal Ticket Area */}
        <div className="p-4 bg-white text-black font-sans font-bold text-xs" id="thermal-receipt">
          
          {/* Header Store Info with Enlarged Prominent Logo */}
          <div className="text-center space-y-1 mb-2 border-b-2 border-black pb-2">
            
            {/* 🖼️ Enlarged Prominent Logo Header */}
            {storeSettings.logo_url && (
              <div className="flex justify-center mb-1">
                <img 
                  src={getLogoUrl(storeSettings.logo_url)} 
                  alt="Logo" 
                  className="w-auto h-20 max-h-24 max-w-[220px] object-contain filter grayscale contrast-200"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <h2 className="text-base font-black tracking-tight uppercase">
              {storeSettings.store_name}
            </h2>
            <p className="text-[10px] font-extrabold text-black">
              {storeSettings.address}
            </p>
            <p className="text-[10px] font-bold text-black">
              Tél: {storeSettings.phone_number}
            </p>
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-0.5 mb-2 text-[10px] border-b border-black pb-2">
            <div className="flex justify-between">
              <span>Ticket N°:</span>
              <span className="font-black">#{order?.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-bold">{dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span>Caissier:</span>
              <span className="font-bold">{caissier || 'Caisse 1'}</span>
            </div>
            <div className="flex justify-between">
              <span>Paiement:</span>
              <span className="font-black uppercase">{order?.payment_method || 'CASH'}</span>
            </div>
          </div>

          {/* Cart Table */}
          <table className="w-full text-left mb-2 border-b-2 border-black pb-2">
            <thead>
              <tr className="border-b border-black text-[9px] uppercase font-black">
                <th className="py-1">ARTICLE</th>
                <th className="py-1 text-center">QTÉ</th>
                <th className="py-1 text-right">P.U</th>
                <th className="py-1 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {items.map((item, idx) => (
                <tr key={idx} className="text-[10px] font-bold">
                  <td className="py-1 pr-1 font-black leading-tight">
                    {item.product?.title || item.title || 'Produit'}
                  </td>
                  <td className="py-1 text-center font-black">{item.quantity}</td>
                  <td className="py-1 text-right font-bold">{parseFloat(item.unit_price).toFixed(2)}</td>
                  <td className="py-1 text-right font-black">
                    {(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Net */}
          <div className="text-right text-xs mb-3 pt-1 border-t-2 border-black">
            <div className="flex justify-between items-center text-sm font-black">
              <span>TOTAL NET:</span>
              <span className="text-base font-black">{parseFloat(order?.total_amount || 0).toFixed(2)} DH</span>
            </div>
          </div>

          <div className="text-center text-[9px] font-extrabold space-y-0.5 pt-2 border-t border-dashed border-black">
            <p className="font-black uppercase">MERCI DE VOTRE VISITE !</p>
            <p>Les articles ne sont ni repris ni échangés sans ticket.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 print:hidden">
          <button onClick={onClose} className="w-1/2 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-xl text-xs cursor-pointer">
            Fermer
          </button>
          <button onClick={() => window.print()} className="w-1/2 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer">
            <Printer className="w-4 h-4" /> Imprimer
          </button>
        </div>

      </div>

      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 0mm; }
          body * { visibility: hidden; }
          #thermal-receipt, #thermal-receipt * { visibility: visible; }
          #thermal-receipt { position: absolute; left: 0; top: 0; width: 70mm !important; margin: 0; padding: 2mm 3mm; font-family: 'Arial', sans-serif !important; font-weight: 800 !important; color: #000000 !important; }
        }
      `}</style>
    </div>
  );
}
