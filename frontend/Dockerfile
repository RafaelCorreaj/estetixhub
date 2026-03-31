# Estágio de build
FROM node:20-alpine AS builder

# Instalar dependências do sistema para evitar problemas com optional dependencies
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências (com fallback para npm install)
RUN npm ci --production=false --omit=dev 2>/dev/null || npm install

# Copiar código fonte
COPY . .

# Instalar rollup explicitamente se necessário
RUN npm install --no-save @rollup/rollup-linux-x64-musl 2>/dev/null || true

# Argumento para a URL da API (padrão: /api para produção com proxy)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Construir aplicação
RUN npm run build -- --base=/

# Estágio final
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Remover configuração padrão
RUN rm -f /etc/nginx/conf.d/default.conf.default

# Criar usuário não-root
RUN addgroup -g 1001 -S nginx-custom && \
    adduser -S nginx-custom -u 1001 -G nginx-custom && \
    chown -R nginx-custom:nginx-custom /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    chown -R nginx-custom:nginx-custom /var/cache/nginx && \
    chown -R nginx-custom:nginx-custom /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx-custom:nginx-custom /var/run/nginx.pid

# Mudar para usuário não-root
USER nginx-custom

# Expor porta
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]