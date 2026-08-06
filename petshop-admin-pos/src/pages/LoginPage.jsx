import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, user, token } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to respective home interface
  if (token && user) {
    const roles = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [];
    const upperRoles = roles.map((r) => String(r).toUpperCase());
    if (upperRoles.includes('ADMIN')) return <Navigate to="/admin" replace />;
    if (upperRoles.includes('CAISSIER')) return <Navigate to="/pos" replace />;
    if (upperRoles.includes('MAGASINIER')) return <Navigate to="/stock-entry" replace />;
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const loggedUser = res?.user || res?.data?.user || user;
      const roles = Array.isArray(loggedUser?.roles) ? loggedUser.roles : loggedUser?.role ? [loggedUser.role] : [];
      const upperRoles = roles.map((r) => String(r).toUpperCase());

      if (upperRoles.includes('ADMIN')) {
        navigate('/admin');
      } else if (upperRoles.includes('CAISSIER')) {
        navigate('/pos');
      } else if (upperRoles.includes('MAGASINIER')) {
        navigate('/stock-entry');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Identifiants invalides ou erreur de connexion au serveur.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-4">
            <Store className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Petshop POS & Admin</h2>
          <p className="mt-2 text-sm text-slate-400">Connectez-vous pour accéder à votre espace</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@petshop.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
