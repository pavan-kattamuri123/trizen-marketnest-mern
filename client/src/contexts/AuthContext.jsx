import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Try to load user from localStorage if it exists
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Apply token to axios headers when it changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Listeners for Axios Interceptor events
  useEffect(() => {
    const handleTokenRefreshed = (e) => {
      setToken(e.detail);
    };

    const handleTokenExpired = () => {
      logout();
    };

    window.addEventListener('accessTokenRefreshed', handleTokenRefreshed);
    window.addEventListener('refreshTokenExpired', handleTokenExpired);

    setLoading(false);

    return () => {
      window.removeEventListener('accessTokenRefreshed', handleTokenRefreshed);
      window.removeEventListener('refreshTokenExpired', handleTokenExpired);
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, ...userData } = res.data;
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password, role) => {
    const res = await api.post('/auth/signup', { name, email, password, role });
    const { accessToken, ...userData } = res.data;
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
