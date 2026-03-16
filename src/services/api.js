// src/services/api.js
// Serviço centralizado para chamadas à API

const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  // 🔐 PEGAR O TOKEN DO LOCALSTORAGE
  const token = localStorage.getItem('@estetixhub:token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // 🔐 ADICIONAR TOKEN NO HEADER SE EXISTIR
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Se a resposta for 204 (sem conteúdo), retorna vazio
    if (response.status === 204) {
      return null;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Erro HTTP: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const api = {
  // ========== CLIENTES ==========
  getClientes: () => apiRequest('/clientes'),
  
  getCliente: (id) => apiRequest(`/clientes/${id}`),
  
  createCliente: (cliente) => apiRequest('/clientes', {
    method: 'POST',
    body: JSON.stringify(cliente),
  }),
  
  updateCliente: (id, cliente) => apiRequest(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cliente),
  }),
  
  deleteCliente: (id) => apiRequest(`/clientes/${id}`, {
    method: 'DELETE',
  }),

  // ========== SERVIÇOS ==========
  getServicos: () => apiRequest('/servicos'),
  
  getServico: (id) => apiRequest(`/servicos/${id}`),
  
  createServico: (servico) => apiRequest('/servicos', {
    method: 'POST',
    body: JSON.stringify(servico),
  }),
  
  updateServico: (id, servico) => apiRequest(`/servicos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(servico),
  }),
  
  deleteServico: (id) => apiRequest(`/servicos/${id}`, {
    method: 'DELETE',
  }),

  // ========== AGENDAMENTOS ==========
  getAgendamentos: (data) => apiRequest(`/agendamentos${data ? `?data=${data}` : ''}`),
  
  getAgendamento: (id) => apiRequest(`/agendamentos/${id}`),
  
  createAgendamento: (agendamento) => apiRequest('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(agendamento),
  }),
  
  updateAgendamento: (id, agendamento) => apiRequest(`/agendamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(agendamento),
  }),
  
  deleteAgendamento: (id) => apiRequest(`/agendamentos/${id}`, {
    method: 'DELETE',
  }),

  // ========== ANAMNESE ==========
  gerarTokenAnamnese: (clienteId) => apiRequest(`/anamnese/token/${clienteId}`),

  validarTokenAnamnese: (token) => apiRequest(`/anamnese/publica/validar/${token}`),

  enviarAnamnesePublica: (token, data) => apiRequest(`/anamnese/publica/${token}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getAnamneses: () => apiRequest('/anamnese'),
  
  getAnamnese: (id) => apiRequest(`/anamnese/${id}`),
  
  getAnamneseByCliente: (clienteId) => apiRequest(`/anamnese/cliente/${clienteId}`),
  
  createAnamnese: (anamnese) => apiRequest('/anamnese', {
    method: 'POST',
    body: JSON.stringify(anamnese),
  }),
  
  updateAnamnese: (id, anamnese) => apiRequest(`/anamnese/${id}`, {
    method: 'PUT',
    body: JSON.stringify(anamnese),
  }),
  
  deleteAnamnese: (id) => apiRequest(`/anamnese/${id}`, {
    method: 'DELETE',
  }),

  // ========== MARKETING ==========
  getPosts: () => apiRequest('/posts-marketing'),
  
  getPost: (id) => apiRequest(`/posts-marketing/${id}`),
  
  createPost: (post) => apiRequest('/posts-marketing', {
    method: 'POST',
    body: JSON.stringify(post),
  }),
  
  updatePost: (id, post) => apiRequest(`/posts-marketing/${id}`, {
    method: 'PUT',
    body: JSON.stringify(post),
  }),
  
  deletePost: (id) => apiRequest(`/posts-marketing/${id}`, {
    method: 'DELETE',
  }),

  // ========== MODELOS DE MENSAGEM ==========
  getModelosMensagem: () => apiRequest('/modelos-mensagem'),
  
  getModeloMensagem: (id) => apiRequest(`/modelos-mensagem/${id}`),
  
  createModeloMensagem: (modelo) => apiRequest('/modelos-mensagem', {
    method: 'POST',
    body: JSON.stringify(modelo),
  }),
  
  updateModeloMensagem: (id, modelo) => apiRequest(`/modelos-mensagem/${id}`, {
    method: 'PUT',
    body: JSON.stringify(modelo),
  }),
  
  deleteModeloMensagem: (id) => apiRequest(`/modelos-mensagem/${id}`, {
    method: 'DELETE',
  }),

  // ========== USUÁRIOS / AUTENTICAÇÃO ==========
  getUsuarios: () => apiRequest('/usuarios'),
  
  getUsuario: (id) => apiRequest(`/usuarios/${id}`),
  
  createUsuario: (usuario) => apiRequest('/usuarios', {
    method: 'POST',
    body: JSON.stringify(usuario),
  }),
  
  updateUsuario: (id, usuario) => apiRequest(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(usuario),
  }),
  
  deleteUsuario: (id) => apiRequest(`/usuarios/${id}`, {
    method: 'DELETE',
  }),

  // ========== AUTENTICAÇÃO ==========
  getCurrentUser: () => apiRequest('/auth/me'),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // 🔐 NOVA FUNÇÃO PARA ALTERAR SENHA
  changePassword: (data) => apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export default api;