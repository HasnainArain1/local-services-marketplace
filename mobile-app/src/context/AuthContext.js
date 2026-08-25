/**
 * AuthContext — provides user state, login/signup/logout, and
 * auto-login on app start by checking AsyncStorage for an existing JWT.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, storeToken, clearToken, getToken, setOnUnauthorized } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // Called when a 401 is intercepted anywhere
  const handleUnauthorized = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(handleUnauthorized);
  }, [handleUnauthorized]);

  // Auto-login: check stored token on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const res = await authApi.me();
          setUser(res.data);
        }
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    await storeToken(res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (name, email, phone, password, role = 'customer') => {
    const res = await authApi.register({ name, email, phone, password, role });
    await storeToken(res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
