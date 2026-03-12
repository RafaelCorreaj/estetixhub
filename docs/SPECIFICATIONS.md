
---

## 📁 **ARQUIVO: `docs/SPECIFICATIONS.md`**

```markdown
# SPECIFICATIONS.md - Especificações Técnicas do EstetixHub

## 1. Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.2 | Biblioteca principal |
| React Router DOM | 6.26 | Roteamento |
| Tailwind CSS | 3.4 | Estilização |
| shadcn/ui | - | Componentes de UI |
| React Hook Form | 7.54 | Formulários |
| Zod | 3.24 | Validação |
| Recharts | 2.15 | Gráficos |
| date-fns | 3.6 | Manipulação de datas |
| Vite | 6.1 | Build e dev server |

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 20.11.1 | Runtime |
| Express | 5.2 | Framework web |
| Prisma | 5.10 | ORM |
| PostgreSQL | 16 | Banco de dados |
| JWT | 9.0 | Autenticação |
| Bcrypt | 3.0 | Hash de senhas |

---

## 2. Models do Banco (Prisma)

### Model: usuarios
```prisma
model usuarios {
  id           String   @id @default(cuid())
  nome         String
  email        String   @unique
  senha        String
  telefone     String?
  perfil       String   @default("atendente") // admin, atendente, profissional
  especialidade String?
  ativo        Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}


Model: clientes
prisma
model clientes {
  id              String   @id @default(cuid())
  nome            String
  telefone        String
  email           String?
  data_nascimento DateTime?
  cpf             String?  @unique
  endereco        String?
  como_conheceu   String?
  observacoes     String?
  data_cadastro   DateTime @default(now())
  updated_at      DateTime @updatedAt
}
Model: servicos
prisma
model servicos {
  id                  String   @id @default(cuid())
  nome                String   @unique
  descricao           String?
  duracao_min         Int
  preco               Float
  comissao_percentual Float?
  cor_identificacao   String?
  ativo               Boolean  @default(true)
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
}
Model: agendamentos
prisma
model agendamentos {
  id                String   @id @default(cuid())
  cliente_id        String
  servico_id        String
  profissional_id   String
  data_hora_inicio  DateTime
  data_hora_fim     DateTime?
  status            String   @default("pendente")
  valor_total       Float?
  forma_pagamento   String?
  observacoes       String?
  lembrete_enviado  Boolean  @default(false)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}
Model: anamnese
prisma
model anamnese {
  id                  String   @id @default(cuid())
  cliente_id          String
  data_preenchimento  DateTime @default(now())
  alergias            String?
  medicamentos_em_uso String?
  cirurgias_previas   String?
  problemas_cardiacos Boolean? @default(false)
  diabetes            Boolean? @default(false)
  gestante            Boolean? @default(false)
  fumante             Boolean? @default(false)
  objetivo_tratamento String?
  observacoes_medicas String?
  preenchido          Boolean  @default(false)
}
3. API Endpoints Detalhados
Clientes
Listar todos os clientes

text
GET /api/clientes
Resposta:
{
  "success": true,
  "data": [
    {
      "id": "c864cfd0...",
      "nome": "Cliente Teste",
      "telefone": "(11) 99999-9999",
      "email": "teste@email.com"
    }
  ]
}
Buscar cliente por ID

text
GET /api/clientes/:id
Resposta:
{
  "success": true,
  "data": {
    "id": "c864cfd0...",
    "nome": "Cliente Teste",
    "telefone": "(11) 99999-9999",
    "email": "teste@email.com",
    "agendamentos": [...]
  }
}
Criar novo cliente

text
POST /api/clientes
Body:
{
  "nome": "Novo Cliente",
  "telefone": "(11) 88888-8888",
  "email": "novo@email.com"
}
Serviços
Listar serviços ativos

text
GET /api/servicos
Resposta:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "nome": "Limpeza de Pele",
      "preco": 150.00,
      "duracao_min": 60
    }
  ]
}
4. Configuração do Serviço de API (Frontend)
Arquivo: src/services/api.js
javascript
const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const api = {
  // Clientes
  getClientes: () => apiRequest('/clientes'),
  getCliente: (id) => apiRequest(`/clientes/${id}`),
  createCliente: (data) => apiRequest('/clientes', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  
  // Serviços
  getServicos: () => apiRequest('/servicos'),
  createServico: (data) => apiRequest('/servicos', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  
  // Agendamentos (futuro)
  getAgendamentos: (data) => apiRequest(`/agendamentos?data=${data}`),
};
5. Configuração do Proxy (Vite)
Arquivo: vite.config.js
javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
6. Variáveis de Ambiente
Frontend: .env
text
VITE_API_URL=/api
Backend: backend/.env
text
DATABASE_URL="postgresql://postgres:Inf0rmatica1@localhost:5432/estetixhub"
JWT_SECRET="chave-super-secreta-para-jwt-2026"
PORT=3000
7. Comandos Úteis
Desenvolvimento
bash
# Iniciar frontend (na raiz)
npm run dev

# Iniciar backend
cd backend
npm run dev

# Acessar banco via DBeaver
# Host: localhost
# Port: 5432
# Database: estetixhub
# User: postgres
# Pass: Inf0rmatica1@
Prisma
bash
# Criar nova migration
cd backend
npx prisma migrate dev --name nome_da_migracao

# Visualizar banco (web interface)
npx prisma studio

# Resetar banco (cuidado - apaga dados!)
npx prisma migrate reset
8. Checklist de Qualidade
Antes de entregar cada fase:
Código segue padrões ESLint

Nenhum console.log esquecido

Tratamento de erros implementado

Loading states nos componentes

Responsivo testado em mobile

Testes manuais realizados