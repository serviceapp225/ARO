# Обновление VPS сервера до версии v3 - ИСПРАВЛЕНИЕ SMS

## Проблема
VPS сервер v2 использовал GET запрос к OSON SMS API, но API требует POST запрос. Это вызывало ошибку "Parameter not set".

## Решение - VPS сервер v3
Исправлен метод запроса с GET на POST с правильными заголовками.

## Пошаговые инструкции для обновления

### 1. Подключитесь к VPS серверу
```bash
ssh root@188.166.61.86
```

### 2. Остановите текущий сервер
```bash
pm2 stop sms-proxy
```

### 3. Создайте новый файл server-v3.js
```bash
nano server-v3.js
```

### 4. Скопируйте содержимое server-v3.js из Replit проекта
Скопируйте весь код из файла `server-v3.js` и вставьте в nano редактор.

### 5. Сохраните файл
- Нажмите `Ctrl+X`
- Нажмите `Y` 
- Нажмите `Enter`

### 6. Установите зависимости (если нужно)
```bash
npm install node-fetch
```

### 7. Запустите новый сервер
```bash
pm2 start server-v3.js --name sms-proxy-v3
```

### 8. Проверьте статус
```bash
pm2 status
pm2 logs sms-proxy-v3
```

### 9. Тест health check
```bash
curl http://localhost:3000/health
```

### 10. Тест SMS API
```bash
curl -X POST http://localhost:3000/api/send-sms \
-H "Content-Type: application/json" \
-d '{
  "login": "zarex",
  "hash": "8ac95b524e5cca4a115c691e31f6726068f77881d9f7ba4075392b755a152d56",
  "sender": "OsonSMS",
  "to": "992903331332",
  "text": "Тест SMS v3"
}'
```

### 11. Если все работает, удалите старый сервер
```bash
pm2 delete sms-proxy
```

### 12. Переименуйте новый сервер
```bash
pm2 delete sms-proxy-v3
pm2 start server-v3.js --name sms-proxy
pm2 save
```

## Ожидаемый результат
После обновления тестирование SMS должно вернуть успешный ответ или более информативную ошибку от OSON SMS API.

## Проверка из Replit приложения
После обновления VPS сервера протестируйте отправку SMS через приложение - должно работать без ошибки "Parameter not set".