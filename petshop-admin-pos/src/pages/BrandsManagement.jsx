import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  Award,
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon 
} from 'lucide-react';

export default function BrandsManagement() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function inside BrandsManagement.jsx to handle relative storage paths
  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    // If it's a relative storage path from Laravel (e.g., /storage/brands/...)
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // 1. State for Form Data & File Upload
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    is_active: true,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/shop/brands');
      setBrands(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenForm = (brand = null) => {
    setFeedback({ type: '', message: '' });
    setLogoFile(null);
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name || '',
        logo_url: brand.logo || '',
        is_active: brand.is_active ?? true,
      });
      setPreviewUrl(brand.logo || '');
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        logo_url: '',
        is_active: true,
      });
      setPreviewUrl('');
    }
    setShowForm(true);
  };

  // Handle File Selection (Upload)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Show instant local preview
    }
  };

  // 2. Submit with FormData (Handles both URL & File Upload)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('is_active', formData.is_active ? '1' : '0');

      if (formData.logo_url) {
        data.append('logo', formData.logo_url);
      }

      if (logoFile) {
        data.append('logo_file', logoFile);
      }

      if (editingBrand) {
        // Laravel PUT method spoofing for multipart/form-data
        data.append('_method', 'PUT');
        await axios.post(`/admin/brands/${editingBrand.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFeedback({ type: 'success', message: 'Marque modifiée avec succès!' });
      } else {
        await axios.post('/admin/brands', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFeedback({ type: 'success', message: 'Marque ajoutée avec succès!' });
      }

      fetchBrands();
      setTimeout(() => setShowForm(false), 1200);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de l\'enregistrement.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (brand) => {
    if (!window.confirm(`Voulez-vous supprimer la marque "${brand.name}" ?`)) return;
    try {
      await axios.delete(`/admin/brands/${brand.id}`);
      fetchBrands();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de suppression.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            Gestion des Marques
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {brands.length} marque(s) enregistrée(s) au catalogue.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-700/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Marque
        </button>
      </div>

      {/* Form Area with Dual Option (File Upload OR URL) */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-5 animate-in fade-in zoom-in duration-150">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingBrand ? 'Modifier la Marque' : 'Ajouter une Marque'}
          </h3>

          {feedback.message && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                Nom de la marque *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Acana, Royal Canin, Hill's..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white"
              />
            </div>

            {/* Logo Options Container */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                Logo de la marque (Choisir une option)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Option 1: File Upload */}
                <div className="border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Importer un fichier image</span>
                  <span className="text-[11px] text-gray-400 mb-3">(PNG, JPG, WEBP, SVG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                  />
                </div>

                {/* Option 2: Image URL */}
                <div className="border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-4 rounded-xl space-y-2 flex flex-col justify-center">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                    OU Saisir une URL d'image
                  </span>
                  <input
                    type="url"
                    placeholder="https://exemple.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) => {
                      setFormData({ ...formData, logo_url: e.target.value });
                      if (!logoFile) setPreviewUrl(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-800 dark:text-white"
                  />
                </div>

              </div>

              {/* Logo Preview Badge */}
              {previewUrl && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Aperçu du Logo:</span>
                  <img 
                    src={getLogoUrl(previewUrl)} 
                    alt="Preview" 
                    className="h-10 max-w-[120px] object-contain rounded"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x40?text=No+Logo'; }} 
                  />
                </div>
              )}
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                Active (visible sur le site e-commerce)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-start gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingBrand ? 'Enregistrer' : 'Ajouter')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                Annuler
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
            <span className="text-sm">Chargement des marques...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Logo</th>
                  <th className="py-4 px-6">Nom</th>
                  <th className="py-4 px-6 text-center">Statut</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-400">
                      Aucune marque enregistrée.
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                      <td className="py-4 px-6">
                        {brand.logo ? (
                          <img 
                            src={getLogoUrl(brand.logo)} 
                            alt={brand.name} 
                            className="h-10 max-w-[100px] object-contain"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x40?text=No+Logo'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{brand.name}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          brand.is_active ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${brand.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                          {brand.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenForm(brand)} 
                            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(brand)} 
                            className="p-2 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition cursor-pointer"
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

    </div>
  );
}
