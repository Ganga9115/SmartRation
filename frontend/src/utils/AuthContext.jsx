import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, rationCardAPI } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]             = useState(null);
  const [rationCard, setRationCard] = useState(null);
  const [token, setToken]           = useState(localStorage.getItem('smartration_token'));
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('smartration_token');
      if (savedToken) {
        try {
          const [userRes, cardRes] = await Promise.all([
            authAPI.getMe(),
            rationCardAPI.getMyCard().catch(() => ({ data: { card: null } })),
          ]);
          setUser(userRes.data.user);
          setRationCard(cardRes.data.card);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (userData, jwtToken) => {
    if (!jwtToken) {
      console.error('login() called without a token');
      return;
    }
    localStorage.setItem('smartration_token', jwtToken);
    localStorage.setItem('smartration_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  // ✅ logout was completely missing — this caused the crash too
  const logout = () => {
    localStorage.removeItem('smartration_token');
    localStorage.removeItem('smartration_user');
    setToken(null);
    setUser(null);
    setRationCard(null);
  };

  const refreshCard = async () => {
    try {
      const res = await rationCardAPI.getMyCard();
      setRationCard(res.data.card);
    } catch {
      setRationCard(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, rationCard, token, loading, login, logout, refreshCard, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);