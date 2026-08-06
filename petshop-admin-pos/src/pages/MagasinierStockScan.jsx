import { useState, useCallback, useEffect } from 'react';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import axios from '../api/axios';
import { 
  Barcode, 
  PackagePlus, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Loader2,
  Truck,
  FileText
} from 'lucide-react';

export default function MagasinierStockScan() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [supplierId, setSupplierId] = useState('');
  const [blNumber, setBlNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Fetch Suppliers List for Dropdown
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

  // 1. Fetch Product details from API when barcode is scanned or entered manually
  const fetchProduct = async (code) => {
    if (!code) return;
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await axios.get(`/stock/barcode/${code}`);
      if (response.data.status === 'not_found' || !response.data.data) {
        setScannedProduct(null);
        setFeedback({
          type: 'error',
          message: response.data.message || `Aucun produit trouvé avec le code: ${code}`,
        });
      } else {
        setScannedProduct(response.data.data);
        setBarcodeInput(code);
        setQuantityToAdd(1); // Reset default quantity to 1
      }
    } catch (err) {
      setScannedProduct(null);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || `Aucun produit trouvé avec le code: ${code}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Global Scanner Hardware Listener (Auto-triggers on Scanner "BIP")
  const handleHardwareScan = useCallback((scannedBarcode) => {
    fetchProduct(scannedBarcode);
  }, []);

  useBarcodeScanner(handleHardwareScan);

  // 3. Submit Scan-In Stock Entry to Backend (MySQL DB Transaction)
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!scannedProduct || quantityToAdd < 1) return;

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await axios.post('/stock/scan-in', {
        barcode: scannedProduct.barcode,
        quantity: parseInt(quantityToAdd, 10),
        supplier_id: supplierId || null,
        bl_number: blNumber || null,
        notes: notes || 'Entrée de stock via Magasinier App',
      });

      const updatedProduct = response.data.data.product;

      // Update Local State with New Stock Quantity preserving prices & category
      setScannedProduct((prev) => ({
        ...prev,
        ...updatedProduct,
      }));
      setFeedback({
        type: 'success',
        message: `+${quantityToAdd} unités ajoutées! Nouveau stock total: ${updatedProduct.stock_quantity}`,
      });

      // Reset Form fields for next scan
      setNotes('');
      setBlNumber('');
      setQuantityToAdd(1);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de la mise à jour du stock.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <PackagePlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Entrée de Stock (Magasinier)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Scannez le code-barres du produit pour alimenter le stock en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900/40 font-medium text-sm">
          <Barcode className="w-5 h-5 animate-pulse" />
          <span>Scanner Matériel Actif ⚡</span>
        </div>
      </div>

      {/* Manual Search & Feedback Alert */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); fetchProduct(barcodeInput); }} 
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Scanner ou saisir manuellement un Code-Barres..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 font-mono text-gray-800 dark:text-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-gray-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Rechercher'}
          </button>
        </form>

        {/* Global Feedback Alert Toast */}
        {feedback.message && (
          <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40' 
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>{feedback.message}</div>
          </div>
        )}
      </div>

      {/* Scanned Product Info & Stock Add Form */}
      {scannedProduct && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-slate-700">
          
          {/* Left Column: Product Real-Time Details & Stock Badge */}
          <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-slate-900/50">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-full">
                {scannedProduct.category?.name || 'Catégorie Générale'}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{scannedProduct.title}</h2>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">Code-barres: {scannedProduct.barcode}</p>
            </div>

            {/* Live Stock Counter Widget */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Actuel en Magasin</span>
              <div className="flex items-baseline justify-between">
                <span className={`text-4xl font-black ${
                  scannedProduct.stock_quantity <= scannedProduct.min_stock_alert 
                    ? 'text-amber-500' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {scannedProduct.stock_quantity} <span className="text-base font-normal text-gray-500 dark:text-gray-400">unités</span>
                </span>
                
                {scannedProduct.stock_quantity <= scannedProduct.min_stock_alert && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md">
                    <AlertTriangle className="w-3.5 h-3.5" /> Stock Bas
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700">
                <span className="text-gray-400 text-xs block">Prix d'Achat</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{scannedProduct.price_buy} DH</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700">
                <span className="text-gray-400 text-xs block">Prix de Vente POS</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{scannedProduct.price_sell} DH</span>
              </div>
            </div>
          </div>

          {/* Right Column: Restock Input Form */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Ajouter au Stock
            </h3>

            <form onSubmit={handleStockSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Quantité à Ajouter (+) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-lg text-gray-900 dark:text-white"
                />
              </div>

              {/* Fournisseur Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Fournisseur (Optionnel)
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 dark:text-white font-medium"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.company_name} {s.contact_name ? `(${s.contact_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* N° Bon de Livraison (BL) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  N° Bon de Livraison (BL) (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: BL-2026-99"
                  value={blNumber}
                  onChange={(e) => setBlNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-mono text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Remarques (Optionnel)
                </label>
                <textarea
                  rows="2"
                  placeholder="Ex: Arrivage partiel / carton endommagé..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || quantityToAdd < 1}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validation en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Valider l'Entrée de Stock
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
