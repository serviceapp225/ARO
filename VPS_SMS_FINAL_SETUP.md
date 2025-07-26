# ОКОНЧАТЕЛЬНАЯ НАСТРОЙКА VPS SMS ПРОКСИ

## СТАТУС: ✅ Код готов, нужно установить на VPS

### Что уже сделано:
- ✅ IP 188.166.61.86 добавлен в белый список OSON SMS
- ✅ VPS сервер работает (health check проходит)
- ✅ Replit приложение настроено на использование VPS прокси
- ✅ Создан правильный код для SMS прокси сервера

### Что нужно сделать СЕЙЧАС:

## 1. Подключиться к VPS
```bash
ssh root@188.166.61.86
```

## 2. Остановить текущий сервер и установить новый код

### Остановить старый сервер:
```bash
# Найти процесс
ps aux | grep node
# Убить процесс (если работает)
pkill -f node
```

### Создать новый проект:
```bash
# Создать директорию
mkdir -p /opt/autobid-sms-proxy
cd /opt/autobid-sms-proxy

# Создать server.js файл
nano server.js
```

**Скопировать содержимое из файла `vps-sms-proxy.js`** (весь код)

### Создать package.json:
```bash
nano package.json
```

**Скопировать содержимое из файла `vps-package.json`**

### Установить зависимости:
```bash
npm install
```

## 3. Настроить переменные окружения
```bash
nano .env
```

Добавить в файл:
```
SMS_LOGIN=ваш_логин_oson
SMS_HASH=ваш_пароль_oson
SMS_SENDER=AUTOBID
```

## 4. Запустить сервер
```bash
# Тестовый запуск
node server.js

# Если работает, установить PM2 для автозапуска
npm install -g pm2
pm2 start server.js --name "sms-proxy"
pm2 startup
pm2 save
```

## 5. Протестировать работу
```bash
# Тест SMS endpoint
curl -X POST http://188.166.61.86:3000/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+992903331332", "message": "Тест SMS"}'
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "message": "SMS отправлен успешно"
}
```

## РЕЗУЛЬТАТ
После выполнения этих шагов:
- ✅ SMS будут отправляться реально через OSON API
- ✅ Архитектура: Replit → VPS (188.166.61.86) → OSON SMS
- ✅ Проблема с меняющимися IP Replit решена навсегда

## ВАЖНО
Все файлы кода уже созданы в этом проекте:
- `vps-sms-proxy.js` - код сервера для VPS
- `vps-package.json` - зависимости для VPS  
- `VPS_SETUP_INSTRUCTIONS.md` - подробные инструкции

Просто скопируйте код на VPS и запустите!