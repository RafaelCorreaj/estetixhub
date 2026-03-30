#!/bin/bash

# Script de Limpeza de Segurança
# Remove arquivos sensíveis do histórico do Git
# USO COM CUIDADO - reescreve o histórico

set -e

echo "================================================"
echo "  LIMPEZA DE SEGURANÇA - REMOÇÃO DE ARQUIVOS SENSÍVEIS"
echo "================================================"
echo ""
echo "⚠️  AVISO: Este script reescreve o histórico do Git!"
echo "   Todos os colaboradores precisarão re-clonar o repositório."
echo ""
read -p "Deseja continuar? (s/N): " confirm

if [[ ! "$confirm" =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 0
fi

echo ""
echo "📋 Arquivos que serão removidos do histórico:"
echo "  - backend/.env"
echo "  - .env.local"
echo "  - Quaisquer arquivos com senhas hardcoded"
echo ""

# 1. Verificar se há arquivos sensíveis no repositório atual
echo "🔍 Verificando arquivos sensíveis no working directory..."
if [ -f "backend/.env" ]; then
    echo "  ⚠️  Encontrado: backend/.env"
    read -p "  Remover do working directory? (s/N): " remove_local
    if [[ "$remove_local" =~ ^[Ss]$ ]]; then
        rm backend/.env
        echo "  ✅ Removido"
    fi
fi

if [ -f ".env.local" ]; then
    echo "  ⚠️  Encontrado: .env.local"
    read -p "  Remover do working directory? (s/N): " remove_local
    if [[ "$remove_local" =~ ^[Ss]$ ]]; then
        rm .env.local
        echo "  ✅ Removido"
    fi
fi

# 2. Remover do git index (se já adicionados)
echo ""
echo "🗑️  Removendo arquivos do git index..."
git rm --cached -f backend/.env 2>/dev/null || echo "  backend/.env não estava no index"
git rm --cached -f .env.local 2>/dev/null || echo "  .env.local não estava no index"

# 3. Usar BFG Repo-Cleaner (recomendado) ou git filter-branch
echo ""
echo "🧹 Limpando histórico..."
echo "Escolha o método:"
echo "  1) BFG Repo-Cleaner (recomendado, mais rápido)"
echo "  2) git filter-branch (nativo, mais lento)"
read -p "Opção (1 ou 2): " method

if [ "$method" = "1" ]; then
    echo ""
    echo "📥 Baixando BFG Repo-Cleaner..."
    if ! command -v java &> /dev/null; then
        echo "❌ Java não encontrado. Instale Java para usar BFG."
        echo "   Ou use a opção 2 (git filter-branch)"
        exit 1
    fi
    
    BFG_JAR="bfg.jar"
    if [ ! -f "$BFG_JAR" ]; then
        wget -q https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar -O bfg.jar
    fi
    
    echo "🔄 Criando clone bare..."
    git clone --mirror . git-repo-bare
    cd git-repo-bare
    
    echo "🧹 Removendo arquivos sensíveis..."
    java -jar ../bfg.jar --delete-files .env
    java -jar ../bfg.jar --delete-files .env.local
    
    echo "📦 Recompactando repositório..."
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    cd ..
    echo "✅ Limpeza com BFG concluída!"
    echo ""
    echo "📝 Próximos passos:"
    echo "  1. Remova o repositório antigo: rm -rf .git"
    echo "  2. Copie o novo: mv git-repo-bare/.git ."
    echo "  3. Limpe: rm -rf git-repo-bare"
    echo "  4. Faça: git reset --hard"
    
else
    echo ""
    echo "🔄 Usando git filter-branch (pode demorar)..."
    
    # Backup antes de reescrever
    echo "💾 Criando backup..."
    git branch backup-before-filter
    
    # Remover .env
    git filter-branch --force --index-filter \
      'git rm --cached --ignore-unmatch backend/.env' \
      --prune-empty --tag-name-filter cat -- --all
    
    # Remover .env.local
    git filter-branch --force --index-filter \
      'git rm --cached --ignore-unmatch .env.local' \
      --prune-empty --tag-name-filter cat -- --all
    
    # Limpar e forçar
    git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    echo "✅ Limpeza com filter-branch concluída!"
fi

echo ""
echo "================================================"
echo "  ✅ LIMPEZA CONCLUÍDA"
echo "================================================"
echo ""
echo "⚠️  AÇÕES NECESSÁRIAS AGORA:"
echo ""
echo "1. Atualize o .gitignore (já fizemos isso)"
echo "2. Force push para o remoto:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Informe TODOS os colaboradores:"
echo "   - Eles precisam CLONAR o repositório novamente"
echo "   - NÃO usar git pull (vai corromper)"
echo ""
echo "4. Rotacione as senhas expostas:"
echo "   - DB_PASSWORD"
echo "   - JWT_SECRET"
echo "   - Quaisquer outras credenciais"
echo ""
echo "5. Configure secrets no GitHub (se ainda não fez)"
echo ""
echo "📚 Consulte README-CI-CD.md para instruções completas"