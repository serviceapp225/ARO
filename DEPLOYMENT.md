# Deployment Instructions для AutoBid.TJ

## Быстрый старт

### 1. Сборка для продакшн
```bash
node build-production.js
```

### 2. Запуск приложения
```bash
PORT=3000 NODE_ENV=production node dist/index.js
```

## Содержимое dist/ папки после сборки

- `index.js` - Собранный серверный код (259.1kb)
- `autoauction.db` - SQLite база данных с демо-данными
- `public/` - Статические файлы фронтенда (HTML, CSS, JS)
- `build-info.json` - Информация о сборке

## Переменные окружения

- `PORT` - Порт для запуска (по умолчанию 5000 в dev, 3000 в production)
- `NODE_ENV=production` - Режим продакшн
- `SMS_LOGIN` - Логин для SMS сервиса OSON
- `SMS_HASH` - Хэш для SMS сервиса OSON
- `ADMIN_API_KEY` - Ключ для админ API

## Особенности deployment

### База данных
- Используется SQLite для простоты deployment
- База данных автоматически копируется в `dist/` при сборке
- Содержит демо-данные для тестирования

### Порты
- Development: 5000
- Production: 3000 (или значение из переменной PORT)

### Статические файлы
- Фронтенд собирается в `dist/public/`
- Сервер автоматически обслуживает статические файлы

## Проверка работы

```bash
# Проверка API
curl http://localhost:3000/api/listings

# Проверка фронтенда
curl http://localhost:3000/
```

## Troubleshooting

### Ошибка "address already in use"
```bash
# Проверить, что порт свободен
lsof -ti:3000

# Или использовать другой порт
PORT=8080 NODE_ENV=production node dist/index.js
```

### Проблемы с базой данных
```bash
# Убедиться, что база данных скопирована
ls -la dist/autoauction.db

# Пересобрать, если нужно
node build-production.js
```

## Production готовность

✅ Приложение полностью готово к deployment  
✅ Все ошибки сборки исправлены  
✅ База данных автоматически копируется  
✅ Статические файлы оптимизированы  
✅ Порт настраивается через переменную окружения  
✅ Размер сборки: 259.1kb (оптимизирован)  