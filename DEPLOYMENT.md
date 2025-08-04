# Руководство по деплою AUTOBID.TJ

## Проблема, которая была решена

**Проблема:** При деплое показывался белый экран с ошибкой:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"
```

**Причина:** Приложение работало в development режиме на production сервере, пытаясь загружать исходные `.tsx` файлы вместо собранных `.js` файлов.

## Решение

### 1. Правильная сборка приложения
```bash
npm run build
```

Эта команда:
- Собирает frontend в папку `dist/public/` с готовыми JS/CSS файлами
- Собирает backend в файл `dist/index.js`
- Создает оптимизированные статические файлы

### 2. Запуск в production режиме
```bash
NODE_ENV=production npm run start
```

### 3. Полный процесс деплоя
```bash
# 1. Сборка приложения
npm run build

# 2. Запуск в production
NODE_ENV=production node dist/index.js
```

## Структура файлов после сборки

```
dist/
├── index.js                    # Собранный backend сервер
└── public/                     # Статические файлы frontend
    ├── index.html              # HTML с ссылками на собранные файлы
    └── assets/
        ├── index-[hash].js     # Собранный JavaScript
        └── index-[hash].css    # Собранный CSS
```

## Ключевые изменения в коде

### server/index.ts
```typescript
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  console.log("🏭 PRODUCTION: Используем статические файлы");
  serveStatic(app);
} else {
  console.log("🛠️ DEVELOPMENT: Используем Vite middleware");
  await setupVite(app, server);
}
```

### Порты
- **Development:** порт 5000
- **Production:** порт 3000 (стандарт для Replit деплоя)

## Проверка работоспособности

### После деплоя должны быть логи:
```
🏭 PRODUCTION: Используем статические файлы
🚀 DEPLOYMENT: Безопасная инициализация для деплоя...
✅ DEPLOYMENT: Инициализация завершена успешно
serving on port 3000
```

### Проверка статических файлов:
```bash
curl -I http://localhost:3000/
# Должен вернуть: Content-Type: text/html; charset=UTF-8
```

## Важные замечания

1. **Обязательно установить NODE_ENV=production** при деплое
2. **Обязательно запустить npm run build** перед запуском
3. **Папка dist/ должна существовать** с готовыми файлами
4. **Все функции приложения сохраняются** - это только техническая настройка

## Что НЕ затронуто

- ✅ API routes - все остаются работающими
- ✅ База данных - никаких изменений
- ✅ WebSocket - real-time функции сохранены
- ✅ Аутентификация - система пользователей не изменена
- ✅ Все страницы и компоненты - UI остается тем же

Проблема была исключительно в настройках сборки и деплоя, не в функциональности приложения.