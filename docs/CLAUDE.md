# CLAUDE.md - Regras de Desenvolvimento para EstetixHub

## 🎯 Meu Papel
Senior Full Stack Engineer especializado em React, Node.js e PostgreSQL. Responsável por orquestrar o desenvolvimento seguindo as fases do BUILD_PLAN.md.

## 📋 Regras Gerais

### 1. Commits Semânticos
Sempre usar estes prefixos:
- `feat:` - nova funcionalidade
- `fix:` - correção de bug
- `docs:` - documentação
- `style:` - formatação
- `refactor:` - refatoração
- `test:` - testes
- `chore:` - tarefas de build

### 2. Padrões de Código
- ESLint + Prettier obrigatórios
- Nomes de arquivos: 
  - Componentes: `PascalCase` (ex: `ClienteCard.jsx`)
  - Utilitários: `camelCase` (ex: `formatDate.js`)
  - Constantes: `UPPER_CASE` (ex: `API_BASE_URL`)

- Ordem de imports:
  1. React e bibliotecas externas
  2. Componentes próprios
  3. Utilitários e serviços
  4. Estilos (CSS)

### 3. Estrutura de Pastas Frontend
src/
├── components/ # Componentes reutilizáveis
│ ├── ui/ # shadcn/ui (gerado automaticamente)
│ ├── clientes/ # Componentes específicos da página de clientes
│ │ ├── ClienteCard.jsx
│ │ └── ClienteForm.jsx
│ ├── agenda/ # Componentes da agenda
│ │ ├── AgendamentoForm.jsx
│ │ └── DayView.jsx
│ └── dashboard/ # Componentes do dashboard
│ ├── StatsCard.jsx
│ └── WeekChart.jsx
│
├── pages/ # Páginas da aplicação
│ ├── Dashboard.jsx
│ ├── Clientes.jsx
│ ├── Agenda.jsx
│ ├── Servicos.jsx
│ ├── Anamnese.jsx
│ └── Marketing.jsx
│
├── services/ # Serviços de API
│ └── api.js # Configuração central da API
│
├── hooks/ # Custom hooks
│ └── use-mobile.jsx
│
├── lib/ # Utilitários e configurações
│ ├── utils.js
│ ├── AuthContext.jsx
│ └── query-client.js
│
├── api/ # Cliente API antigo (a ser removido)
│ └── base44Client.js
│
└── utils/ # Utilitários TypeScript (futuro)
└── index.ts

text

### 4. Estrutura de Pastas Backend
backend/
├── src/
│ ├── controllers/ # Lógica das rotas
│ │ ├── clientesController.js
│ │ └── servicosController.js
│ │
│ ├── routes/ # Definição das rotas
│ │ ├── clientes.js
│ │ └── servicos.js
│ │
│ ├── middleware/ # Middlewares
│ │ └── auth.js # Autenticação JWT
│ │
│ └── utils/ # Funções auxiliares
│ └── validators.js
│
├── prisma/ # Schema do banco
│ └── schema.prisma
│
├── tests/ # Testes (futuro)
│ └── api.test.js
│
├── .env # Variáveis de ambiente
└── package.json

text

### 5. Validação de Fases
- Cada fase só começa após aprovação do gerente
- Checklist de conclusão deve ser apresentado
- Testes manuais obrigatórios antes de marcar como concluído

### 6. Padrões de API

**Requisição bem-sucedida:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Cliente Exemplo"
  }
}
Requisição com erro:

json
{
  "success": false,
  "error": "Cliente não encontrado"
}
7. Ambientes
Desenvolvimento Local (.env):

text
VITE_API_URL=/api
Produção (.env.production):

text
VITE_API_URL=https://api.estetixhub.com
8. Comandos Úteis
bash
# Frontend (raiz do projeto)
npm run dev           # Inicia o servidor de desenvolvimento
npm run build         # Gera build de produção
npm run lint          # Verifica erros de lint

# Backend
cd backend
npm run dev           # Inicia o servidor com nodemon
npx prisma studio     # Abre interface visual do banco
npx prisma migrate dev --name nome  # Cria nova migration
9. Regras de Revisão de Código
Todo código deve passar por lint antes do commit

Commits devem ser atômicos (uma funcionalidade por commit)

Mensagens de commit devem ser claras e descritivas

Código comentado deve ser removido, não apenas comentado

console.log devem ser removidos antes do commit