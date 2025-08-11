# DigitalOcean App Platform - Пошаговая настройка

## Создание приложения

### 1. Создать новое приложение
1. Откройте DigitalOcean Dashboard → Apps
2. Нажмите "Create App"
3. Выберите "GitHub" как источник
4. Подключите GitHub аккаунт и выберите репозиторий с AutoBid.TJ
5. Ветка: `main` (или основная ветка)

### 2. Настройка сервиса
**Service Type**: Web Service
- **Name**: autobid-web
- **Source Directory**: `/` (корень репозитория)
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **HTTP Port**: 8080
- **Instance Count**: 1
- **Instance Size**: Basic ($12/month) или Professional ($24/month)

### 3. Environment Variables (переменные окружения)
В разделе "Environment Variables" добавить:

#### Database
```
DATABASE_URL=postgresql://username:password@your-db-host:25060/autobid_production?sslmode=require
```

#### Application
```
NODE_ENV=production
PORT=8080
SESSION_SECRET=your-32-character-session-secret
```

#### DigitalOcean Spaces
```
SPACES_KEY=your-spaces-access-key
SPACES_SECRET=your-spaces-secret-key
SPACES_BUCKET=autobid-storage
SPACES_ENDPOINT=ams3.digitaloceanspaces.com
SPACES_REGION=ams3
```

#### SMS (если используется)
```
OSON_API_URL=https://api.oson.tj
OSON_API_KEY=your-oson-api-key
SMS_FROM_NUMBER=+992XXXXXXXXX
```

#### CORS и домен
```
ALLOWED_ORIGINS=https://your-app-name.ondigitalocean.app
```

### 4. Health Check
- **HTTP Path**: `/health`
- **Initial Delay**: 30 seconds
- **Period**: 10 seconds

### 5. HTTP Routes
- **Route**: `/`
- **Service**: autobid-web

## Создание приложения
После настройки нажать "Create Resources" - деплой займет 5-10 минут.

## Получение URL
После успешного деплоя вы получите URL вида:
`https://your-app-name.ondigitalocean.app`

## Мониторинг
- Логи доступны в App Platform Dashboard
- Метрики и алерты настраиваются автоматически
- Health check будет показывать статус приложения