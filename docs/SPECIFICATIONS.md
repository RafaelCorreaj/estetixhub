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
| React Query | 5.84 | Gerenciamento de estado |
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


## 2. Models do Banco (Prisma)

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

model agendamentos {
  id                String   @id @default(cuid())
  cliente_id        String
  servico_id        String
  profissional_id   String
  data_hora_inicio  DateTime
  data_hora_fim     DateTime?
  status            String   @default("pendente") // pendente, confirmado, concluido, cancelado
  valor_total       Float?
  forma_pagamento   String?
  observacoes       String?
  lembrete_enviado  Boolean  @default(false)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}

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

model posts_marketing {
  id              String   @id @default(cuid())
  titulo          String
  descricao       String?
  data_programada DateTime?
  rede_social     String?
  status          String   @default("rascunho") // rascunho, programado, publicado
  imagem_url      String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model modelos_mensagem {
  id           String   @id @default(cuid())
  nome         String   @unique
  mensagem     String   // Suporta {nome_cliente}, {data}, {hora}
  tipo_disparo String   // automatico, manual
  trigger_dias Int?
  ativo        Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}

3. API Endpoints (Completos)
Clientes
text
GET    /api/clientes     # Lista todos
GET    /api/clientes/:id # Busca um
POST   /api/clientes     # Cria novo
PUT    /api/clientes/:id # Atualiza
DELETE /api/clientes/:id # Remove
Serviços
text
GET    /api/servicos      # Lista ativos
GET    /api/servicos/:id  # Busca um
POST   /api/servicos      # Cria novo
PUT    /api/servicos/:id  # Atualiza
DELETE /api/servicos/:id  # Desativa
Agendamentos
text
GET    /api/agendamentos?data=...  # Filtra por data
GET    /api/agendamentos/:id       # Busca um
POST   /api/agendamentos            # Cria novo
PUT    /api/agendamentos/:id        # Atualiza
PATCH  /api/agendamentos/:id/cancel # Cancela
Anamnese
text
GET    /api/anamnese                    # Lista todas
GET    /api/anamnese/:id                 # Busca uma
GET    /api/anamnese/cliente/:clienteId  # Busca por cliente
POST   /api/anamnese                     # Cria nova
PUT    /api/anamnese/:id                  # Atualiza
DELETE /api/anamnese/:id                  # Remove
Marketing
text
GET    /api/marketing/posts        # Lista posts
POST   /api/marketing/posts        # Cria post
PUT    /api/marketing/posts/:id    # Atualiza post
DELETE /api/marketing/posts/:id    # Remove post

GET    /api/marketing/modelos      # Lista modelos
POST   /api/marketing/modelos      # Cria modelo
PUT    /api/marketing/modelos/:id  # Atualiza modelo
DELETE /api/marketing/modelos/:id  # Remove modelo
Usuários
text
GET    /api/usuarios           # Lista usuários
GET    /api/usuarios/:id       # Busca um
POST   /api/usuarios           # Cria usuário
PUT    /api/usuarios/:id       # Atualiza
Autenticação
text
POST   /api/auth/login         # Login
POST   /api/auth/register      # Registro
GET    /api/auth/me            # Dados do usuário atual
POST   /api/auth/change-password # Alterar senha


4. Configuração do Frontend
Serviço de API (src/services/api.js)
javascript
const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('@estetixhub:token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...defaultOptions, ...options });
  const data = await response.json();
  
  if (!response.ok) throw new Error(data.error);
  return data;
}

export const api = {
  // ... todos os métodos
};
Proxy Vite (vite.config.js)
javascript
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}


5. Variáveis de Ambiente
Frontend (.env)
text
VITE_API_URL=/api
Backend (backend/.env)
text
DATABASE_URL="postgresql://postgres:senha@localhost:5432/estetixhub"
JWT_SECRET="chave-super-secreta"
PORT=3000


6. Próximas Implementações (FASE 5)
Melhorias na Agenda
Drag-and-drop para remarcar

Visualização semanal

Conflitos de horário em tempo real

Integração com WhatsApp para lembretes

Relatórios
Gerar PDF da agenda

Estatísticas de atendimentos

Relatório de comissões