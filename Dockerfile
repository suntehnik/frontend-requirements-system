# Multi-stage build for production Vue.js application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build arguments for environment variables
ARG API_URL=http://spexus.msk.avito.ru
ARG APP_TITLE="Requirements Management System"
ARG APP_VERSION=1.0.0

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
# COPY ci-cd/nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy environment substitution script
COPY ci-cd/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Environment variables that can be set at runtime
ENV API_URL=http://spexus.msk.avito.ru
ENV APP_TITLE="Requirements Management System"
ENV APP_VERSION=1.0.0
ENV API_VERSION=v1

# Expose port 80
EXPOSE 80

# Use custom entrypoint for environment variable substitution
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]