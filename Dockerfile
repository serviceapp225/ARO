# Multi-stage build для оптимизации размера
FROM node:20-alpine AS builder

# Устанавливаем необходимые системные зависимости
RUN apk add --no-cache python3 make g++

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем ВСЕ зависимости (включая dev для сборки)
RUN npm ci --include=dev

# Копируем исходный код
COPY . .

# Создаем необходимые директории для сборки
RUN mkdir -p dist uploads

# Собираем фронтенд и production server
RUN npx vite build && npx esbuild server/production-minimal.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js

# Production stage
FROM node:20-alpine AS production

# Устанавливаем рабочую директорию
WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости (без Replit dev плагинов)
RUN npm ci --only=production && npm cache clean --force

# Копируем собранное приложение из builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Создаем необходимые директории для runtime
RUN mkdir -p uploads cache && chown -R nextjs:nodejs uploads cache

# Переключаемся на пользователя nodejs
USER nextjs

# Открываем порт
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Запускаем приложение в production режиме
CMD ["node", "dist/production.js"]