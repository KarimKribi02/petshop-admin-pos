import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Image as ImageIcon 
} from 'lucide-react';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to handle relative storage paths
  const getCategoryImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    parent_id: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/shop/categories');
      setCategories(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    setFeedback({ type: '', message: '' });
    setImageFile(null);
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name || '',
        description: cat.description || '',
        image_url: cat.image || '',
        parent_id: cat.parent_id || '',
        is_active: cat.is_active ?? true,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image_url: '',
        parent_id: '',
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
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('is_active', formData.is_active ? '1' : '0');
      if (formData.parent_id) data.append('parent_id', formData.parent_id);
      if (formData.image_url) data.append('image', formData.image_url);
      if (imageFile) data.append('image_file', imageFile);

      if (editingCategory) {
        data.append('_method', 'PUT');
        await axios.post(`/admin/categories/${editingCategory.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFeedback({ type: 'success', message: 'Catégorie mise à jour!' });
      } else {
        await axios.post('/admin/categories', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFeedback({ type: 'success', message: 'Nouvelle catégorie créée!' });
      }

      fetchCategories();
      setTimeout(() => setIsModalOpen(false), 1000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de l\'enregistrement.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie "${cat.name}" ?`)) return;
    try {
      await axios.delete(`/admin/categories/${cat.id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de suppression.');
    }
  };

  // Filter Search
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top Parent Categories for Dropdown Selection
  const parentOptions = categories.filter(c => !c.parent_id);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-emerald-800 dark:text-emerald-400" />
            Categories Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Organize and manage your product catalog sections and subcategories.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow-lg cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add New Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
            <span className="text-sm">Loading categories...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Product Count</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const isChild = !!cat.parent_id;
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                        <td className="py-4 px-6">
                          <div className={`flex items-center gap-3 ${isChild ? 'pl-8' : ''}`}>
                            {/* Child Tree Line Visual */}
                            {isChild && <span className="text-gray-300 dark:text-slate-600 font-bold">└─</span>}
                            
                            {/* Image or Initials Avatar */}
                            {cat.image ? (
                              <img 
                                src={getCategoryImageUrl(cat.image)} 
                                alt={cat.name} 
                                className="w-9 h-9 rounded-full object-cover border border-gray-100 dark:border-slate-700" 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40?text=Cat'; }}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-200 dark:border-emerald-800">
                                {cat.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <span className="font-bold text-gray-900 dark:text-white block">{cat.name}</span>
                              {isChild && (
                                <span className="text-[11px] text-gray-400 font-medium">
                                  Child of {cat.parent?.name || 'Parent'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">
                          {cat.description || 'No description.'}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-700 dark:text-gray-300">
                          {cat.products_count || cat.productsCount || 0} products
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-400 font-mono">
                          {new Date(cat.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            cat.is_active ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg cursor-pointer transition" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(cat)} className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg cursor-pointer transition" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* 📦 Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in duration-150">
            
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Configure your category details and status.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {feedback.message && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {feedback.message}
                </div>
              )}

              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">CATEGORY NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Croquettes Chats, Accessoires..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">DESCRIPTION</label>
                <textarea
                  rows="3"
                  placeholder="Describe the category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-white resize-none"
                ></textarea>
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">IMAGE DE LA CATÉGORIE</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... ou téléverser ci-contre"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white"
                  />
                  <label className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                    <Upload className="w-4 h-4" />
                    Téléverser
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Parent Category Option */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">PARENT CATEGORY (OPTIONAL)</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white"
                >
                  <option value="">No Parent (Top Level)</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Active Status Switch */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <div>
                  <span className="block text-xs font-bold text-gray-800 dark:text-gray-200">Active Status</span>
                  <span className="text-[11px] text-gray-400">Visible on the storefront if active.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-emerald-700 rounded cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-xs hover:bg-gray-200 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCategory ? 'Save Changes' : 'Create Category')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
