# Estágio de build
FROM node:20-alpine AS builder

# Instalar openssl para Prisma
RUN apk add --no-cache openssl

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependências (com fallback)
RUN npm ci --production --omit=dev || npm install --production --omit=dev

# Gerar Prisma Client
RUN npx prisma generate

# Estágio final
FROM node:20-alpine

# Instalar openssl e curl (para healthcheck)
RUN apk add --no-cache openssl curl

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar dependências do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Copiar código fonte
COPY --chown=nodejs:nodejs src ./src

# Criar pasta de uploads
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Healthcheck (usando curl)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Comando de inicialização (seed executa se existir)
CMD ["sh", "-c", "npx prisma migrate deploy && (node prisma/seed.js 2>/dev/null || true) && node src/app.js"]