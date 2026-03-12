# Documentação de Autenticação (Mock)

## Contexto Atual
Durante a transição do Base44 para a nova arquitetura backend (Fase 1 de Limpeza Base44), a autenticação foi temporariamente simulada (`mockada`) no arquivo `src/lib/AuthContext.jsx`. Isso permite que o frontend continue funcionando sem erros enquanto as rotas de autenticação (como `/api/auth/me`) não são implementadas no backend.

## Como remover o Mock para Produção

Quando as rotas de autenticação reais estiverem prontas no backend:

1. **Importe a API:**
   Adicione `import { api } from '@/services/api';` em `src/lib/AuthContext.jsx`.

2. **Atualize `checkUserAuth`:**
   Substitua o setTimeout e o mock por uma chamada real à API para obter os dados do usuário atual:
   ```jsx
   const checkUserAuth = async () => {
     try {
       setIsLoadingAuth(true);
       const currentUser = await api.getMe(); // Criar esta função no services/api.js
       setUser(currentUser);
       setIsAuthenticated(true);
       setIsLoadingAuth(false);
     } catch (error) {
       console.error('Falha na autenticação do usuário:', error);
       setIsLoadingAuth(false);
       setIsAuthenticated(false);
       
       if (error.status === 401 || error.status === 403) {
         setAuthError({ type: 'auth_required', message: 'Autenticação necessária' });
       }
     }
   };
   ```

3. **Atualize `checkAppState`:**
   Faça chamadas reais se houver configurações públicas da aplicação para buscar, ou simplifique caso não seja mais necessário na nova arquitetura.

4. **Atualize `logout` e `navigateToLogin`:**
   Implemente a lógica real de limpeza de tokens locais (ex: `localStorage.removeItem('token')`) e redirecionamento de rotas com o React Router (`useNavigate`).
