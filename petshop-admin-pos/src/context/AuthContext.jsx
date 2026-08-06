/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse user_data from localStorage', e);
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        return null;
      }
    }
    return null;
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const data = response.data;

    const authToken = data.token || data.access_token || data.data?.token;
    const userData = data.user || data.data?.user || data.data;

    if (authToken) {
      localStorage.setItem('auth_token', authToken);
      setToken(authToken);
    }

    if (userData) {
      const normalizedUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        roles: Array.isArray(userData.roles)
          ? userData.roles
          : userData.role
          ? [userData.role]
          : [],
        ...userData,
      };

      localStorage.setItem('user_data', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    }

    return data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error on server:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getHomeRoute = (user) => {
  if (!user) return '/login';
  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : user.role
    ? [user.role]
    : [];

  const upperRoles = userRoles.map((r) => String(r).toUpperCase());

  if (upperRoles.includes('ADMIN')) return '/admin';
  if (upperRoles.includes('CAISSIER')) return '/pos';
  if (upperRoles.includes('MAGASINIER')) return '/inventory';

  return '/';
};

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : user.role
      ? [user.role]
      : [];

    const upperUserRoles = userRoles.map((r) => String(r).toUpperCase());
    const hasRole = allowedRoles.some((role) =>
      upperUserRoles.includes(String(role).toUpperCase())
    );

    if (!hasRole) {
      const homeRoute = getHomeRoute(user);
      return <Navigate to={homeRoute} replace />;
    }
  }

  return children ? children : <Outlet />;
};

