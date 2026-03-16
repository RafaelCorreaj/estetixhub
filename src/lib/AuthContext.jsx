import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Função para armazenar token
const TOKEN_KEY = '@estetixhub:token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do token salvo
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Configurar token para próximas requisições
        // Você pode implementar um interceptor ou passar no header
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.login({ email, senha });
      
      // Salvar token
      localStorage.setItem(TOKEN_KEY, response.token);
      
      // Salvar usuário
      setUser(response.user);
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};