# Multi-stage build для оптимизации размера
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем ВСЕ зависимости (включая dev для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем только фронтенд и minimal server (БЕЗ проблемного index.js с Replit плагинами)
RUN vite build && npx esbuild server/production-minimal.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production-minimal.js

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

# Копируем собранное приложение из builder stage (БЕЗ исходников сервера с Replit зависимостями)
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/uploads ./uploads

# Создаем директорию для uploads если не существует
RUN mkdir -p uploads && chown -R nextjs:nodejs uploads

# Переключаемся на пользователя nodejs
USER nextjs

# Открываем порт
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Запускаем приложение в production режиме (без Vite плагинов)
CMD ["node", "dist/production-minimal.js"]