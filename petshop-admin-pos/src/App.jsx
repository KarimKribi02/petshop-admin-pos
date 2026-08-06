import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PosTerminalPage from './pages/PosTerminalPage';
import StockEntryPage from './pages/StockEntryPage';
import ProductsManagement from './pages/ProductsManagement';
import UsersManagement from './pages/UsersManagement';
import BrandsManagement from './pages/BrandsManagement';
import SuppliersManagement from './pages/SuppliersManagement';
import SupplierPurchasesHistory from './pages/SupplierPurchasesHistory';
import SalesHistoryReport from './pages/SalesHistoryReport';
import CategoriesManagement from './pages/CategoriesManagement';
import StoreSettings from './pages/StoreSettings';
import FaqsManagement from './pages/FaqsManagement';
import BlogManagement from './pages/BlogManagement';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes wrapped in global Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Admin Dashboard: Accessible by ADMIN */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* POS Terminal: Accessible by CAISSIER & ADMIN */}
              <Route
                path="/pos"
                element={
                  <ProtectedRoute allowedRoles={['CAISSIER', 'ADMIN']}>
                    <PosTerminalPage />
                  </ProtectedRoute>
                }
              />

              {/* Stock Entry: Accessible by MAGASINIER & ADMIN */}
              <Route
                path="/stock-entry"
                element={
                  <ProtectedRoute allowedRoles={['MAGASINIER', 'ADMIN']}>
                    <StockEntryPage />
                  </ProtectedRoute>
                }
              />

              {/* Products Management: Accessible by ADMIN */}
              <Route
                path="/products"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ProductsManagement />
                  </ProtectedRoute>
                }
              />

              {/* Categories Management: Accessible by ADMIN */}
              <Route
                path="/categories"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <CategoriesManagement />
                  </ProtectedRoute>
                }
              />

              {/* Blog & Articles Management: Accessible by ADMIN */}
              <Route
                path="/blog"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <BlogManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <BlogManagement />
                  </ProtectedRoute>
                }
              />

              {/* FAQs Management: Accessible by ADMIN */}
              <Route
                path="/faqs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <FaqsManagement />
                  </ProtectedRoute>
                }
              />

              {/* Store Settings: Accessible by ADMIN */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <StoreSettings />
                  </ProtectedRoute>
                }
              />

              {/* Users Management: Accessible by ADMIN */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UsersManagement />
                  </ProtectedRoute>
                }
              />

              {/* Brands Management: Accessible by ADMIN */}
              <Route
                path="/brands"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <BrandsManagement />
                  </ProtectedRoute>
                }
              />

              {/* Suppliers Directory: Accessible by ADMIN & MAGASINIER */}
              <Route
                path="/suppliers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MAGASINIER']}>
                    <SuppliersManagement />
                  </ProtectedRoute>
                }
              />

              {/* Supplier Purchases History: Accessible by ADMIN & MAGASINIER */}
              <Route
                path="/purchases-history"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MAGASINIER']}>
                    <SupplierPurchasesHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers/history"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MAGASINIER']}>
                    <SupplierPurchasesHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers-history"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MAGASINIER']}>
                    <SupplierPurchasesHistory />
                  </ProtectedRoute>
                }
              />

              {/* Sales History & Clôture de Caisse: Accessible by ADMIN & CAISSIER */}
              <Route
                path="/sales-history"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'CAISSIER']}>
                    <SalesHistoryReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales/history"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'CAISSIER']}>
                    <SalesHistoryReport />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          {/* Root & Catch-all Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
