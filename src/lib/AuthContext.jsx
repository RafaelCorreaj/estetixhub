import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    // MOCK: Simulando o carregamento das configurações do app (Substituir pela chamada à API real)
    setIsLoadingPublicSettings(true);
    setAuthError(null);
    
    setTimeout(() => {
      setAppPublicSettings({ id: 'mock-app-id', public_settings: {} });
      setIsLoadingPublicSettings(false);
      checkUserAuth();
    }, 300);
  };

  const checkUserAuth = async () => {
    // MOCK: Simulando um usuário autenticado (Substituir pela chamada `/api/auth/me`)
    setIsLoadingAuth(true);
    
    setTimeout(() => {
      setUser({
        id: 'user-mock-1',
        name: 'Administrador Local',
        email: 'admin@local.dev',
        role: 'admin'
      });
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    }, 300);
  };

  const logout = (shouldRedirect = true) => {
    // MOCK: Simulando logout
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Exemplo: window.location.href = '/login';
      console.log('Redirecionando para login...');
    }
  };

  const navigateToLogin = () => {
    // MOCK: Simulando redirecionamento
    // window.location.href = '/login';
    console.log('Navegando para login...');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
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
