# DigitalOcean App Platform - Deployment Guide

## Исправленные проблемы (Август 2025)

✅ **Dockerfile исправлен**:
- Добавлены системные зависимости (python3, make, g++)
- Правильная установка npm зависимостей с `--include=dev`
- Корректная команда сборки: `npx vite build && npx esbuild server/production.ts`
- Исправлен путь для production entry point

✅ **Конфигурация App Platform готова**:
- `.do/app.yaml` настроен правильно
- Порт 8080 сконфигурирован
- Health check endpoint `/health`
- Все необходимые переменные окружения

## Шаги деплоя

### 1. Подготовка DigitalOcean

1. **Создайте Managed Database**:
   ```
   - Name: autobid-db
   - Engine: PostgreSQL 16
   - Size: Basic ($15/month)
   - Region: Amsterdam (AMS3)
   - VPC: Default
   ```

2. **Создайте Spaces Bucket**:
   ```
   - Name: autobid-storage
   - Region: AMS3 (Amsterdam)
   - CDN: Enabled
   - Access: Restricted
   ```

### 2. Настройка секретов

В DigitalOcean App Platform добавьте следующие секреты:

```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
SESSION_SECRET=your-random-session-secret-here
SPACES_KEY=your-spaces-access-key
SPACES_SECRET=your-spaces-secret-key
SMS_API_URL=your-sms-api-url
SMS_API_TOKEN=your-sms-api-token
```

### 3. Деплой приложения

1. В DigitalOcean Control Panel перейдите в Apps
2. Создайте новое приложение из GitHub репозитория
3. Выберите ветку main
4. DigitalOcean автоматически обнаружит `.do/app.yaml`
5. Проверьте конфигурацию и нажмите "Create App"

### 4. После деплоя

1. Проверьте health check: `https://your-app.ondigitalocean.app/health`
2. Запустите миграцию базы данных (если нужно)
3. Загрузите первоначальные данные

## Troubleshooting

### Если сборка не удается:
- Проверьте логи в DigitalOcean Console
- Убедитесь что все зависимости установлены
- Проверьте что production.ts файл существует

### Если приложение не запускается:
- Проверьте переменные окружения
- Убедитесь что DATABASE_URL правильный
- Проверьте логи приложения в console

## Стоимость

- App Platform Professional XS: ~$24/месяц
- Managed PostgreSQL Basic: ~$15/месяц  
- Spaces Storage: ~$5-10/месяц
- **Итого: ~$45-50/месяц**

## Альтернатива

Если нужно сэкономить, можно использовать Basic план App Platform за $12/месяц, но с ограничениями по производительности.