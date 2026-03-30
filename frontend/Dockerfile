# Estágio de build
FROM node:20-alpine AS builder

# Instalar dependências do sistema para evitar problemas com optional dependencies
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências (omitir optional para evitar erro do rollup no Alpine)
RUN npm ci --omit=optional

# Copiar código fonte
COPY . .

# Instalar rollup explicitamente (forçar versão compatível)
RUN npm install --no-save @rollup/rollup-linux-x64-musl

# Argumento para a URL da API (padrão: /api para produção com proxy)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Construir aplicação
RUN npm run build -- --base=/

# Estágio final
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx (se existir)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Criar usuário não-root
RUN addgroup -g 1001 -S nginx-custom
RUN adduser -S nginx-custom -u 1001 -G nginx-custom

# Ajustar permissões
RUN chown -R nginx-custom:nginx-custom /usr/share/nginx/html
RUN chown -R nginx-custom:nginx-custom /var/cache/nginx
RUN chown -R nginx-custom:nginx-custom /var/log/nginx
RUN chown -R nginx-custom:nginx-custom /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nginx-custom:nginx-custom /var/run/nginx.pid

# Mudar para usuário não-root
USER nginx-custom

# Expor porta
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]