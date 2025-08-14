# Deployment Troubleshooting - DigitalOcean (Август 2025)

## Проблема Health Check
```
ERROR failed health checks after 16 attempts with error Readiness probe failed: 
dial tcp 10.244.209.135:8080: connect: connection refused
```

## Стратегия Диагностики

### 1. Создан Минимальный Сервер
Создан `server/production-minimal.ts` с минимальным Express сервером:
- Только health check endpoint
- Базовая корневая страница  
- Без сложной инициализации БД
- Без WebSocket и тяжелых зависимостей

### 2. Возможные Причины

#### A. Проблемы с Dependencies
- Runtime зависимости отсутствуют в production stage
- Конфликт версий Node.js между builder и production

#### B. Проблемы с Базой Данных  
- Подключение к PostgreSQL блокирует запуск
- Отсутствуют переменные окружения

#### C. Проблемы с Портом
- Приложение слушает неправильный порт
- Конфликт портов в контейнере

#### D. Crash при Старте
- Ошибки в импортах модулей
- Синтаксические ошибки в коде

### 3. План Тестирования

#### Этап 1: Минимальный Сервер
```dockerfile
# Изменить в Dockerfile:
RUN npx esbuild server/production-minimal.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js
```

#### Этап 2: Если минимальный работает
Постепенно добавлять:
1. Статические файлы
2. API роуты (без БД)
3. Подключение к БД
4. WebSocket

#### Этап 3: Если минимальный не работает
Проверить:
1. Базовые системные зависимости
2. Node.js runtime
3. Переменные окружения

### 4. Диагностические Команды

#### Локальный тест Docker
```bash
docker build -t autobid-minimal .
docker run -p 8080:8080 -e NODE_ENV=production autobid-minimal
curl http://localhost:8080/health
```

#### Проверка в DigitalOcean
```bash
doctl apps logs <app-id> --follow
```

### 5. Переменные Окружения для Тестирования

Минимальные:
```env
NODE_ENV=production
PORT=8080
```

Полные:
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=test-secret
```

## Следующие Шаги

1. **Тест минимального сервера** - если работает, проблема в сложной инициализации
2. **Проверка логов** - точная причина crash приложения
3. **Постепенное добавление функций** - изоляция проблемного кода

## Статус
🔍 **ДИАГНОСТИКА** - Тестируем минимальный сервер для изоляции проблемы.