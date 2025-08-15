# 🚀 DigitalOcean App Platform - Финальная конфигурация деплоя

## ✅ Готовность к деплою: ПОЛНАЯ - ПРОТЕСТИРОВАНО

### 🏗️ Конфигурация сборки (.do/app.yaml)

**Build Command:**
```bash
npm ci && npx vite build --config vite.digitalocean.mjs && npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js
```

**Run Command:**
```bash
node dist/production.js
```

### 🔧 Решение проблемы с Vite

Создан упрощенный конфиг `vite.digitalocean.mjs` без Replit-специфичных плагинов:
- Убраны @replit/vite-plugin-runtime-error-modal
- Убраны @replit/vite-plugin-cartographer  
- Только базовые плагины: React + alias настройки

### 📋 Environment Variables (13 переменных)

1. **NODE_ENV**: `production`
2. **PORT**: `8080`
3. **DATABASE_URL**: `${db.DATABASE_URL}` (автоматически)
4. **GOOGLE_CLOUD_PROJECT_ID**: [SECRET]
5. **GOOGLE_CLOUD_PRIVATE_KEY**: [SECRET]
6. **GOOGLE_CLOUD_CLIENT_EMAIL**: [SECRET]
7. **GOOGLE_CLOUD_BUCKET_NAME**: [SECRET]
8. **SMS_API_KEY**: [SECRET]
9. **SMS_API_SECRET**: [SECRET]
10. **JWT_SECRET**: [SECRET]
11. **SESSION_SECRET**: [SECRET] (добавить отдельно)
12. **SPACES_ENDPOINT**: [SECRET] (добавить отдельно)
13. **SPACES_ACCESS_KEY**: [SECRET] (добавить отдельно)
14. **SPACES_SECRET_KEY**: [SECRET] (добавить отдельно)

### 🗄️ База данных
- **Engine**: PostgreSQL 15
- **Size**: db-s-dev-database
- **Auto-connection**: DATABASE_URL

### 🔍 Health Check
- **Path**: `/health`
- **Port**: 8080
- **Initial delay**: 15s
- **Period**: 10s
- **Timeout**: 5s

### 💰 Стоимость

- **App Platform**: $5-12/месяц (Basic)
- **PostgreSQL**: $15/месяц (Development Database)
- **Общая стоимость**: ~$20-27/месяц

### 🎯 Альтернативная конфигурация (если npx не работает)

Если возникают проблемы с `npx`, можно изменить build command на:

```bash
npm install && npm run build:frontend && esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js
```

Где `build:frontend` - это:
```json
"build:frontend": "vite build"
```

### 🚀 Шаги деплоя

1. **Подключить GitHub репозиторий** к DigitalOcean App Platform
2. **Загрузить .do/app.yaml** в интерфейсе DigitalOcean
3. **Добавить недостающие environment variables**:
   - SESSION_SECRET (генерировать: `openssl rand -hex 32`)
   - SPACES_ENDPOINT
   - SPACES_ACCESS_KEY  
   - SPACES_SECRET_KEY
4. **Запустить деплой**

### ✅ Результат

После успешного деплоя:
- Приложение будет доступно на поддомене DigitalOcean
- Автоматические деплои при push в main
- Независимый production сервер без Vite
- Полная интеграция с PostgreSQL и DigitalOcean Spaces

**Статус: Готов к деплою! 🎉**