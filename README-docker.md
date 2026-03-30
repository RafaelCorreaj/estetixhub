# EstetixHub - Configuração Docker

Guia completo para configurar o EstetixHub com Docker para desenvolvimento local e deploy em produção na AWS EC2.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Deploy em Produção](#deploy-em-produção)
- [Manutenção](#manutenção)
- [Troubleshooting](#troubleshooting)

## 📦 Pré-requisitos

### Para Desenvolvimento Local
- [Docker](https://www.docker.com/products/docker-desktop) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- Node.js 18+ (apenas para desenvolvimento sem Docker)

### Para Produção (AWS EC2)
- Instância EC2 com Amazon Linux 2023 ou Ubuntu 22.04+
- Docker e Docker Compose instalados
- Domínio configurado (opcional, mas recomendado)
- Certificado SSL (Let's Encrypt ou outro)

## 📁 Estrutura de Arquivos

```
estetixhub/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── src/
│   ├── public/
│   └── package.json
├── nginx/
│   └── nginx.conf
├── scripts/
│   ├── deploy.sh
│   └── backup.sh
├── docker-compose.yml          # Desenvolvimento
├── docker-compose.prod.yml    # Produção
├── .env.example               # Exemplo de variáveis
└── README-docker.md           # Este arquivo
```

## 🚀 Desenvolvimento Local

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env.local

# Editar .env.local com suas configurações
# Pelo menos defina:
# - DB_PASSWORD
# - JWT_SECRET
```

### 2. Iniciar Serviços

```bash
# Subir todos os serviços (postgres, backend, frontend)
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Ver status dos containers
docker-compose ps
```

### 3. Acessar Aplicação

- **Frontend**: http://localhost (porta 80)
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
  - Usuário: `estetixhub`
  - Senha: (definida em .env.local)
  - Banco: `estetixhub`

### 4. Comandos Úteis

```bash
# Parar serviços
docker-compose down

# Parar e remover volumes (CUIDADO - apaga dados!)
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart backend

# Executar comando no container
docker-compose exec backend npm run dev

# Ver logs de um serviço específico
docker-compose logs -f backend

# Rebuild de um serviço (após mudanças no Dockerfile)
docker-compose build backend
```

### 5. Hot Reload

O docker-compose.yml está configurado para hot reload:
- Backend: Mudanças em `backend/src/` são refletidas automaticamente
- Frontend: Requer rebuild manual (ou configure Vite para hot reload via volume)

## 🏗️ Produção (AWS EC2)

### 1. Preparar Servidor EC2

```bash
# Conectar à instância
ssh -i ~/.ssh/sua-chave.pem ec2-user@SEU_IP_EC2

# Instalar Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout e login novamente para aplicar grupo docker
```

### 2. Build e Push das Imagens

No seu ambiente de desenvolvimento:

```bash
# Fazer login no Docker Hub (ou outro registry)
docker login

# Build do backend
docker build -t seu-usuario/estetixhub-backend:latest ./backend

# Build do frontend
docker build -t seu-usuario/estetixhub-frontend:latest .

# Push para o registry
docker push seu-usuario/estetixhub-backend:latest
docker push seu-usuario/estetixhub-frontend:latest
```

### 3. Configurar Variáveis de Produção

```bash
# Criar .env.production (NÃO comite este arquivo!)
# Use .env.example como referência
cp .env.example .env.production

# Editar .env.production com valores de produção:
# - DB_PASSWORD (senha forte!)
# - JWT_SECRET (chave secreta longa e aleatória)
# - API_URL (domínio da aplicação)
```

**Gerar JWT_SECRET seguro:**
```bash
openssl rand -base64 64
```

### 4. Deploy Automático

```bash
# Dar permissão de execução
chmod +x scripts/deploy.sh

# Configurar variáveis de ambiente (opcional)
export AWS_KEY_PATH="~/.ssh/sua-chave.pem"
export EC2_IP="SEU_IP_EC2"
export EC2_USER="ec2-user"

# Executar deploy
./scripts/deploy.sh production
```

### 5. Deploy Manual (Alternativa)

```bash
# 1. Copiar arquivos para o servidor
scp -i ~/.ssh/sua-chave.pem docker-compose.prod.yml ec2-user@IP:~/apps/estetixhub/
scp -i ~/.ssh/sua-chave.pem .env.production ec2-user@IP:~/apps/estetixhub/.env
scp -i ~/.ssh/sua-chave.pem -r nginx/ ec2-user@IP:~/apps/estetixhub/

# 2. No servidor EC2
ssh -i ~/.ssh/sua-chave.pem ec2-user@IP
cd ~/apps/estetixhub
docker-compose -f docker-compose.prod.yml up -d

# 3. Executar migrações
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### 6. Configurar Nginx (SSL)

Para configurar HTTPS com Let's Encrypt:

```bash
# No servidor EC2
sudo yum install certbot python3-certbot-nginx -y

# Obter certificado (se usar domínio)
sudo certbot --nginx -d seu-dominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

### 7. Firewall/Security Group

Na AWS Console, configure o Security Group da EC2:
- Porta 80 (HTTP) - aberta
- Porta 443 (HTTPS) - aberta
- Porta 22 (SSH) - apenas seu IP
- Porta 3000 - NÃO abrir (apenas interna)

## 💾 Backup

### Backup Automático

Configure cron job para backups automáticos:

```bash
# No servidor EC2, editar crontab
crontab -e

# Adicionar (backup diário às 2h da manhã)
0 2 * * * /home/ec2-user/apps/estetixhub/scripts/backup.sh full >> /var/log/backup.log 2>&1
```

### Backup Manual

```bash
# No diretório do projeto
./scripts/backup.sh full

# Apenas banco
./scripts/backup.sh db

# Apenas uploads
./scripts/backup.sh uploads

# Listar backups
./scripts/backup.sh list

# Restaurar backup
./scripts/backup.sh restore 20260330_143000
```

### Backup para S3 (Opcional)

Modifique `scripts/backup.sh` para enviar ao S3:

```bash
# Instalar AWS CLI no servidor
sudo yum install awscli -y

# Configurar credenciais
aws configure

# Adicionar ao final do backup.sh:
aws s3 cp "$backup_file" "s3://seu-bucket/backups/" --storage-class STANDARD_IA
```

## 🔧 Manutenção

### Ver Logs

```bash
# Todos os logs
docker-compose -f docker-compose.prod.yml logs -f

# Log de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f backend

# Logs com limite de linhas
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Reiniciar Serviços

```bash
# Reiniciar tudo
docker-compose -f docker-compose.prod.yml restart

# Reiniciar um serviço
docker-compose -f docker-compose.prod.yml restart backend

# Recriar um serviço (após mudanças no Dockerfile)
docker-compose -f docker-compose.prod.yml up -d --build backend
```

### Atualizar Aplicação

```bash
# 1. Build e push das novas imagens
docker build -t seu-usuario/estetixhub-backend:latest ./backend
docker build -t seu-usuario/estetixhub-frontend:latest .
docker push seu-usuario/estetixhub-backend:latest
docker push seu-usuario/estetixhub-frontend:latest

# 2. Deploy (usando script)
./scripts/deploy.sh production

# OU manual:
ssh -i ~/.ssh/sua-chave.pem ec2-user@IP
cd ~/apps/estetixhub
docker-compose pull
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

### Monitoramento

```bash
# Uso de recursos
docker stats

# Ver containers em execução
docker-compose ps

# Ver espaço em disco
docker system df

# Limpar imagens não utilizadas (CUIDADO)
docker system prune -a
```

### Acesso ao Banco de Dados

```bash
# Conectar ao PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U estetixhub -d estetixhub

# Backup manual via pg_dump
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U estetixhub estetixhub > backup.sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U estetixhub -d estetixhub < backup.sql
```

## 🐛 Troubleshooting

### Container não sobe

```bash
# Ver logs
docker-compose logs backend

# Verificar healthcheck
docker inspect estetixhub_backend | grep -A 10 "Health"

# Verificar se porta está em uso
netstat -tulpn | grep :3000
```

### Erro de conexão com banco

```bash
# Verificar se postgres está saudável
docker-compose ps postgres

# Testar conexão
docker-compose exec backend node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(()=>console.log('OK')).catch(e=>console.error(e))"

# Verificar variáveis de ambiente
docker-compose exec backend env | grep DATABASE
```

### Frontend não carrega

```bash
# Verificar se frontend buildou corretamente
docker-compose exec frontend ls -la /usr/share/nginx/html

# Ver logs do nginx
docker-compose logs nginx

# Testar se API está acessível do frontend
docker-compose exec frontend wget -qO- http://backend:3000/health
```

### Problemas com permissões

```bash
# Se houver problemas com uploads:
docker-compose exec backend ls -la /app/uploads

# Ajustar permissões
docker-compose exec backend chmod -R 755 /app/uploads
```

### Healthcheck falhando

```bash
# Verificar se endpoint /health existe no backend
# Se não existir, adicione em backend/src/app.js:

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Docker Compose versão incompatível

```bash
# Verificar versão
docker-compose --version

# Se usar Docker Compose v1 (antigo), pode precisar:
docker-compose -f docker-compose.prod.yml up -d
# Em vez de:
docker compose -f docker-compose.prod.yml up -d
```

### Limpar tudo e recomeçar

```bash
# PARAR TUDO
docker-compose down

# Remover volumes (APAGA DADOS!)
docker-compose down -v

# Remover imagens
docker rmi seu-usuario/estetixhub-backend:latest
docker rmi seu-usuario/estetixhub-frontend:latest

# Limpar cache Docker
docker system prune -a

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

## 🔐 Segurança

### Checklist de Segurança

- [ ] Alterar senha padrão do PostgreSQL (DB_PASSWORD)
- [ ] Usar JWT_SECRET forte e aleatório
- [ ] Não commitar .env ou .env.production
- [ ] Usar HTTPS em produção (SSL/TLS)
- [ ] Configurar firewall (Security Groups na AWS)
- [ ] Manter Docker e sistema operacional atualizados
- [ ] Usar imagens Docker oficiais e verificadas
- [ ] Executar containers como usuário não-root (já configurado)
- [ ] Limitar recursos (CPU/memória) nos containers
- [ ] Fazer backups regulares

### Rotação de Segredos

```bash
# Gerar novo JWT_SECRET
openssl rand -base64 64

# Atualizar no .env.production e reimplantar
./scripts/deploy.sh production
```

## 📊 Monitoramento

### Logs Centralizados (Opcional)

```bash
# Instalar ELK Stack ou similar
# Ou enviar logs para CloudWatch (AWS)

# Exemplo: enviar logs para arquivo
docker-compose logs > estetixhub_$(date +%Y%m%d).log
```

### Métricas (Opcional)

```bash
# Usar cAdvisor + Prometheus + Grafana
docker run -d \
  --name=cadvisor \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --publish=8080:8080 \
  google/cadvisor
```

## 📝 Notas Importantes

1. **Persistência de Dados**: Os volumes Docker (`postgres_data`, `uploads`) garantem que os dados persistem mesmo se os containers forem removidos.

2. **Hot Reload**: Apenas o backend está configurado para hot reload em desenvolvimento. O frontend requer rebuild.

3. **Imagens de Produção**: Lembre-se de fazer `docker push` das imagens antes do deploy.

4. **Migrações**: As migrações do Prisma são executadas automaticamente no startup do backend. Em produção, pode executar manualmente:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

5. **PWA**: O frontend inclui Service Worker e manifest.json para funcionar como PWA. Certifique-se de que o nginx está servindo corretamente.

6. **CORS**: O backend deve estar configurado para aceitar requisições do domínio do frontend. Verifique `backend/src/app.js`.

## 🆘 Suporte

- Issues no GitHub: https://github.com/rafaelcorreaj/estetixhub/issues
- Documentação: https://docs.estetixhub.com.br

---

**Última atualização**: Março 2026
**Versão**: 1.0.0