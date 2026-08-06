import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  Settings, 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Share2, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';

export default function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    store_name: '',
    support_email: '',
    phone_number: '',
    address: '',
    store_description: '',
    facebook_url: '',
    instagram_url: '',
    logo_url: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Helper function to resolve absolute logo URL for relative backend paths
  const getLogoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 1. Fetch Store Settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/settings');
      const data = res.data?.data || {};
      setFormData({
        store_name: data.store_name || '',
        support_email: data.support_email || '',
        phone_number: data.phone_number || '',
        address: data.address || '',
        store_description: data.store_description || '',
        facebook_url: data.facebook_url || '',
        instagram_url: data.instagram_url || '',
        logo_url: data.logo_url || '',
      });
      setLogoPreview(data.logo_url || '');
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // 2. Submit Updated Settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const data = new FormData();
      data.append('store_name', formData.store_name);
      data.append('support_email', formData.support_email);
      data.append('phone_number', formData.phone_number);
      data.append('address', formData.address);
      data.append('store_description', formData.store_description);
      data.append('facebook_url', formData.facebook_url);
      data.append('instagram_url', formData.instagram_url);
      if (formData.logo_url) data.append('logo_url', formData.logo_url);
      if (logoFile) data.append('logo_file', logoFile);

      await axios.post('/admin/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFeedback({ type: 'success', message: 'Paramètres enregistrés avec succès!' });
      fetchSettings();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de la sauvegarde.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400 flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
        <span className="text-sm font-semibold">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-800 dark:text-emerald-400" />
            Paramètres de la boutique
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Gérez les informations qui apparaîtront sur les tickets de caisse POS et sur le site e-commerce.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-8">
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {feedback.message && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              {feedback.message}
            </div>
          )}

          {/* Section: Store Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">Store Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Store Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">Store Name *</label>
                <input
                  type="text"
                  required
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white"
                />
              </div>

              {/* Support Email */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">Support Email</label>
                <input
                  type="email"
                  value={formData.support_email}
                  onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white font-mono"
                />
              </div>

              {/* Phone Number */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white font-mono"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">Address (Affiché sur Ticket & Website)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white"
                />
              </div>

              {/* Store Description (Footer) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">Store Description (Footer Website)</label>
                <textarea
                  rows="3"
                  value={formData.store_description}
                  onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white resize-none"
                ></textarea>
              </div>

            </div>
          </div>

          {/* Section: Réseaux Sociaux */}
          <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              🔗 Réseaux Sociaux
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Facebook */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-blue-600" /> Lien Facebook
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs text-gray-900 dark:text-white"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-pink-600" /> Lien Instagram
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs text-gray-900 dark:text-white"
                />
              </div>

            </div>
          </div>

          {/* Section: Store Logo */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Store Logo</h3>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-900 dark:bg-slate-900 rounded-2xl flex items-center justify-center p-2 overflow-hidden border border-gray-200 dark:border-slate-700">
                {logoPreview ? (
                  <img src={getLogoUrl(logoPreview)} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=Logo'; }} />
                ) : (
                  <Store className="w-8 h-8 text-gray-400" />
                )}
              </div>

              <div className="space-y-2">
                <label className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer transition shadow-md">
                  <Upload className="w-4 h-4" />
                  Change Logo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <p className="text-[11px] text-gray-400">JPG, PNG or SVG. Max size 2MB.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm rounded-2xl transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer les Paramètres'}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
