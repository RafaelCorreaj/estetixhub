# EstetixHub - Sistema de Gestão para Clínicas de Estética

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)

Sistema completo de gestão para clínicas de estética e bem-estar, desenvolvido com React no frontend e Node.js no backend.

## 🚀 Tecnologias

### Frontend
- **React 18** + **Vite** - Build rápido e moderno
- **React Router DOM** - Navegação
- **Tailwind CSS** + **shadcn/ui** - Interface profissional
- **React Hook Form** + **Zod** - Formulários com validação
- **Recharts** - Gráficos interativos
- **React Query** - Gerenciamento de estado e cache

### Backend
- **Node.js** + **Express** - API REST
- **PostgreSQL** - Banco de dados relacional
- **Prisma ORM** - Type-safe queries e migrations
- **JWT** - Autenticação
- **Multer** - Upload de imagens

## 📋 Funcionalidades

- ✅ **Dashboard** - Visão geral do negócio
- ✅ **Clientes** - Cadastro completo com histórico
- ✅ **Agenda** - Gerenciamento de agendamentos
- ✅ **Serviços** - Catálogo de serviços
- ✅ **Anamnese** - Fichas digitais dos clientes
- ✅ **Marketing** - Posts e modelos de mensagem
- 🔄 **Autenticação** - Em desenvolvimento
- 🔄 **Relatórios** - Em desenvolvimento

## 🏗️ Arquitetura

```mermaid
graph TB
    subgraph Frontend["🌐 Frontend (Vercel)"]
        React["React + Vite"]
        Pages["Páginas"]
        Components["Componentes"]
    end
    
    subgraph Backend["☁️ Backend (EC2)"]
        API["Node.js/Express"]
        DB["PostgreSQL"]
        Uploads["Upload de Imagens"]
    end
    
    Frontend -->|API Calls| Backend
🚀 Como executar
Pré-requisitos
Node.js 20+

PostgreSQL 16+

Git

Passo a passo
bash
# Clone o repositório
git clone https://github.com/RafaelCorreaj/estetixhub.git
cd estetixhub

# Frontend
npm install
cp .env.example .env.local
# Edite .env.local com suas configurações
npm run dev

# Backend
cd backend
npm install
cp .env.example .env
# Edite .env com suas configurações
npx prisma migrate dev
npm run dev
Variáveis de Ambiente
Frontend (.env.local):

env
VITE_API_URL=http://localhost:3000/api
Backend (.env):

env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/estetixhub"
JWT_SECRET="sua-chave-secreta"
PORT=3000

📁 Estrutura do Projeto


estetixhub/
├── src/                    # Frontend React
│   ├── pages/              # Páginas da aplicação
│   ├── components/          # Componentes reutilizáveis
│   ├── services/           # Serviços de API
│   ├── lib/                # Utilitários e contextos
│   └── hooks/              # Custom hooks
├── backend/                 # Backend Node.js
│   ├── src/
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── routes/         # Rotas da API
│   │   └── middleware/     # Middlewares
│   ├── prisma/             # Schema e migrations
│   └── uploads/            # Imagens enviadas
├── docs/                    # Documentação
│   ├── CLAUDE.md           # Regras de desenvolvimento
│   ├── BUILD_PLAN.md       # Planejamento por fases
│   └── SPECIFICATIONS.md   # Especificações técnicas
└── package.json            # Dependências


🧪 Status do Desenvolvimento
Fase	Descrição	Status
0	Setup Inicial	✅ Concluído
1	Limpeza Base44	✅ Concluído
2	Backend API	🔄 Em andamento
3	Conexão Frontend	⏳ Pendente
4	Autenticação	⏳ Pendente
5+	Funcionalidades	⏳ Pendente

📊 Modelo de Dados

usuarios - Colaboradores da clínica

clientes - Clientes

anamnese - Fichas digitais

servicos - Serviços oferecidos

agendamentos - Agenda

posts_marketing - Calendário de posts

modelos_mensagem - Templates de WhatsApp

🚀 Deploy
Frontend (Vercel)
bash
npm run build
# Conecte seu repositório na Vercel
Backend (EC2)
bash
# Na sua instância EC2
git clone https://github.com/RafaelCorreaj/estetixhub.git
cd estetixhub/backend
npm install
npx prisma migrate deploy
pm2 start src/app.js --name estetixhub

📚 Documentação
Plano de Desenvolvimento

Regras de Desenvolvimento

Especificações Técnicas

🤝 Contribuição
Fork o projeto

Crie sua feature branch (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'feat: add some feature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request

📄 Licença
Distribuído sob a licença MIT. Veja LICENSE para mais informações.

📧 Contato
Rafael Correaj - @rafaelcorreaj

Link do Projeto: https://github.com/RafaelCorreaj/estetixhub

Desenvolvido com ❤️ para clínicas de estética


