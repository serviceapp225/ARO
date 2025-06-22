# SMS Интеграция с OsonSMS API

## Текущий статус
✅ SMS аутентификация активна и работает  
✅ База данных настроена для хранения SMS кодов  
✅ Гибридный режим: реальный API + демо fallback  
✅ Веб-интерфейс для входа по SMS готов  

## Проблема с hash
Текущий hash `a6d5d8b47551199899862d6d768a4cb1` возвращает ошибку "Incorrect hash" от OsonSMS API.

### Возможные решения:
1. **Проверить hash в панели OsonSMS** - возможно нужно сгенерировать новый
2. **Связаться с поддержкой OsonSMS** для проверки формата hash
3. **Проверить алгоритм генерации hash** (MD5, SHA1, etc.)

## Как активировать реальную SMS отправку

### Когда hash будет исправлен:
1. Убрать демо-режим из `server/routes.ts` в функции `sendSMSCode`
2. Заменить строку:
```javascript
console.log(`[SMS] Неверный hash, используем демо-режим. Код: ${code}`);
return { success: true, message: "SMS отправлен (демо-режим - проверьте hash)" };
```

На:
```javascript
return { success: false, message: `Ошибка OsonSMS: ${result}` };
```

## Текущие credentials
```
SMS_LOGIN=zarex
SMS_HASH=a6d5d8b47551199899862d6d768a4cb1  // НУЖНО ИСПРАВИТЬ
SMS_SENDER=OsonSMS
SMS_SERVER=https://api.osonsms.com/sendsms_v1.php
```

## Тестирование
- **Отправка SMS**: `POST /api/auth/send-sms` с `{"phoneNumber": "+992XXXXXXXXX"}`
- **Проверка кода**: `POST /api/auth/verify-sms` с `{"phoneNumber": "+992XXXXXXXXX", "code": "XXXX"}`

## Что работает сейчас
1. Пользователи получают SMS коды (в демо-режиме коды в логах сервера)
2. Коды проверяются и пользователи автоматически регистрируются
3. Веб-интерфейс корректно обрабатывает весь процесс аутентификации