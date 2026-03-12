
---

## 📁 **ARQUIVO: `docs/BUILD_PLAN.md`**

```markdown
# BUILD_PLAN.md - Plano de Desenvolvimento EstetixHub

## 🏗️ Visão Geral das Fases

| Fase | Nome | Complexidade | Modelo Sugerido | Status |
|------|------|--------------|-----------------|--------|
| 0 | Setup Inicial | Baixa | - | ✅ Concluído |
| 1 | Limpeza Base44 | Média | Sonnet | ⏳ Pendente |
| 2 | Backend API | Alta | Sonnet | ⏳ Pendente |
| 3 | Conexão Frontend | Alta | Sonnet | ⏳ Pendente |
| 4 | Autenticação | Média | Sonnet | ⏳ Pendente |
| 5 | Agendamentos | Alta | Sonnet | ⏳ Pendente |
| 6 | Anamnese Digital | Média | Sonnet | ⏳ Pendente |
| 7 | Marketing | Baixa | Haiku | ⏳ Pendente |
| 8 | Polimento PWA | Média | Sonnet | ⏳ Pendente |

---

## ✅ FASE 0: Setup Inicial (Concluído)

### O que foi feito
- [x] PostgreSQL 16 instalado e configurado
- [x] Prisma schema criado com 7 tabelas
- [x] Migrations aplicadas com sucesso
- [x] Servidor Express rodando na porta 3000
- [x] DBeaver conectado ao banco
- [x] Primeiro cliente inserido (ID: c864cfd0...)
- [x] Proxy configurado no Vite

---

## 🧹 FASE 1: Limpeza Base44

**Objetivo:** Remover todas as dependências do Base44 do frontend

### Checklist de Execução
- [ ] Identificar todos os arquivos com imports do Base44
- [ ] Criar arquivo `src/services/api.js` (já temos o código pronto)
- [ ] Substituir `base44.get()` por `api.getClientes()` em cada página
- [ ] Remover dependências `@base44/*` do `package.json`
- [ ] Testar navegação em todas as páginas

### Arquivos a serem modificados (11 arquivos)
src/api/base44Client.js
src/Layout.jsx
src/lib/AuthContext.jsx
src/lib/app-params.js
src/pages/Agenda.jsx
src/pages/Anamnese.jsx
src/pages/Clientes.jsx
src/pages/Dashboard.jsx
src/pages/Marketing.jsx
src/pages/Servicos.jsx
src/components/agenda/AgendamentoForm.jsx

text

### Critério de Aprovação
✅ Nenhum import de `@base44` no código  
✅ Página de Serviços funcionando com API própria  
✅ `npm run dev` rodando sem erros  
✅ Build de produção funcionando (`npm run build`)

---

## 🔧 FASE 2: Backend API

**Objetivo:** Completar todas as rotas CRUD

### Endpoints a Implementar

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/api/clientes` | Listar todos os clientes | ✅ Pronto |
| POST | `/api/clientes` | Criar novo cliente | ✅ Pronto |
| GET | `/api/clientes/:id` | Buscar cliente por ID | ⏳ |
| PUT | `/api/clientes/:id` | Atualizar cliente | ⏳ |
| DELETE | `/api/clientes/:id` | Remover cliente | ⏳ |
| GET | `/api/servicos` | Listar serviços | ✅ Pronto |
| POST | `/api/servicos` | Criar serviço | ✅ Pronto |
| GET | `/api/servicos/:id` | Buscar serviço | ⏳ |
| PUT | `/api/servicos/:id` | Atualizar serviço | ⏳ |
| DELETE | `/api/servicos/:id` | Desativar serviço | ⏳ |
| GET | `/api/agendamentos` | Listar agendamentos | ⏳ |
| POST | `/api/agendamentos` | Criar agendamento | ⏳ |
| POST | `/api/auth/login` | Login de usuário | ⏳ |
| POST | `/api/auth/register` | Registrar usuário | ⏳ |

### Critério de Aprovação
✅ Testes manuais com Postman/Thunder Client  
✅ Todas as rotas respondendo corretamente  
✅ Validações funcionando (campos obrigatórios)  
✅ Tratamento de erros adequado  

---

## 🔌 FASE 3: Conexão Frontend

**Objetivo:** Substituir dados mockados por dados reais do banco

### Ordem de Implementação
1. **Serviços** (mais simples - só lista)
2. **Clientes** (lista + formulário)
3. **Dashboard** (estatísticas reais)
4. **Agenda** (mais complexo)

### Exemplo de Substituição

**Antes (Base44):**
```javascript
import { base44 } from '@api/base44Client'

const clientes = await base44.get('/clientes')
Depois (nossa API):

javascript
import { api } from '../services/api'

const clientes = await api.getClientes()
Critério de Aprovação
✅ Página de Serviços mostrando dados do banco
✅ Página de Clientes listando cliente criado no DBeaver
✅ Dashboard com contagens reais
✅ Formulários criando registros no banco

🔐 FASE 4: Autenticação
Objetivo: Implementar login e controle de acesso

Tarefas
Tela de login (página pública)

Registro de novos usuários

JWT tokens no backend

Armazenamento do token no frontend (localStorage)

Rotas protegidas no frontend

Middleware de autenticação no backend

Logout

📅 FASE 5: Agendamentos
Objetivo: Funcionalidade principal de agenda

Tarefas
Calendário interativo (react-day-picker)

Modal de criação de agendamento

Validação de conflitos de horário

Visualização por dia/semana/mês

Lembretes automáticos (via WhatsApp - futuro)

📋 FASE 6: Anamnese Digital
Objetivo: Fichas de clientes

Tarefas
Formulário de anamnese

Link único para cliente preencher

Histórico de evolução

PDF da ficha preenchida

📱 FASE 7: Marketing
Objetivo: Disparos automáticos

Tarefas
Modelos de mensagem (templates)

Disparos de aniversário

Lembretes de consulta

Calendário de posts

✨ FASE 8: Polimento PWA
Objetivo: Experiência mobile e offline

Tarefas
PWA (instalável)

Offline mode

Notificações push

Performance optimizada

🗺️ Mapa de Paralelização
text
FASE 0: Setup ✅
    │
    ├──► FASE 1: Limpeza Base44 (Sonnet)
    │       └── (prepara o terreno)
    │
    └──► FASE 2: Backend API (Sonnet)
            └── define TODAS as interfaces
                    │
                    ├──► FASE 3: Conexão Frontend (Sonnet)
                    ├──► FASE 4: Autenticação (Sonnet)
                    ├──► FASE 5: Agendamentos (Sonnet)
                    ├──► FASE 6: Anamnese (Sonnet)
                    ├──► FASE 7: Marketing (Haiku)
                    └──► FASE 8: Polimento PWA (Sonnet)
