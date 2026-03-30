#!/bin/bash

# Script de Backup do EstetixHub
# Faz backup do PostgreSQL e dos arquivos de upload
# Uso: ./scripts/backup.sh [tipo]
# Exemplo: ./scripts/backup.sh full

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
BACKUP_DIR="./backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="estetixhub_backup_$TIMESTAMP"

# Diretório de uploads (dentro do container)
UPLOAD_CONTAINER="estetixhub_backend"
UPLOAD_PATH="/app/uploads"

# Configurações do banco (do .env ou variáveis de ambiente)
DB_NAME="${DB_NAME:-estetixhub}"
DB_USER="${DB_USER:-estetixhub}"
DB_PASSWORD="${DB_PASSWORD}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Verifica se .env existe
if [ -f ".env" ]; then
    source .env
fi

# Verifica se DB_PASSWORD está definida
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Erro: DB_PASSWORD não definida.${NC}"
    echo "Defina no .env ou como variável de ambiente."
    exit 1
fi

# Cria diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Função para fazer backup do banco de dados
backup_database() {
    echo -e "${BLUE}📊 Fazendo backup do banco de dados...${NC}"
    
    local backup_file="$BACKUP_DIR/${BACKUP_NAME}_database.sql"
    
    # Executa pg_dump no container
    docker exec "${UPLOAD_CONTAINER}" sh -c "PGPASSWORD='${DB_PASSWORD}' pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}" > "$backup_file"
    
    # Comprime
    gzip "$backup_file"
    
    echo -e "${GREEN}✅ Backup do banco salvo: ${backup_file}.gz${NC}"
}

# Função para fazer backup dos uploads
backup_uploads() {
    echo -e "${BLUE}📁 Fazendo backup dos arquivos de upload...${NC}"
    
    local backup_file="$BACKUP_DIR/${BACKUP_NAME}_uploads.tar.gz"
    
    # Cria tar.gz dos uploads
    docker exec "${UPLOAD_CONTAINER}" tar -czf "/tmp/uploads_backup.tar.gz" -C "$UPLOAD_PATH" . 2>/dev/null || true
    
    # Copia do container para o host
    docker cp "${UPLOAD_CONTAINER}:/tmp/uploads_backup.tar.gz" "$backup_file" 2>/dev/null || true
    
    # Remove arquivo temporário do container
    docker exec "${UPLOAD_CONTAINER}" rm -f "/tmp/uploads_backup.tar.gz" 2>/dev/null || true
    
    if [ -f "$backup_file" ]; then
        echo -e "${GREEN}✅ Backup dos uploads salvo: $backup_file${NC}"
    else
        echo -e "${YELLOW}⚠️  Nenhum arquivo de upload encontrado ou diretório vazio${NC}"
    fi
}

# Função para fazer backup completo
backup_full() {
    echo -e "${GREEN}=== Backup Completo: $BACKUP_NAME ===${NC}"
    backup_database
    backup_uploads
    
    # Cria manifest do backup
    cat > "$BACKUP_DIR/${BACKUP_NAME}_manifest.txt" << EOF
Backup: $BACKUP_NAME
Data: $(date)
Banco: $DB_NAME
Host: $DB_HOST:$DB_PORT
Arquivos:
  - Banco de dados: ${BACKUP_NAME}_database.sql.gz
  - Uploads: ${BACKUP_NAME}_uploads.tar.gz
Tamanho total: $(du -sh "$BACKUP_DIR/${BACKUP_NAME}"* 2>/dev/null | tail -1 | cut -f1)
EOF
    
    echo -e "${GREEN}✅ Backup completo concluído!${NC}"
}

# Função para listar backups
list_backups() {
    echo -e "${BLUE}=== Backups Disponíveis ===${NC}"
    if [ -d "$BACKUP_DIR" ]; then
        ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print $5, $6, $7, $8, $9}' | sed 's/.sql.gz//' | sed 's/_database//' | sed 's/estetixhub_backup_//' || echo "Nenhum backup encontrado"
    else
        echo "Nenhum backup encontrado"
    fi
}

# Função para limpar backups antigos
cleanup_old_backups() {
    echo -e "${BLUE}🧹 Limpando backups com mais de $RETENTION_DAIS dias...${NC}"
    
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
        echo -e "${GREEN}✅ Limpeza concluída${NC}"
    fi
}

# Função para restaurar backup
restore_backup() {
    local backup_prefix="$1"
    
    if [ -z "$backup_prefix" ]; then
        echo -e "${RED}Erro: Especifique o prefixo do backup${NC}"
        echo "Uso: $0 restore <backup_timestamp>"
        echo "Exemplo: $0 restore 20260330_143000"
        exit 1
    fi
    
    echo -e "${RED}⚠️  ATENÇÃO: Isso irá sobrescrever o banco de dados e os uploads!${NC}"
    read -p "Tem certeza? (digite SIM para continuar): " confirm
    
    if [ "$confirm" != "SIM" ]; then
        echo "Restauração cancelada"
        exit 0
    fi
    
    echo -e "${YELLOW}🔄 Restaurando backup $backup_prefix...${NC}"
    
    # Restaurar banco
    if [ -f "$BACKUP_DIR/${backup_prefix}_database.sql.gz" ]; then
        echo "Restaurando banco de dados..."
        gunzip -c "$BACKUP_DIR/${backup_prefix}_database.sql.gz" | docker exec -i "${UPLOAD_CONTAINER}" sh -c "PGPASSWORD='${DB_PASSWORD}' psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}"
        echo -e "${GREEN}✅ Banco restaurado${NC}"
    else
        echo -e "${YELLOW}⚠️  Backup do banco não encontrado${NC}"
    fi
    
    # Restaurar uploads
    if [ -f "$BACKUP_DIR/${backup_prefix}_uploads.tar.gz" ]; then
        echo "Restaurando arquivos de upload..."
        docker cp "$BACKUP_DIR/${backup_prefix}_uploads.tar.gz" "${UPLOAD_CONTAINER}:/tmp/uploads_backup.tar.gz"
        docker exec "${UPLOAD_CONTAINER}" tar -xzf "/tmp/uploads_backup.tar.gz" -C "$UPLOAD_PATH"
        docker exec "${UPLOAD_CONTAINER}" rm -f "/tmp/uploads_backup.tar.gz"
        echo -e "${GREEN}✅ Uploads restaurados${NC}"
    else
        echo -e "${YELLOW}⚠️  Backup dos uploads não encontrado${NC}"
    fi
}

# Menu principal
case "${1:-full}" in
    "full")
        backup_full
        cleanup_old_backups
        ;;
    "db")
        backup_database
        cleanup_old_backups
        ;;
    "uploads")
        backup_uploads
        cleanup_old_backups
        ;;
    "list"|"ls")
        list_backups
        ;;
    "restore")
        restore_backup "$2"
        ;;
    *)
        echo "Uso: $0 [full|db|uploads|list|restore <timestamp>]"
        echo ""
        echo "Comandos:"
        echo "  full      - Backup completo (banco + uploads)"
        echo "  db        - Apenas banco de dados"
        echo "  uploads   - Apenas arquivos de upload"
        echo "  list      - Lista backups disponíveis"
        echo "  restore   - Restaura um backup específico"
        echo ""
        echo "Exemplos:"
        echo "  $0 full              # Faz backup completo"
        echo "  $0 list              # Lista backups"
        echo "  $0 restore 20260330_143000  # Restaura backup específico"
        exit 1
        ;;
esac