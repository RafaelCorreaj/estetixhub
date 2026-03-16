import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AnamnesePublica from './pages/AnamnesePublica';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Agenda from './pages/Agenda';
import Servicos from './pages/Servicos';
import Anamnese from './pages/Anamnese';
import Marketing from './pages/Marketing';
import Configuracoes from './pages/Configuracoes';
import Layout from './Layout';

// Se você criou a página pública, descomente a linha abaixo
// import AnamnesePublica from './pages/AnamnesePublica';

// Rota protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas PÚBLICAS - fora do ProtectedRoute */}
      <Route path="/login" element={<Login />} />
      <Route path="/anamnese/publica/:token" element={<AnamnesePublica />} />
      
      {/* Rotas PROTEGIDAS - dentro do ProtectedRoute */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="anamnese" element={<Anamnese />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;