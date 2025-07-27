# Обновление VPS сервера до версии v4 - Исправление метода GET

## Проблема
- Тестирование показало, что OSON SMS API v1 требует GET метод, а не POST
- Рабочий URL предоставлен: `https://api.osonsms.com/sendsms_v1.php?from=OsonSMS&phone_number=903331332&msg=hi2%21&str_hash=8ac95b524e5cca4a115c691e31f6726068f77881d9f7ba4075392b755a152d56&txn_id=test_asdf&login=zarex`

## Решение: VPS сервер v4

### Команды для обновления на VPS сервере (188.166.61.86):

```bash
# 1. Подключитесь к VPS
ssh root@188.166.61.86

# 2. Перейдите в рабочую директорию
cd /root

# 3. Остановите текущий сервер
pm2 stop sms-proxy

# 4. Создайте новый файл server-v4.js
cat > server-v4.js << 'EOF'
[Содержимое файла server-v4.js вставить здесь]
EOF

# 5. Запустите новый сервер v4
pm2 start server-v4.js --name sms-proxy

# 6. Проверьте статус
pm2 status

# 7. Просмотрите логи
pm2 logs sms-proxy

# 8. Протестируйте health check
curl http://localhost:3000/health
```

### Тест нового сервера v4:

```bash
# Тест отправки SMS через новый GET метод
curl -X POST http://localhost:3000/api/send-sms \
-H "Content-Type: application/json" \
-d '{
  "login": "zarex",
  "hash": "8ac95b524e5cca4a115c691e31f6726068f77881d9f7ba4075392b755a152d56",
  "sender": "OsonSMS",
  "to": "992903331332",
  "text": "Тест SMS v4 GET method"
}'
```

## Основные изменения в v4:

1. **Метод изменен с POST на GET** согласно рабочему URL
2. **Правильная кодировка текста** через encodeURIComponent
3. **Использование точного формата** из предоставленного рабочего URL
4. **Улучшенная обработка ответов** API

## Ожидаемый результат:
После обновления до v4 система должна корректно отправлять SMS через OSON SMS API v1 с использованием GET метода.

## Логи для диагностики:
```bash
pm2 logs sms-proxy --lines 50
```

Ищите строки с "GET URL" для подтверждения правильного формирования запроса.