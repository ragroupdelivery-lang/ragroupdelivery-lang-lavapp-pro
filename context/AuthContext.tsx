import React, { createContext, useState, useEffect } from 'react';
import { User, AuthContextType, AuthProviderProps } from '../types';
import * as api from '../services/api';
import { supabase } from '../services/supabaseClient';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const currentUser = await api.getSessionUser();
      setUser(currentUser);
      setLoading(false);
    };
    
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const currentUser = await api.getSessionUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const loggedInUser = await api.login(email, pass);
      setUser(loggedInUser); // Auth listener will also set this, but this is faster
      return loggedInUser;
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
