# Многоэтапная сборка для оптимизации размера
FROM node:18-alpine as builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем все зависимости для сборки
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Продакшн образ
FROM node:18-alpine as production

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S autobid -u 1001

# Копируем package.json для установки только продакшн зависимостей
COPY package*.json ./

# Устанавливаем только продакшн зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем собранное приложение из builder этапа
COPY --from=builder --chown=autobid:nodejs /app/dist ./dist
COPY --from=builder --chown=autobid:nodejs /app/public ./public

# Устанавливаем права пользователя
USER autobid

# Открываем порт
EXPOSE 5000

# Проверка здоровья контейнера
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Запускаем приложение
CMD ["node", "dist/index.js"]