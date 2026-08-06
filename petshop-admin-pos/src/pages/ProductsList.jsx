import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Search, AlertTriangle, Loader2 } from 'lucide-react';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.get('/shop/products')
      .then((res) => {
        if (isMounted) {
          const list = res.data?.data?.data || res.data?.data || res.data || [];
          setProducts(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Fetch products error:', err);
          setError('Erreur lors du chargement des produits.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Catalogue Produits
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Liste complète des produits et niveaux de stock en magasin.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom ou code-barres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Chargement des produits...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl font-medium">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Produit</th>
                  <th className="py-3.5 px-6">Code-barres</th>
                  <th className="py-3.5 px-6">Catégorie</th>
                  <th className="py-3.5 px-6 text-center">Stock</th>
                  <th className="py-3.5 px-6 text-right">Prix Vente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{product.title}</td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-500 dark:text-gray-400">{product.barcode}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        {product.category?.name || '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-xs border ${
                            product.stock_quantity <= product.min_stock_alert
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40'
                          }`}
                        >
                          {product.stock_quantity}
                          {product.stock_quantity <= product.min_stock_alert && (
                            <AlertTriangle className="w-3.5 h-3.5 ml-1" />
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-gray-900 dark:text-white">
                        {parseFloat(product.price_sell || 0).toFixed(2)} DH
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
