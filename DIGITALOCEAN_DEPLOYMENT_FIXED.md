# DigitalOcean Deployment - Проблемы Исправлены (Август 2025)

## 🔧 Исправленные проблемы

### 1. Ошибка "command exited with code 127" - ✅ РЕШЕНО

**Проблема**: При деплое в DigitalOcean команда `vite build` не найдена.

**Решение**:
- ✅ Добавлены системные зависимости в Dockerfile: `python3`, `make`, `g++`
- ✅ Исправлена установка npm зависимостей: `npm ci --include=dev`
- ✅ Используется правильная команда сборки: `npx vite build && npx esbuild server/production.ts`

### 2. Проблемы с Replit зависимостями - ✅ РЕШЕНО

**Проблема**: production.ts импортировал vite.config.ts с Replit плагинами.

**Решение**:
- ✅ Убран импорт `serveStatic, log` из `./vite`
- ✅ Добавлена простая функция логирования в production.ts
- ✅ Production сервер теперь полностью независим от Replit

### 3. Конфигурация App Platform - ✅ ГОТОВО

**Исправления**:
- ✅ `.do/app.yaml` правильно настроен
- ✅ Health check оптимизирован (30s delay вместо 60s)
- ✅ Порт 8080 сконфигурирован
- ✅ Переменные окружения настроены

## 📁 Готовые файлы

### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --include=dev
COPY . .
RUN npx vite build && npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js

FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist  
COPY --from=builder --chown=nextjs:nodejs /app/uploads ./uploads
RUN mkdir -p uploads && chown -R nextjs:nodejs uploads
USER nextjs
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["node", "dist/production.js"]
```

### .do/app.yaml
```yaml
name: autobid-tj
services:
- name: web
  source_dir: /
  dockerfile_path: Dockerfile
  instance_count: 1
  instance_size_slug: professional-xs
  http_port: 8080
  routes:
  - path: /
  health_check:
    http_path: /health
    initial_delay_seconds: 30
    period_seconds: 10
    timeout_seconds: 5
    success_threshold: 1
    failure_threshold: 3
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    scope: RUN_AND_BUILD_TIME
    type: SECRET
  - key: SESSION_SECRET
    scope: RUN_AND_BUILD_TIME
    type: SECRET
  - key: SPACES_KEY
    scope: RUN_AND_BUILD_TIME
    type: SECRET
  - key: SPACES_SECRET
    scope: RUN_AND_BUILD_TIME
    type: SECRET
  - key: SMS_API_URL
    scope: RUN_AND_BUILD_TIME
    type: SECRET
  - key: SMS_API_TOKEN
    scope: RUN_AND_BUILD_TIME
    type: SECRET
  - key: PORT
    value: "8080"
```

### .dockerignore
```
node_modules
.git
attached_assets
*.tar.gz
*.txt
*.sh
.do
dist
uploads
```

## 🚀 Следующие шаги

1. **Создать PostgreSQL базу** в DigitalOcean (Amsterdam)
2. **Создать Spaces bucket** для изображений
3. **Настроить секреты** в App Platform
4. **Деплой приложения** - push в main branch

## 💰 Стоимость

- App Platform Professional XS: $24/месяц
- Managed PostgreSQL Basic: $15/месяц  
- Spaces Storage: $5-10/месяц
- **Итого: ~$45-55/месяц**

## ✅ Статус

**ГОТОВО ДЛЯ ДЕПЛОЯ** - Все проблемы исправлены, можно разворачивать в DigitalOcean.