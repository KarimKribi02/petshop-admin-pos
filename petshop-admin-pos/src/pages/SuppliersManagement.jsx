import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  Truck, Plus, Edit3, Trash2, Phone, Mail, MapPin, CheckCircle2, AlertTriangle, Loader2, X 
} from 'lucide-react';

export default function SuppliersManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    ice: '',
    is_active: true,
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/suppliers/list');
      setSuppliers(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (supplier = null) => {
    setFeedback({ type: '', message: '' });
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        company_name: supplier.company_name || '',
        contact_name: supplier.contact_name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        ice: supplier.ice || '',
        is_active: supplier.is_active ?? true,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        company_name: '',
        contact_name: '',
        phone: '',
        email: '',
        address: '',
        ice: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingSupplier) {
        await axios.put(`/admin/suppliers/${editingSupplier.id}`, formData);
        setFeedback({ type: 'success', message: 'Fournisseur mis à jour avec succès!' });
      } else {
        await axios.post('/admin/suppliers', formData);
        setFeedback({ type: 'success', message: 'Nouveau fournisseur enregistré!' });
      }

      fetchSuppliers();
      setTimeout(() => setIsModalOpen(false), 1200);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de l\'enregistrement.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Voulez-vous supprimer le fournisseur "${supplier.company_name}" ?`)) return;
    try {
      await axios.delete(`/admin/suppliers/${supplier.id}`);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de suppression.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Truck className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            Gestion des Fournisseurs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez le répertoire de vos fournisseurs et leurs coordonnées.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-amber-600/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nouveau Fournisseur
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="text-sm">Chargement des fournisseurs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Société (Fournisseur)</th>
                  <th className="py-4 px-6">Contact & Téléphone</th>
                  <th className="py-4 px-6">Email / Adresse</th>
                  <th className="py-4 px-6">ICE / N° Patente</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400">
                      Aucun fournisseur enregistré.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{s.company_name}</td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 block">{s.contact_name || 'N/A'}</span>
                          <span className="text-xs text-amber-700 dark:text-amber-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {s.phone}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600 dark:text-gray-300">
                        {s.email && <div className="flex items-center gap-1 font-mono"><Mail className="w-3 h-3 text-gray-400" /> {s.email}</div>}
                        {s.address && <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-0.5"><MapPin className="w-3 h-3 text-gray-400" /> {s.address}</div>}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-500 dark:text-gray-400">{s.ice || '---'}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenModal(s)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer" title="Modifier">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(s)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer" title="Supprimer">
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingSupplier ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {feedback.message && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {feedback.message}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Nom de la Société *</label>
                  <input type="text" required placeholder="Ex: Royal Canin Maroc SARL" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Personne de Contact</label>
                  <input type="text" placeholder="Ex: Mohamed Kribi" value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Téléphone *</label>
                  <input type="text" required placeholder="06XXXXXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-mono text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" placeholder="contact@supplier.ma" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-mono text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">ICE / N° Patente</label>
                  <input type="text" placeholder="0015XXXXXX" value={formData.ice} onChange={(e) => setFormData({ ...formData, ice: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-mono text-gray-900 dark:text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Adresse</label>
                  <input type="text" placeholder="Zone Industrielle Sidi Ghanem, Marrakech" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-xs hover:bg-gray-200 dark:hover:bg-slate-600 transition cursor-pointer">Annuler</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
