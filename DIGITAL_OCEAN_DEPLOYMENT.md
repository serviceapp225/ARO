# 🚀 Миграция NARXI TU на Digital Ocean App Platform

## ✅ Подготовка завершена

Проект готов к деплою на Digital Ocean App Platform с использованием Neon PostgreSQL в качестве продакшн базы данных.

## 📋 Что готово

- ✅ **GitHub репозиторий**: `https://github.com/serviceapp225/ARO.git`
- ✅ **Конфигурация сборки**: Протестирована продакшн сборка
- ✅ **Digital Ocean конфиг**: `.do/app.yaml` создан
- ✅ **База данных**: Neon PostgreSQL настроена
- ✅ **Порты**: Настроены для продакшн (PORT=3000)

## 🎯 Пошаговая инструкция деплоя

### 1. Создание приложения в Digital Ocean

1. **Переходите**: https://cloud.digitalocean.com/apps
2. **Нажимайте**: "Create App"
3. **Выбираете**: "GitHub" как источник
4. **Подключаете**: репозиторий `serviceapp225/ARO`
5. **Выбираете**: ветку `main`

### 2. Автоматическая настройка

Digital Ocean автоматически определит:
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **HTTP Port**: `3000`
- **Node.js версия**: Из package.json

### 3. Переменные окружения (ОБЯЗАТЕЛЬНО!)

В разделе **Environment Variables** добавьте:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://neondb_owner:npg_btTsuY4Xj1VG@ep-raspy-snow-adivqwmp.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Опционально (если есть SMS):**
```bash
SMS_LOGIN=ваш_sms_логин
SMS_HASH=ваш_sms_хэш
ADMIN_API_KEY=ваш_admin_ключ
```

### 4. Настройки ресурсов

**Рекомендации:**
- **Plan**: Professional ($12/месяц) для продакшн
- **Instance Size**: Basic
- **Instance Count**: 1 (можно автомасштабировать позже)

### 5. Deploy!

Нажмите **"Create Resources"** и дождитесь завершения деплоя (5-10 минут).

## 🌐 После деплоя

### Автоматически получите:
- **URL приложения**: `https://aro-xxxx.ondigitalocean.app`
- **HTTPS сертификат**: Автоматический SSL
- **CDN**: Глобальная доставка контента
- **Автодеплой**: При push в GitHub

### Настройка домена (narxi.tu)

1. **В Digital Ocean App**: Settings → Domains → Add Domain
2. **Добавьте**: `narxi.tu` и `www.narxi.tu`
3. **В DNS провайдера**:
   - `A record`: `@` → IP от Digital Ocean
   - `CNAME`: `www` → `aro-xxxx.ondigitalocean.app`

## 🔧 Архитектура после миграции

```
Digital Ocean App Platform
├── Веб-приложение (Node.js + React)
├── WebSocket соединения
├── Статические файлы
└── API endpoints
                 ↓
              Подключение
                 ↓
         Neon PostgreSQL
         (остается в Replit)
         ├── Пользователи
         ├── Аукционы
         ├── Ставки
         └── Все данные
```

## 💰 Стоимость

- **Digital Ocean App Platform**: $12/месяц (Professional)
- **Neon PostgreSQL**: Текущий тариф в Replit
- **Итого**: ~$12-15/месяц

## 🔍 Проверка работы

После деплоя проверьте:
1. **Главная страница**: Загружается ли интерфейс
2. **API**: `/api/listings` возвращает данные
3. **WebSocket**: Работают ли обновления в реальном времени
4. **База данных**: Подключение к Neon PostgreSQL

## 🚨 Troubleshooting

### Если не запускается:
1. Проверьте переменную `DATABASE_URL`
2. Убедитесь что `NODE_ENV=production`
3. Проверьте логи в Digital Ocean Console

### Если проблемы с базой:
1. Проверьте доступность Neon из Digital Ocean
2. Убедитесь что SSL включен (`?sslmode=require`)

## ✅ Готово к запуску!

Все настроено для безпроблемного деплоя. Digital Ocean автоматически:
- Установит зависимости
- Соберет приложение
- Запустит сервер
- Настроит HTTPS
- Обеспечит автомасштабирование

**Время деплоя**: 5-10 минут
**Простота**: Просто push в GitHub = автодеплой