import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Link as LinkIcon, 
  Rocket, 
  Image as ImageIcon 
} from 'lucide-react';

export default function BlogManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function for post image relative URLs
  const getPostImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category_name: 'CONSEILS CHATS',
    tags: '',
    status: 'PUBLISHED',
    published_at: new Date().toISOString().split('T')[0],
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/shop/posts');
      const data = res.data?.data?.data || res.data?.data || res.data || [];
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenModal = (post = null) => {
    setFeedback({ type: '', message: '' });
    setImageFile(null);
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        image_url: post.image || '',
        category_name: post.category_name || 'CONSEILS CHATS',
        tags: post.tags || '',
        status: post.status || 'PUBLISHED',
        published_at: post.published_at ? post.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      setPreviewUrl(post.image || '');
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image_url: '',
        category_name: 'CONSEILS CHATS',
        tags: '',
        status: 'PUBLISHED',
        published_at: new Date().toISOString().split('T')[0],
      });
      setPreviewUrl('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('slug', formData.slug);
      data.append('excerpt', formData.excerpt);
      data.append('content', formData.content);
      data.append('category_name', formData.category_name);
      data.append('tags', formData.tags);
      data.append('status', formData.status);
      data.append('published_at', formData.published_at);

      if (formData.image_url) data.append('image', formData.image_url);
      if (imageFile) data.append('image_file', imageFile);

      if (editingPost) {
        data.append('_method', 'PUT');
        await axios.post(`/admin/posts/${editingPost.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFeedback({ type: 'success', message: 'Article mis à jour avec succès!' });
      } else {
        await axios.post('/admin/posts', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFeedback({ type: 'success', message: 'Article publié avec succès!' });
      }

      fetchPosts();
      setTimeout(() => setIsModalOpen(false), 1000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de la publication.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Supprimer l'article "${post.title}" ?`)) return;
    try {
      await axios.delete(`/admin/posts/${post.id}`);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de suppression.');
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-800 dark:text-emerald-400" />
            Blog & Articles
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez le contenu éditorial et les conseils pour vos clients.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow-lg cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nouvel Article
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par titre ou contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
          />
        </div>
      </div>

      {/* Blog Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
            <span className="text-sm">Chargement des articles...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">ARTICLE</th>
                  <th className="py-4 px-6">CATÉGORIE</th>
                  <th className="py-4 px-6">AUTEUR</th>
                  <th className="py-4 px-6 text-center">STATUT</th>
                  <th className="py-4 px-6">DATE</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      Aucun article trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {post.image ? (
                            <img 
                              src={getPostImageUrl(post.image)} 
                              alt={post.title} 
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-slate-700" 
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40?text=Blog'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white block truncate max-w-xs">{post.title}</span>
                            <span className="text-[11px] text-gray-400 font-mono italic block truncate max-w-xs">
                              /blog/{post.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-md text-[10px] font-black uppercase">
                          {post.category_name || 'GÉNÉRAL'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-700 dark:text-gray-300 font-bold">
                        {post.author_name || 'Admin'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          post.status === 'PUBLISHED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-400 font-mono">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(post)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg cursor-pointer transition" title="Modifier">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(post)} className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg cursor-pointer transition" title="Supprimer">
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

      {/* Multi-Section Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700">
            
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {editingPost ? 'MODIFIER ARTICLE' : 'NOUVEL ARTICLE'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Structurez votre contenu pour un impact maximal.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {feedback.message && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {feedback.message}
                </div>
              )}

              {/* Section 1: Informations de base */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white border-l-4 border-emerald-800 dark:border-emerald-400 pl-2">
                  1. INFORMATIONS DE BASE
                </h4>
                
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-300 mb-1">TITRE DE L'ARTICLE *</label>
                  <input
                    type="text"
                    required
                    placeholder="Comment bien nourrir son chat au quotidien..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-300 mb-1">SLUG (URL)</label>
                  <input
                    type="text"
                    placeholder="comment-bien-nourrir-son-chat"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-300 mb-1">RÉSUMÉ COURT (EXCERPT)</label>
                  <textarea
                    rows="2"
                    placeholder="Une brève description pour accrocher vos lecteurs..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Section 2: Contenu principal */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white border-l-4 border-emerald-800 dark:border-emerald-400 pl-2">
                  2. CONTENU PRINCIPAL
                </h4>
                <textarea
                  rows="6"
                  required
                  placeholder="Rédigez le corps de votre article..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-white font-sans"
                ></textarea>
              </div>

              {/* Section 3: Média à la une */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white border-l-4 border-emerald-800 dark:border-emerald-400 pl-2">
                  3. MÉDIA À LA UNE
                </h4>
                <div className="border-2 border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl text-center space-y-3">
                  <Upload className="w-8 h-8 text-emerald-700 dark:text-emerald-400 mx-auto" />
                  <span className="block text-xs font-bold text-gray-700 dark:text-gray-300">Cliquez ou glissez pour uploader une image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="text-xs text-gray-500 cursor-pointer"
                  />
                  <div className="text-[11px] text-gray-400">OU COLLER UNE URL</div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Section 4 & 5: Classification & Publication */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-300 mb-1">CATÉGORIE</label>
                  <select
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-800 dark:text-white"
                  >
                    <option value="CONSEILS CHATS">CONSEILS CHATS</option>
                    <option value="CONSEILS CHIENS">CONSEILS CHIENS</option>
                    <option value="NUTRITION">NUTRITION</option>
                    <option value="AQUARIOPHILIE">AQUARIOPHILIE</option>
                    <option value="CONSEILS OISEAUX">CONSEILS OISEAUX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-300 mb-1">ÉTAT DE L'ARTICLE</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-800 dark:text-white"
                  >
                    <option value="PUBLISHED">PUBLIÉ</option>
                    <option value="DRAFT">BROUILLON</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800 py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 uppercase cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Rocket className="w-4 h-4" /> PUBLIER MAINTENANT</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
