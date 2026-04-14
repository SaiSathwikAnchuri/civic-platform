import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginAPI, register as registerAPI, updateMe as updateMeAPI } from '../api/authAPI';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const STORAGE_KEY = 'civicfix_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
    catch { return null; }
  });

  const saveUser = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (credentials) => {
    const { data } = await loginAPI(credentials);
    saveUser(data.data);
    toast.success(`Welcome back, ${data.data.name}! 👋`);
    return data.data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await registerAPI(userData);
    saveUser(data.data);
    toast.success('Account created successfully! 🎉');
    return data.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { data } = await updateMeAPI(updates);
    const updated = { ...user, ...data.data };
    saveUser(updated);
    toast.success('Profile updated!');
    return data.data;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
