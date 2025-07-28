# Инструкции по установке SMS прокси на DigitalOcean VPS

## Шаг 1: Подключение к VPS
```bash
ssh root@188.166.61.86
```

## Шаг 2: Установка Node.js (если не установлен)
```bash
# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Проверка установки
node --version
npm --version
```

## Шаг 3: Создание директории для проекта
```bash
mkdir -p /opt/autobid-sms-proxy
cd /opt/autobid-sms-proxy
```

## Шаг 4: Загрузка файлов на VPS
Скопируйте содержимое файлов:

### Файл: server.js
```javascript
// Содержимое из vps-sms-proxy.js
```

### Файл: package.json
```json
// Содержимое из vps-package.json
```

## Шаг 5: Установка зависимостей
```bash
npm install
```

## Шаг 6: Настройка переменных окружения
```bash
# Создать файл .env
nano .env
```

Добавить в файл .env:
```
SMS_LOGIN=your_oson_login
SMS_HASH=your_oson_password
SMS_SENDER=AUTOBID
```

## Шаг 7: Тестовый запуск
```bash
node server.js
```

Должно появиться:
```
🚀 SMS Прокси сервер запущен на порту 3000
🌐 Доступен по адресу: http://188.166.61.86:3000
📱 SMS endpoint: http://188.166.61.86:3000/api/send-sms
🏥 Health check: http://188.166.61.86:3000/health
```

## Шаг 8: Настройка автозапуска (PM2)
```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start server.js --name "sms-proxy"

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

## Шаг 9: Проверка работы
```bash
# Тест health check
curl http://188.166.61.86:3000/health

# Тест SMS endpoint
curl -X POST http://188.166.61.86:3000/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+992903331332", "message": "Test SMS"}'
```

## Шаг 10: Настройка брандмауэра (если нужно)
```bash
# Открыть порт 3000
ufw allow 3000
```

После выполнения всех шагов SMS прокси будет работать и принимать запросы от Replit приложения.