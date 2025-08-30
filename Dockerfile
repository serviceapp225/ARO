# Многоэтапная сборка для оптимизации размера
FROM node:18-alpine as builder

WORKDIR /app

# Устанавливаем системные зависимости для компиляции native модулей
RUN apk add --no-cache python3 make g++

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем все зависимости для сборки
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npx vite build && npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js

# Продакшн образ
FROM node:18-alpine as production

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S autobid -u 1001

# Копируем минимальный production package.json только с базовыми пакетами
COPY package.digitalocean.minimal-core.json ./package.json

# Устанавливаем только production зависимости
RUN npm install && npm cache clean --force

# Создаем директории для uploads с правильными правами
RUN mkdir -p uploads && chown autobid:nodejs uploads && chmod 755 uploads

# Копируем собранное приложение из builder этапа
COPY --from=builder --chown=autobid:nodejs /app/dist ./dist
COPY --from=builder --chown=autobid:nodejs /app/public ./public

# Копируем скрипты диагностики базы данных
COPY --from=builder --chown=autobid:nodejs /app/quick-db-check.js ./
COPY --from=builder --chown=autobid:nodejs /app/check-database-connection.js ./

# Устанавливаем права пользователя
USER autobid

# Открываем порт
EXPOSE 8080

# Проверка здоровья контейнера
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Запускаем приложение
CMD ["sleep", "1", "&&", "node", "dist/production.js"]