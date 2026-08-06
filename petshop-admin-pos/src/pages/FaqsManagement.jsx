import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Save 
} from 'lucide-react';

export default function FaqsManagement() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    is_active: true,
  });

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/shop/faqs');
      setFaqs(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (faq = null) => {
    setFeedback({ type: '', message: '' });
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        is_active: faq.is_active ?? true,
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
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
      if (editingFaq) {
        await axios.put(`/admin/faqs/${editingFaq.id}`, formData);
        setFeedback({ type: 'success', message: 'FAQ modifiée avec succès!' });
      } else {
        await axios.post('/admin/faqs', formData);
        setFeedback({ type: 'success', message: 'FAQ ajoutée avec succès!' });
      }

      fetchFaqs();
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

  const handleDelete = async (faq) => {
    if (!window.confirm('Voulez-vous supprimer cette question fréquemment posée ?')) return;
    try {
      await axios.delete(`/admin/faqs/${faq.id}`);
      fetchFaqs();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de suppression.');
    }
  };

  // Search Filter
  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
            GESTION DES <span className="text-emerald-700 dark:text-emerald-400">FAQS</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez les questions fréquentes de vos clients.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow-lg uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          AJOUTER UNE FAQ
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher dans les questions ou réponses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
          />
        </div>
      </div>

      {/* FAQs Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
            <span className="text-sm">Chargement des questions...</span>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="py-12 bg-white dark:bg-slate-800 rounded-2xl text-center text-gray-400 text-sm border border-gray-100 dark:border-slate-700">
            Aucune FAQ enregistrée pour le moment.
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-3 relative hover:border-gray-200 dark:hover:border-slate-600 transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <span className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                    faq.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'
                  }`}></span>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white italic">
                    {faq.question}
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(faq)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 rounded-full transition cursor-pointer"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq)}
                    className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 bg-gray-50 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-slate-600 rounded-full transition cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm italic pl-6 leading-relaxed">
                {faq.answer}
              </p>

              <div className="pl-6 pt-2 text-[11px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                CRÉÉ LE {new Date(faq.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in duration-150">
            
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-wider uppercase">
                {editingFaq ? 'MODIFIER FAQ' : 'NOUVELLE FAQ'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {feedback.message && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {feedback.message}
                </div>
              )}

              {/* Question Input */}
              <div>
                <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-300 tracking-wider mb-1.5">
                  QUESTION *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Livrez-vous à domicile ?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white"
                />
              </div>

              {/* Answer Textarea */}
              <div>
                <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-300 tracking-wider mb-1.5">
                  RÉPONSE *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Décrivez la réponse en détail..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-white resize-none"
                ></textarea>
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="faq_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600 cursor-pointer"
                />
                <label htmlFor="faq_is_active" className="text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer">
                  Question Active (Visible sur le site)
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> ENREGISTRER</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
