import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, rationCardAPI } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [rationCard, setRationCard] = useState(null);
  const [token, setToken]         = useState(localStorage.getItem('token'));
  const [loading, setLoading]     = useState(true);

  // On mount — if token exists, fetch fresh user + card data
  useEffect(() => {
    const init = async () => {
      if (token) {
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
  }, [token]);

  const login = (userData, jwtToken) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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