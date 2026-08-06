import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  PackagePlus, 
  Package, 
  LogOut, 
  User, 
  Users as UsersIcon,
  Award,
  Truck,
  FileText,
  FolderTree,
  HelpCircle,
  Settings as SettingsIcon,
  Store, 
  Menu, 
  X 
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    axios.get('/settings').then(res => {
      if (res.data?.data) {
        setStoreSettings(res.data.data);
      }
    }).catch(err => console.error('Error fetching settings for Layout:', err));
  }, []);

  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : [];

  const upperRoles = userRoles.map((r) => String(r).toUpperCase());
  const isAdmin = upperRoles.includes('ADMIN');
  const isCaissier = upperRoles.includes('CAISSIER');
  const isMagasinier = upperRoles.includes('MAGASINIER');

  const navItems = [
    {
      label: 'Tableau de bord',
      path: '/admin',
      icon: LayoutDashboard,
      show: isAdmin,
    },
    {
      label: 'Terminal POS (Caisse)',
      path: '/pos',
      icon: ShoppingCart,
      show: isCaissier || isAdmin,
    },
    {
      label: 'Entrée Stock',
      path: '/stock-entry',
      icon: PackagePlus,
      show: isMagasinier || isAdmin,
    },
    {
      label: 'Liste des Produits',
      path: '/products',
      icon: Package,
      show: isAdmin,
    },
    {
      label: 'Catégories',
      path: '/categories',
      icon: FolderTree,
      show: isAdmin,
    },
    {
      label: 'Blog & Articles',
      path: '/blog',
      icon: FileText,
      show: isAdmin,
    },
    {
      label: 'Gestion FAQs',
      path: '/faqs',
      icon: HelpCircle,
      show: isAdmin,
    },
    {
      label: 'Gestion Personnel',
      path: '/users',
      icon: UsersIcon,
      show: isAdmin,
    },
    {
      label: 'Gestion des Marques',
      path: '/brands',
      icon: Award,
      show: isAdmin,
    },
    {
      label: 'Fournisseurs',
      path: '/suppliers',
      icon: Truck,
      show: isMagasinier || isAdmin,
    },
    {
      label: 'Historique Ventes',
      path: '/sales-history',
      icon: ShoppingCart,
      show: isCaissier || isAdmin,
    },
    {
      label: 'Historique Achats',
      path: '/purchases-history',
      icon: FileText,
      show: isMagasinier || isAdmin,
    },
    {
      label: 'Paramètres',
      path: '/settings',
      icon: SettingsIcon,
      show: isAdmin,
    },
  ].filter((item) => item.show);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const primaryRole = upperRoles[0] || 'USER';

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'CAISSIER':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'MAGASINIER':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-600';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 font-sans">
      
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100 dark:border-slate-800/80">
            <Link to="/admin" className="flex items-center space-x-3 overflow-hidden">
              {storeSettings?.logo_url ? (
                <img 
                  src={getLogoUrl(storeSettings.logo_url)} 
                  alt={storeSettings.store_name || 'Logo'} 
                  className="h-10 max-w-[160px] object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-800 rounded-2xl text-white shadow-sm">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    {storeSettings?.store_name || 'PETSHOP POS'}
                  </span>
                </div>
              )}
            </Link>
            <button
              type="button"
              className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="mt-6 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center space-x-3 border border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-full bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black flex items-center justify-center text-xs shrink-0 border border-emerald-300 dark:border-emerald-800">
              {user?.name?.substring(0, 2).toUpperCase() || 'AP'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Admin Principal'}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 block truncate">{primaryRole}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors border border-rose-100 dark:border-rose-900/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content & Top Navbar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="md:hidden text-gray-600 dark:text-gray-300 focus:outline-none"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {navItems.find((i) => i.path === location.pathname)?.label || 'Petshop Management'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Info & Role Badge */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 hidden sm:inline-block">
                {user?.name}
              </span>
              <span className={`px-2.5 py-1 text-xs font-black rounded-lg border uppercase ${getRoleBadgeStyle(primaryRole)}`}>
                {primaryRole}
              </span>
            </div>

            {/* Top Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition border border-rose-200 dark:border-rose-900/40"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
