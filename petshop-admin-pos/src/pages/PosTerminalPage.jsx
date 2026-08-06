import { useState, useCallback } from 'react';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import api from '../api/axios';
import PosReceipt from '../components/PosReceipt';
import { 
  ShoppingCart, 
  CreditCard, 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search,
  Printer
} from 'lucide-react';

export default function PosTerminalPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  // 1. Fetch Product details by Barcode and add/increment in Cart
  const addProductToCart = async (barcode) => {
    if (!barcode) return;
    setLoading(true);
    setError(null);
    setSuccessOrder(null);

    try {
      const response = await api.get(`/stock/barcode/${barcode}`);
      if (response.data.status === 'not_found' || !response.data.data) {
        setError(response.data.message || `Produit introuvable avec le code-barres: ${barcode}`);
        setManualBarcode('');
        return;
      }

      const product = response.data.data;

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);

        if (existingItem) {
          if (existingItem.quantity + 1 > product.stock_quantity) {
            setError(`Stock insuffisant pour "${product.title}"! Disponible: ${product.stock_quantity}`);
            return prevCart;
          }
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          if (product.stock_quantity < 1) {
            setError(`"${product.title}" est en rupture de stock!`);
            return prevCart;
          }
          return [...prevCart, { ...product, quantity: 1 }];
        }
      });
      setManualBarcode('');
    } catch (err) {
      console.error('Scan Error:', err);
      setError(err.response?.data?.message || `Produit introuvable avec le code-barres: ${barcode}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Hardware Scanner Listener (Auto-triggers on Scanner BIP)
  const handleBarcodeScanned = useCallback((scannedBarcode) => {
    addProductToCart(scannedBarcode);
  }, []);

  useBarcodeScanner(handleBarcodeScanned);

  // 3. Quantity controls
  const incrementQuantity = (productId) => {
    setError(null);
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          if (item.quantity + 1 > item.stock_quantity) {
            setError(`Stock maximum disponible atteint (${item.stock_quantity}) pour "${item.title}".`);
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const decrementQuantity = (productId) => {
    setError(null);
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setError(null);
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setError(null);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price_sell) * item.quantity, 0);
  };

  // 4. Checkout Process (POST /pos/checkout)
  const handleCheckout = async (paymentMethod = 'CASH') => {
    if (cart.length === 0) return;

    setCheckoutLoading(true);
    setError(null);
    setSuccessOrder(null);

    const payload = {
      payment_method: paymentMethod,
      items: cart.map((item) => ({
        barcode: item.barcode,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await api.post('/pos/checkout', payload);
      const orderResult = response.data.data;

      setSuccessOrder(orderResult);
      setShowReceipt(true); // Open thermal receipt print modal automatically
      setCart([]); // Reset cart on successful checkout
    } catch (err) {
      console.error('Checkout Error:', err);
      setError(err.response?.data?.message || 'Erreur lors de la validation de la commande.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 🖨️ Thermal Receipt Printer Modal */}
      {showReceipt && successOrder && (
        <PosReceipt 
          orderData={successOrder} 
          onClose={() => setShowReceipt(false)} 
        />
      )}

      {/* Success Receipt Banner Toast */}
      {successOrder && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Vente Encaissée avec Succès!</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                Commande N° #{successOrder.order?.id} • Par {successOrder.caissier || 'Caissier'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mr-2">
              {parseFloat(successOrder.order?.total_amount || 0).toFixed(2)} DH
            </span>
            <button
              onClick={() => setShowReceipt(true)}
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:hover:bg-emerald-900/80 dark:text-emerald-200 font-bold rounded-xl text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimer Ticket
            </button>
            <button
              onClick={() => {
                setSuccessOrder(null);
                setShowReceipt(false);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              Nouvelle Vente
            </button>
          </div>
        </div>
      )}

      {/* Error Alert Toast */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 p-4 rounded-xl flex items-center justify-between text-rose-700 dark:text-rose-300 text-sm font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-xs font-bold underline hover:no-underline"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Cart Items & Manual Search Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header & Manual Barcode Search */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                Caisse / POS Terminal
              </h2>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Barcode className="w-4 h-4 animate-pulse" />
                Scanner Actif ⚡
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addProductToCart(manualBarcode);
              }}
              className="flex gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Scanner un code-barres ou rechercher un article..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
              </button>
            </form>
          </div>

          {/* Cart Table List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 pb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Panier en cours ({cart.length})</h3>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-4 h-4" />
                  Vider le panier
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-16 text-center text-gray-400 dark:text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
                <p className="font-medium text-base">Le panier est vide.</p>
                <p className="text-xs text-gray-400 mt-1">Scannez le code-barres d'un article pour démarrer l'encaissement.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-[450px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    
                    {/* Item Title & Barcode */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate text-base">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">Code: {item.barcode}</span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          Dispo: {item.stock_quantity}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Adjustment Controls */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-1">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg transition"
                        title="Diminuer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-extrabold text-gray-900 dark:text-white text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(item.id)}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg transition"
                        title="Augmenter"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          {item.quantity} x {parseFloat(item.price_sell).toFixed(2)} DH
                        </div>
                        <div className="text-base font-black text-gray-900 dark:text-white">
                          {(item.quantity * parseFloat(item.price_sell)).toFixed(2)} DH
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Checkout Sidebar Summary */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col justify-between space-y-6 h-full">
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b border-slate-800 pb-4 text-slate-200">
              Résumé du Paiement
            </h3>

            <div className="space-y-3 text-slate-400 text-sm">
              <div className="flex justify-between">
                <span>Nombre d'articles:</span>
                <span className="font-bold text-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mode de paiement:</span>
                <span className="font-bold text-emerald-400">Espèces (CASH)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total à Payer</span>
              <div className="text-4xl font-black text-emerald-400 mt-1">
                {calculateTotal().toFixed(2)} <span className="text-xl font-bold">DH</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCheckout('CASH')}
            disabled={cart.length === 0 || checkoutLoading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                <span>Valider & Encaisser (Cash)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
