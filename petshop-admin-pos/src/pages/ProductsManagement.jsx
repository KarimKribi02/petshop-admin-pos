import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import BarcodeSticker from '../components/BarcodeSticker';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Barcode, 
  AlertTriangle, 
  X, 
  Loader2, 
  CheckCircle2, 
  Filter,
  Sparkles,
  Printer
} from 'lucide-react';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Sticker Print Modal State
  const [stickerProduct, setStickerProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    brand_id: '',
    barcode: '',
    title: '',
    description: '',
    price_buy: '',
    price_sell: '',
    stock_quantity: 0,
    min_stock_alert: 5,
    is_active: true,
  });

  // Function to generate a guaranteed unique sequential 12-digit barcode from backend API
  const generateBarcode = async () => {
    try {
      const res = await axios.get('/admin/products/generate-barcode');
      if (res.data?.barcode) {
        setFormData((prev) => ({ ...prev, barcode: res.data.barcode }));
        return;
      }
    } catch (err) {
      console.error('Error fetching unique barcode from API, falling back to local generator:', err);
    }

    // Local fallback if API call fails
    const prefix = '200';
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    const generatedCode = prefix + randomDigits;
    setFormData((prev) => ({ ...prev, barcode: generatedCode }));
  };

  // 1. Fetch Products, Categories & Brands
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProducts, resCategories, resBrands] = await Promise.all([
        axios.get('/shop/products?per_page=100'),
        axios.get('/shop/categories'),
        axios.get('/shop/brands'),
      ]);
      
      const prodList = resProducts.data?.data?.data || resProducts.data?.data || resProducts.data || [];
      const catList = resCategories.data?.data || resCategories.data || [];
      const brandList = resBrands.data?.data || resBrands.data || [];
      
      setProducts(Array.isArray(prodList) ? prodList : []);
      setCategories(Array.isArray(catList) ? catList : []);
      setBrands(Array.isArray(brandList) ? brandList : []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Hardware Barcode Scanner Support for Form Modal
  const handleHardwareScan = useCallback((scannedBarcode) => {
    if (isModalOpen) {
      setFormData((prev) => ({ ...prev, barcode: scannedBarcode }));
    }
  }, [isModalOpen]);

  useBarcodeScanner(handleHardwareScan);

  // Open Modal for Create or Edit
  const handleOpenModal = (product = null) => {
    setFeedback({ type: '', message: '' });
    if (product) {
      setEditingProduct(product);
      setFormData({
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        barcode: product.barcode || '',
        title: product.title || '',
        description: product.description || '',
        price_buy: product.price_buy || '',
        price_sell: product.price_sell || '',
        stock_quantity: product.stock_quantity ?? 0,
        min_stock_alert: product.min_stock_alert || 5,
        is_active: product.is_active ?? true,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        category_id: categories[0]?.id || '',
        brand_id: '',
        barcode: '',
        title: '',
        description: '',
        price_buy: '',
        price_sell: '',
        stock_quantity: 0,
        min_stock_alert: 5,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  // 3. Submit Form (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingProduct) {
        // Update
        await axios.put(`/admin/products/${editingProduct.id}`, formData);
        setFeedback({ type: 'success', message: 'Produit modifié avec succès!' });
      } else {
        // Create
        await axios.post('/admin/products', formData);
        setFeedback({ type: 'success', message: 'Produit ajouté au catalogue avec succès!' });
      }

      fetchData();
      setTimeout(() => setIsModalOpen(false), 1200);
    } catch (err) {
      console.error('Submit Error:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de l\'enregistrement du produit.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return;
    try {
      await axios.delete(`/admin/products/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  // Filter products by Search Term, Category & Brand
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.barcode && p.barcode.includes(searchTerm));
    
    const matchesCategory =
      !selectedCategory || String(p.category_id) === String(selectedCategory);

    const matchesBrand =
      !selectedBrand || String(p.brand_id) === String(selectedBrand);

    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Gestion du Catalogue Produits
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Ajoutez, modifiez ou gérez les prix, codes-barres et stickers thermiques de vos articles.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-5 h-5" />
          Nouveau Produit
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par Nom du produit ou Code-barres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 dark:text-white transition"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative w-full md:w-56">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 dark:text-white transition font-medium"
          >
            <option value="">Toutes les catégories</option>
            {categories
              .filter((c) => !c.parent_id)
              .map((parent) => {
                const children = categories.filter((c) => String(c.parent_id) === String(parent.id));
                if (children.length > 0) {
                  return (
                    <optgroup key={parent.id} label={parent.name}>
                      <option value={parent.id}>{parent.name} (Principale)</option>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          &nbsp;&nbsp;└─ {child.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                }
                return (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                );
              })}
          </select>
        </div>

        {/* Brand Filter Dropdown */}
        <div className="relative w-full md:w-56">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 dark:text-white transition font-medium"
          >
            <option value="">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="text-sm">Chargement du catalogue...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Produit</th>
                  <th className="py-4 px-6">Code-barres</th>
                  <th className="py-4 px-6">Catégorie</th>
                  <th className="py-4 px-6 text-center">Stock</th>
                  <th className="py-4 px-6 text-right">Prix Achat</th>
                  <th className="py-4 px-6 text-right">Prix Vente</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{product.title}</td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-500 dark:text-gray-400">{product.barcode}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md">
                            {product.category?.name || 'Général'}
                          </span>
                          {product.brand?.name && (
                            <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              {product.brand.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                          product.stock_quantity <= product.min_stock_alert 
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50' 
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {product.stock_quantity} hba
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-gray-500 dark:text-gray-400">{parseFloat(product.price_buy || 0).toFixed(2)} DH</td>
                      <td className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white">{parseFloat(product.price_sell || 0).toFixed(2)} DH</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Sticker Button */}
                          <button
                            onClick={() => setStickerProduct(product)}
                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-700 rounded-lg transition"
                            title="Imprimer Étiquette (Sticker)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📦 Modal: Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-700">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold">
                  {editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Scannez le code-barres ou saisissez manuellement les informations.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {feedback.message && (
                <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  feedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {feedback.message}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Barcode Field with Auto-Scanner & Generator */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                      Code-barres (Barcode) *
                    </label>
                    <button
                      type="button"
                      onClick={generateBarcode}
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1 transition underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Générer un Code-Barres Unique
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      placeholder="Scannez b douchette matériel OU cliki 3la Générer..."
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full pl-11 pr-28 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 font-mono text-sm font-bold text-gray-900 dark:text-white"
                    />
                    
                    <button
                      type="button"
                      onClick={generateBarcode}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-900/70 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-lg transition"
                    >
                      Générer ⚡
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-1">
                    Si le produit a un code-barres, scannez-le. Sinon, cliquez sur "Générer".
                  </p>
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Titre du Produit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Croquettes Chat Royal Canin 5kg"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-semibold text-gray-800 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 dark:text-white font-medium"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories
                      .filter((c) => !c.parent_id)
                      .map((parent) => {
                        const children = categories.filter((c) => String(c.parent_id) === String(parent.id));
                        if (children.length > 0) {
                          return (
                            <optgroup key={parent.id} label={parent.name}>
                              <option value={parent.id}>{parent.name} (Principale)</option>
                              {children.map((child) => (
                                <option key={child.id} value={child.id}>
                                  &nbsp;&nbsp;└─ {child.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        }
                        return (
                          <option key={parent.id} value={parent.id}>
                            {parent.name}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Marque
                  </label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 dark:text-white font-medium"
                  >
                    <option value="">Sélectionner une marque</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Stock Initial *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-bold text-gray-900 dark:text-white"
                  />
                </div>

                {/* Price Buy */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Prix d'Achat (DH) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={formData.price_buy}
                    onChange={(e) => setFormData({ ...formData, price_buy: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-semibold text-gray-800 dark:text-white"
                  />
                </div>

                {/* Price Sell */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Prix de Vente (DH) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="220.00"
                    value={formData.price_sell}
                    onChange={(e) => setFormData({ ...formData, price_sell: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-bold text-gray-900 dark:text-white"
                  />
                </div>

                {/* Min Stock Alert */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Alerte Stock Minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_stock_alert}
                    onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-semibold text-gray-800 dark:text-white"
                  />
                </div>

              </div>

              {/* Real Visual Barcode Lines & Thermal Sticker Preview in Modal */}
              {formData.barcode && (
                <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-2">
                    Aperçu de l'Étiquette & Code-Barres Visuel
                  </label>
                  <BarcodeSticker
                    productTitle={formData.title}
                    price={formData.price_sell}
                    barcode={formData.barcode}
                  />
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer le Produit'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 🖨️ Standalone Sticker Print Modal */}
      {stickerProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 border border-gray-100 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-purple-600" />
                Imprimer l'Étiquette
              </h3>
              <button
                onClick={() => setStickerProduct(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BarcodeSticker
              productTitle={stickerProduct.title}
              price={stickerProduct.price_sell}
              barcode={stickerProduct.barcode}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStickerProduct(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-xs transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
