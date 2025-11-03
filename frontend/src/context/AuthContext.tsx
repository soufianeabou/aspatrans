import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

type User = {
  id: number;
  email: string;
  role: 'business' | 'admin' | 'driver' | 'transport_company';
  full_name: string;
  phone?: string | null;
  company_name?: string | null;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; role: User['role']; full_name: string; phone?: string; company_name?: string; }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('token');
      if (stored) {
        setToken(stored);
        await refreshProfileInternal(stored);
      }
    })();
  }, []);

  async function refreshProfileInternal(tk: string) {
    try {
      const { data } = await api.get('/api/auth/profile');
      setUser(data.user);
    } catch {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/api/auth/login', { email, password });
    setUser(data.user);
    setToken(data.token);
    await AsyncStorage.setItem('token', data.token);
  }

  async function register(payload: { email: string; password: string; role: User['role']; full_name: string; phone?: string; company_name?: string; }) {
    const { data } = await api.post('/api/auth/register', payload);
    setUser(data.user);
    setToken(data.token);
    await AsyncStorage.setItem('token', data.token);
  }

  async function logout() {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
  }

  async function refreshProfile() {
    if (token) await refreshProfileInternal(token);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


