# Docker Build Fix - Август 2025

## Проблема
При сборке в DigitalOcean возникала ошибка:
```
error building image: failed to get fileinfo for /kaniko/0/app/uploads: lstat /kaniko/0/app/uploads: no such file or directory
```

## Причина
Dockerfile пытался скопировать директорию `uploads` из builder stage, но эта директория не существовала на этапе сборки.

## Решение

### 1. Убран COPY команды для несуществующих директорий
```dockerfile
# БЫЛО:
COPY --from=builder --chown=nextjs:nodejs /app/uploads ./uploads

# СТАЛО:
# Убрано - uploads создается в runtime
```

### 2. Создание директорий в builder stage
```dockerfile
# Создаем необходимые директории для сборки
RUN mkdir -p dist uploads
```

### 3. Создание директорий в production stage
```dockerfile
# Создаем необходимые директории для runtime
RUN mkdir -p uploads cache && chown -R nextjs:nodejs uploads cache
```

## Обновленный Dockerfile

```dockerfile
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --include=dev
COPY . .
RUN mkdir -p dist uploads
RUN npx vite build && npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js

FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
RUN mkdir -p uploads cache && chown -R nextjs:nodejs uploads cache
USER nextjs
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["node", "dist/production.js"]
```

## Статус
✅ **ИСПРАВЛЕНО** - Docker сборка теперь должна завершаться успешно без ошибок файловой системы.

## Следующие шаги
1. Повторить деплой в DigitalOcean
2. Проверить что сборка завершается без ошибок
3. Настроить переменные окружения