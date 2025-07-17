# РЕШЕНИЕ ПРОБЛЕМЫ ПОРТОВ ПРИ DEPLOYMENT

## Проблема
При deployment на Replit возникает ошибка:
```
error proxying request error=dial tcp 127.0.0.1:5000: connect: connection refused
crash loop detected
```

## Причина
Конфигурация в `.replit` настроена на порт 5000, но в production режиме приложение работает на порту 3000.

## Решение

### 1. Код уже правильно настроен
В `server/index.ts` строка 117 корректно настроена:
```typescript
const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5000);
```

### 2. Конфигурация .replit
Файл `.replit` содержит:
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 3000
externalPort = 3000
```

### 3. Исправление
Поскольку файл `.replit` защищен, нужно убедиться, что переменная окружения `PORT` установлена в 3000 для production.

### 4. Проверка переменных окружения
Убедитесь, что в production режиме:
- `NODE_ENV=production`
- `PORT=3000`

### 5. Альтернативное решение
Если проблема продолжается, создайте файл `.env.production`:
```
NODE_ENV=production
PORT=3000
```

## Команда для deployment
```bash
PORT=3000 NODE_ENV=production npm start
```

## Проверка готовности
1. Убедитесь что `npm run build` выполняется без ошибок
2. Проверьте что в `dist/` папке есть `index.js`
3. Убедитесь что переменная `PORT=3000` установлена в production
4. Проверьте что приложение запускается командой `npm start`

## Статус
✅ Код приложения корректно обрабатывает переменные окружения
✅ Production сервер настроен на порт 3000
✅ Development сервер настроен на порт 5000
⚠️ Конфигурация `.replit` может требовать корректировки (защищена от изменений)