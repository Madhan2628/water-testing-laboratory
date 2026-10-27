import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wtlms_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('wtlms_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('wtlms_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          const data = res.data.data || res.data;
          const currentUser = data.user || data;
          setUser(currentUser);
          localStorage.setItem('wtlms_user', JSON.stringify(currentUser));
        } catch (err) {
          console.error('[AuthContext] Session expired or invalid:', err.message);
          localStorage.removeItem('wtlms_token');
          localStorage.removeItem('wtlms_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const payload = res.data.data || res.data;
    const tokenVal = payload.token;
    const userVal = {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName || payload.name,
      role: payload.role,
      phone: payload.phone,
      organization: payload.organization
    };

    localStorage.setItem('wtlms_token', tokenVal);
    localStorage.setItem('wtlms_user', JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
    return userVal;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const payload = res.data.data || res.data;
    const tokenVal = payload.token;
    const userVal = {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName || payload.name,
      role: payload.role,
      phone: payload.phone,
      organization: payload.organization
    };

    localStorage.setItem('wtlms_token', tokenVal);
    localStorage.setItem('wtlms_user', JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
    return userVal;
  };

  const logout = () => {
    localStorage.removeItem('wtlms_token');
    localStorage.removeItem('wtlms_user');
    setToken(null);
    setUser(null);
  };

  const role = user?.role || '';
  const isAdmin = role === 'ROLE_ADMIN' || role === 'admin';
  const isStaff = role === 'ROLE_LABORATORY_STAFF' || role === 'technician' || role === 'staff' || role === 'compliance_officer';
  const isCustomer = role === 'ROLE_CUSTOMER' || role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isStaff,
        isCustomer,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
