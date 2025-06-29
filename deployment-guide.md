# Руководство по развертыванию AUTOBID.TJ

## Обзор
Ваше приложение готово для развертывания на различных платформах. Все зависимости и конфигурации настроены.

## Требования системы
- Node.js 18+ 
- PostgreSQL 14+
- 512MB RAM минимум (рекомендуется 1GB+)

## Варианты развертывания

### 1. Railway (Рекомендуется - простое развертывание)

1. Создайте аккаунт на [railway.app](https://railway.app)
2. Подключите GitHub репозиторий
3. Railway автоматически определит Node.js приложение
4. Добавьте PostgreSQL из их маркетплейса
5. Переменные среды настроятся автоматически

**Преимущества:**
- Бесплатный тариф доступен
- Автоматическое масштабирование
- Встроенный PostgreSQL
- SSL сертификаты

### 2. Render

1. Создайте аккаунт на [render.com](https://render.com)
2. Создайте новый Web Service из GitHub
3. Добавьте PostgreSQL базу данных
4. Настройте переменные среды

**Настройки Render:**
```
Build Command: npm install && npm run build
Start Command: npm start
```

### 3. VPS (Digital Ocean, Linode, Vultr)

```bash
# 1. Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Установите PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 3. Настройте базу данных
sudo -u postgres createuser --interactive
sudo -u postgres createdb autoauction

# 4. Клонируйте и запустите проект
git clone <your-repo>
cd autobid-app
npm install
npm run build
npm start
```

### 4. Докер (Docker)

Создан Dockerfile для контейнеризации:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Переменные среды

Обязательные переменные для любой платформы:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
PORT=5000
```

## База данных

### Миграция с SQLite на PostgreSQL

Ваш код уже поддерживает PostgreSQL через Drizzle ORM. Просто:

1. Создайте PostgreSQL базу данных
2. Установите переменную DATABASE_URL
3. Запустите `npm run db:push` для создания таблиц

### Резервное копирование

```bash
# Экспорт данных из SQLite (если нужно)
sqlite3 autoauction.db .dump > backup.sql

# Импорт в PostgreSQL
psql -d autoauction -f backup.sql
```

## Производительность

### Рекомендуемые настройки для продакшена:

1. **Кэширование:** Redis для сессий
2. **CDN:** Cloudflare для статических файлов
3. **Мониторинг:** PM2 для Node.js процессов
4. **SSL:** Let's Encrypt или платформенный SSL

## Стоимость развертывания

**Railway:** Бесплатно до $5/месяц
**Render:** Бесплатно до $7/месяц  
**VPS:** $5-20/месяц
**Vercel + PlanetScale:** $0-29/месяц

## Готовые файлы конфигурации

В проекте уже есть:
- `package.json` с правильными скриптами
- `drizzle.config.ts` для базы данных
- `build-*.js` скрипты для развертывания
- Все зависимости настроены

## Поддержка

Приложение полностью готово к развертыванию. Все современные платформы автоматически определят конфигурацию и развернут проект.