import React from 'react';
import Barcode from 'react-barcode';

export default function BarcodeSticker({ productTitle, price, barcode }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
      
      {/* Printable Area */}
      <div id="printable-sticker" className="p-3 bg-white text-center border border-dashed border-gray-300 rounded-lg inline-block text-black">
        <h4 className="font-bold text-xs uppercase tracking-tight line-clamp-1 max-w-[200px]">
          {productTitle || 'NOM PRODUIT'}
        </h4>
        
        {/* Real Visual Barcode Lines */}
        {barcode ? (
          <Barcode 
            value={barcode} 
            width={1.5} 
            height={45} 
            fontSize={12} 
            margin={5}
          />
        ) : (
          <div className="text-xs text-gray-400 py-4">Pas de code-barres</div>
        )}

        <div className="font-extrabold text-sm mt-1">
          {price ? `${price} DH` : '-- DH'}
        </div>
      </div>

      {/* Print Button */}
      <button
        type="button"
        onClick={handlePrint}
        className="mt-3 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer"
      >
        🖨️ Imprimer L'Étiquette (Sticker)
      </button>

      {/* Print CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-sticker, #printable-sticker * {
            visibility: visible;
          }
          #printable-sticker {
            position: absolute;
            left: 0;
            top: 0;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
