#!/bin/bash

# Script de Deploy para AWS EC2
# Uso: ./scripts/deploy.sh [ambiente]
# Exemplo: ./scripts/deploy.sh production

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações padrão
ENVIRONMENT=${1:-production}
KEY_PATH="${AWS_KEY_PATH:-~/.ssh/estetixhub-key.pem}"
EC2_USER="${EC2_USER:-ec2-user}"
EC2_IP="${EC2_IP:-}"
APP_DIR="${APP_DIR:-~/apps/estetixhub}"

# Verificações
if [ -z "$EC2_IP" ]; then
    echo -e "${RED}Erro: EC2_IP não definido.${NC}"
    echo "Defina a variável EC2_IP ou configure no .env"
    exit 1
fi

if [ ! -f "$KEY_PATH" ]; then
    echo -e "${RED}Erro: Chave SSH não encontrada em $KEY_PATH${NC}"
    exit 1
fi

# Verificar se frontend-dist existe
if [ ! -d "frontend-dist" ]; then
    echo -e "${RED}Erro: Diretório frontend-dist não encontrado.${NC}"
    echo "Execute o build do frontend antes do deploy:"
    echo "  npm run build"
    echo "  ou use o Docker: docker build -t frontend ./frontend"
    exit 1
fi

echo -e "${GREEN}=== Deploy EstetixHub - Ambiente: $ENVIRONMENT ===${NC}"

# 1. Criar estrutura no servidor
echo -e "${YELLOW}1. Criando estrutura de diretórios no servidor...${NC}"
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_IP" "mkdir -p $APP_DIR && mkdir -p $APP_DIR/nginx && mkdir -p $APP_DIR/ssl && mkdir -p $APP_DIR/frontend-dist"

# 2. Copiar docker-compose.prod.yml
echo -e "${YELLOW}2. Copiando docker-compose.prod.yml...${NC}"
scp -i "$KEY_PATH" docker-compose.prod.yml "$EC2_USER@$EC2_IP:$APP_DIR/docker-compose.yml"

# 3. Copiar configuração do nginx
echo -e "${YELLOW}3. Copiando configuração do nginx...${NC}"
scp -i "$KEY_PATH" nginx/nginx.conf "$EC2_USER@$EC2_IP:$APP_DIR/nginx/nginx.conf"

# 4. Copiar arquivos do frontend (frontend-dist)
echo -e "${YELLOW}4. Copiando arquivos do frontend...${NC}"
scp -i "$KEY_PATH" -r frontend-dist/* "$EC2_USER@$EC2_IP:$APP_DIR/frontend-dist/"

# 5. Copiar .env.production (se existir)
if [ -f ".env.production" ]; then
    echo -e "${YELLOW}5. Copiando .env.production...${NC}"
    scp -i "$KEY_PATH" .env.production "$EC2_USER@$EC2_IP:$APP_DIR/.env"
else
    echo -e "${RED}Aviso: .env.production não encontrado.${NC}"
    echo "Você precisa criar este arquivo com as variáveis:"
    echo "  DB_PASSWORD=sua_senha"
    echo "  JWT_SECRET=seu_segredo"
    echo ""
    echo "Deseja continuar mesmo assim? (s/N)"
    read -r response
    if [[ ! "$response" =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# 6. Parar containers antigos (se existirem)
echo -e "${YELLOW}6. Parando containers antigos...${NC}"
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_IP" "cd $APP_DIR && docker-compose down 2>/dev/null || true"

# 7. Pull das imagens
echo -e "${YELLOW}7. Baixando imagens...${NC}"
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_IP" "cd $APP_DIR && docker-compose pull"

# 8. Iniciar containers
echo -e "${YELLOW}8. Iniciando containers...${NC}"
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_IP" "cd $APP_DIR && docker-compose up -d"

# 9. Aguardar health checks
echo -e "${YELLOW}9. Aguardando health checks (30 segundos)...${NC}"
sleep 30

# 10. Verificar status
echo -e "${YELLOW}10. Verificando status dos containers...${NC}"
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_IP" "cd $APP_DIR && docker-compose ps"

# 11. Executar migrações
echo -e "${YELLOW}11. Executando migrações do banco de dados...${NC}"
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_IP" "cd $APP_DIR && docker-compose exec -T backend npx prisma migrate deploy"

echo -e "${GREEN}=== Deploy concluído com sucesso! ===${NC}"
echo -e "${GREEN}Aplicação disponível em: http://$EC2_IP${NC}"
echo ""
echo "Comandos úteis:"
echo "  Ver logs: ssh -i $KEY_PATH $EC2_USER@$EC2_IP 'cd $APP_DIR && docker-compose logs -f'"
echo "  Parar:     ssh -i $KEY_PATH $EC2_USER@$EC2_IP 'cd $APP_DIR && docker-compose down'"
echo "  Reiniciar: ssh -i $KEY_PATH $EC2_USER@$EC2_IP 'cd $APP_DIR && docker-compose restart'"