import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('roadassist_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('roadassist_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('roadassist_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('roadassist_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('roadassist_token', res.token);
        localStorage.setItem('roadassist_user', JSON.stringify(res.user));
        toast.success(`Welcome back, ${res.user.name}!`);
        return res.user;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('roadassist_token', res.token);
        localStorage.setItem('roadassist_user', JSON.stringify(res.user));
        toast.success(res.message || 'Account created successfully!');
        return res.user;
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('roadassist_token');
    localStorage.removeItem('roadassist_user');
    toast.info('You have been logged out.');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.success && res.user) {
        const updated = { ...user, ...res.user };
        setUser(updated);
        localStorage.setItem('roadassist_user', JSON.stringify(updated));
        toast.success('Profile details updated!');
        return updated;
      }
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('roadassist_user', JSON.stringify(res.user));
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser
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
