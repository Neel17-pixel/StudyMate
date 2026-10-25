import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Purge any legacy persistent tokens so opening the link always requires explicit login
  try {
    localStorage.removeItem('studymate_token');
    localStorage.removeItem('studymate_user');
  } catch (e) {}

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem('studymate_token') || '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(Boolean(token));
  const [theme, setTheme] = useState(localStorage.getItem('studymate_theme') || 'dark');
  const { addToast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('studymate_theme', theme);
  }, [theme]);

  // Load current user profile if session token exists
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          if (res.user.theme) {
            setTheme(res.user.theme);
          }
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();

    const handleAutoLogout = () => logout();
    window.addEventListener('auth-logout', handleAutoLogout);
    return () => window.removeEventListener('auth-logout', handleAutoLogout);
  }, [token]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user) {
      api.updateProfile({ theme: nextTheme }).catch(() => {});
    }
  };

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.success && res.token) {
      sessionStorage.setItem('studymate_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.theme) setTheme(res.user.theme);
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      return res;
    }
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      sessionStorage.setItem('studymate_token', res.token);
      setToken(res.token);
      setUser(res.user);
      addToast('Welcome to StudyMate! Account created successfully.', 'success');
      return res;
    }
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    if (res.success && res.token) {
      sessionStorage.setItem('studymate_token', res.token);
      setToken(res.token);
      setUser(res.user);
      addToast('Logged in as Demo Student (Alex Chen)!', 'success');
      return res;
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('studymate_token');
      sessionStorage.removeItem('studymate_user');
      localStorage.removeItem('studymate_token');
      localStorage.removeItem('studymate_user');
    } catch {}
    setToken('');
    setUser(null);
    addToast('Logged out successfully.', 'info');
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      addToast('Profile updated!', 'success');
      return res;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        toggleTheme,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        isAuthenticated: Boolean(token && user)
      }}
    >
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
