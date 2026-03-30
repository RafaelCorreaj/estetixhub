# CI/CD - EstetixHub

Guia completo de configuração e uso do pipeline de integração e deploy contínuo.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Pré-requisitos](#pré-requisitos)
4. [Configuração Inicial](#configuração-inicial)
5. [Secrets do GitHub](#secrets-do-github)
6. [Configuração da EC2](#configuração-da-ec2)
7. [Como Funciona](#como-funciona)
8. [Deploy Manual](#deploy-manual)
9. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O pipeline de CI/CD automatiza o build, push e deploy da aplicação EstetixHub para uma instância AWS EC2.

### Fluxo Automático

1. **Push** para `main` ou `master` → trigger automático
2. **Build** das imagens Docker (backend e frontend)
3. **Push** para Docker Hub
4. **Extrai** arquivos do frontend
5. **Deploy** via SSH para EC2
6. **Health checks** de validação

### Tecnologias Utilizadas

- **GitHub Actions** - Pipeline CI/CD
- **Docker** - Containerização
- **Docker Hub** - Registry de imagens
- **Docker Compose** - Orquestração
- **Nginx** - Proxy reverso
- **AWS EC2** - Host de produção

---

## Arquitetura

```
┌─────────────────┐
│   GitHub Repo   │
│   (Push main)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│           GitHub Actions                    │
│  ┌─────────────────────────────────────┐   │
│  │ 1. Build Backend → Docker Hub       │   │
│  │ 2. Build Frontend → Docker Hub      │   │
│  │ 3. Extract frontend-dist            │   │
│  │ 4. SCP files to EC2                 │   │
│  │ 5. SSH deploy                       │   │
│  └─────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│           AWS EC2                            │
│  ┌────────────┐      ┌────────────┐        │
│  │  Nginx     │─────▶│  Backend   │        │
│  │  :80       │      │  :3000     │        │
│  │            │      │            │        │
│  │  frontend- │      │  API       │        │
│  │  dist/     │      │            │        │
│  └────────────┘      └────────────┘        │
│         │                                   │
│         ▼                                   │
│  ┌────────────┐                            │
│  │ PostgreSQL │                            │
│  │  :5432     │                            │
│  └────────────┘                            │
└─────────────────────────────────────────────┘
```

---

## Pré-requisitos

### No GitHub

- Repositório configurado
- Docker Hub account
- AWS EC2 instance rodando

### Na EC2

- Docker instalado
- Docker Compose instalado
- Portas 80 e 3000 abertas no security group
- Domínio opcional (para HTTPS futuro)

### Local (para deploy manual)

- Docker
- Docker Compose
- Chave SSH da EC2

---

## Configuração Inicial

### 1. Criar .env.production

```bash
cp .env.prod.example .env.production
```

Edite `.env.production` com valores seguros:

```env
DB_PASSWORD=senha_super_segura_mínimo_32_caracteres
JWT_SECRET=outra_senha_super_segura_mínimo_32_caracteres
```

### 2. Configurar Docker Hub

1. Crie um repositório no Docker Hub: `estetixhub-backend`
2. Crie um repositório no Docker Hub: `estetixhub-frontend`
3. Gere um **Access Token** (não use senha principal)

### 3. Configurar Secrets do GitHub

Vá em **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Adicione:

| Nome | Valor |
|------|-------|
| `DOCKER_HUB_USERNAME` | seu usuário Docker Hub |
| `DOCKER_HUB_TOKEN` | token de acesso Docker Hub |
| `EC2_HOST` | IP da sua EC2 (ex: 3.235.24.227) |
| `EC2_USER` | usuário SSH (ex: ec2-user) |
| `EC2_SSH_PRIVATE_KEY` | chave privada SSH completa |

Para adicionar a chave SSH:

```bash
cat ~/.ssh/estetixhub-key.pem
# Copie todo o conteúdo (incluindo -----BEGIN/END-----)
```

---

## Configuração da EC2

### 1. Instalar Docker e Docker Compose

```bash
# Conectar na EC2
ssh -i ~/.ssh/estetixhub-key.pem ec2-user@3.235.24.227

# Instalar Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo systemctl enable docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 2. Criar estrutura de diretórios

```bash
mkdir -p ~/apps/estetixhub/nginx
mkdir -p ~/apps/estetixhub/ssl
mkdir -p ~/apps/estetixhub/frontend-dist
```

### 3. Configurar .env na EC2

No diretório `~/apps/estetixhub/`, crie o arquivo `.env`:

```env
DB_PASSWORD=sua_senha_aqui
JWT_SECRET=seu_segredo_aqui
```

### 4. Ajustar permissões

```bash
chmod 600 ~/.ssh/estetixhub-key.pem
chmod 700 ~/apps/estetixhub
```

---

## Como Funciona

### Trigger Automático

O workflow é disparado automaticamente quando há push para:

- `main`
- `master`

### Steps do Pipeline

1. **Checkout** - Baixa o código fonte
2. **Login Docker Hub** - Autentica no registry
3. **Setup Buildx** - Prepara builder multi-plataforma
4. **Build Backend** - Constrói imagem do backend
5. **Build Frontend** - Constrói imagem do frontend com `VITE_API_URL=/api`
6. **Extract Frontend** - Extrai arquivos estáticos da imagem
7. **SCP to EC2** - Transfere arquivos via SCP
8. **Deploy** - Executa docker-compose na EC2
9. **Health Checks** - Valida backend e frontend
10. **Notification** - Log de sucesso/falha

---

## Deploy Manual

### Usando GitHub Actions

1. Vá para **Actions** no repositório
2. Selecione workflow **Deploy EstetixHub to AWS EC2**
3. Clique **Run workflow** → **Run workflow**

### Usando Script Local

```bash
# 1. Build do frontend
npm run build

# 2. Garantir que frontend-dist existe
ls -la frontend-dist/

# 3. Executar deploy
./scripts/deploy.sh production
```

O script irá:

1. Criar diretórios na EC2
2. Copiar `docker-compose.prod.yml`
3. Copiar `nginx.conf`
4. Copiar arquivos do `frontend-dist`
5. Copiar `.env.production` (se existir)
6. Parar containers antigos
7. Pull das imagens
8. Iniciar containers
9. Executar migrações do Prisma
10. Mostrar status final

---

## Troubleshooting

### Erro: "DB_PASSWORD não definida"

**Solução:** Crie `.env.production` local e na EC2 com a variável.

### Erro: "Health check failed"

**Verificar:**

```bash
# Logs do backend
docker-compose logs backend

# Logs do nginx
docker-compose logs nginx

# Testar health manualmente
curl http://localhost:3000/api/health
curl http://localhost/health
```

### Erro: "frontend-dist não encontrado"

**Solução:** Execute build do frontend:

```bash
npm run build
```

Ou via Docker:

```bash
docker build -t frontend ./frontend
docker create --name temp frontend
docker cp temp:/usr/share/nginx/html ./frontend-dist
docker rm temp
```

### Containers reiniciando continuamente

**Verificar logs:**

```bash
docker-compose logs -f
```

Possíveis causas:

- Falta de variáveis de ambiente
- Erro no build do Prisma
- Porta já em uso
- Permissões de arquivo

### Nginx não serve frontend

**Verificar:**

```bash
# Arquivos estão no volume?
ls -la frontend-dist/

# Permissões no container
docker-compose exec nginx ls -la /usr/share/nginx/html

# Configuração do nginx
docker-compose exec nginx nginx -t
```

### SSH falha no deploy

**Verificar:**

- Chave SSH correta nos secrets
- IP correto da EC2
- Porta 22 aberta no security group
- Usuário correto (ec2-user para Amazon Linux)

---

## Estrutura de Arquivos

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # Pipeline CI/CD
├── docker-compose.prod.yml     # Produção
├── docker-compose.yml          # Desenvolvimento
├── frontend/
│   ├── Dockerfile              # Multi-stage build
│   ├── nginx.conf              # Config nginx (usado no build)
│   └── ...
├── backend/
│   ├── Dockerfile              # Multi-stage build
│   └── src/
├── nginx/
│   └── nginx.conf              # Config nginx produção
├── scripts/
│   └── deploy.sh               # Deploy manual
├── frontend-dist/              # Gerado no build (gitignore)
├── .env.prod.example           # Exemplo variáveis produção
└── README-CI-CD.md             # Este arquivo
```

---

## Variáveis de Ambiente

### Obrigatórias (EC2 .env)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DB_PASSWORD` | Senha do PostgreSQL | `MinhaSenh@123Segura` |
| `JWT_SECRET` | Segredo JWT para tokens | `outro-segredo-super-forte` |

### Opcionais

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | URL da API no frontend | `/api` |

---

## Monitoramento

### Ver logs em tempo real

```bash
docker-compose logs -f
```

### Logs específicos

```bash
docker-compose logs backend
docker-compose logs nginx
docker-compose logs postgres
```

### Status dos containers

```bash
docker-compose ps
```

### Uso de recursos

```bash
docker stats
```

---

## Próximos Passos (Melhorias Futuras)

- [ ] Configurar HTTPS com Let's Encrypt
- [ ] Adicionar banco de dados backup automático
- [ ] Configurar monitoring (Prometheus/Grafana)
- [ ] Adicionar rollback automático em falhas
- [ ] Implementar blue-green deployment
- [ ] Configurar CDN para assets estáticos
- [ ] Adicionar testes automatizados no pipeline

---

## Suporte

Para dúvidas ou problemas:

1. Consulte a seção **Troubleshooting**
2. Verifique logs dos containers
3. Abra uma issue no repositório

---

**Última atualização:** 30/03/2026