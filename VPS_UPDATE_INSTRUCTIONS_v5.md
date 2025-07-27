# VPS SMS Server - Инструкции по обновлению v5

## Общая информация
- **VPS IP:** 188.166.61.86
- **Порт:** 3000
- **API endpoint:** http://188.166.61.86:3000/api/send-sms

## Настройки SMS API
- **Login:** zarex
- **Sender:** OsonSMS 
- **Password:** a6d5d8b47551199899862d6d768a4cb1

## Формат запроса к VPS серверу

```javascript
const vpsResponse = await fetch('http://188.166.61.86:3000/api/send-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    login: 'zarex',
    sender: 'OsonSMS',
    to: normalizedPhone, // номер без +992
    text: message,
    password: 'a6d5d8b47551199899862d6d768a4cb1'
  })
});
```

## Особенности VPS сервера (server-v5.js)
- Работает на порту 3000
- Принимает параметр **password** (не hash!)
- VPS сервер сам генерирует SHA256 хеш по формуле: `txn_id;login;sender;phone_number;password`
- Отправляет запрос к OSON SMS API с готовым хешем

## Обработка номеров телефонов
- Входящий формат: `+992903331332` или `992903331332`
- Отправляемый формат: `903331332` (убираем +992)

## Функции в server/routes.ts

### sendSMSCode (для кодов подтверждения)
```javascript
async function sendSMSCode(phoneNumber: string, code: string) {
  // Очистка номера
  let normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (normalizedPhone.startsWith('992')) {
    normalizedPhone = normalizedPhone.substring(3);
  }
  
  // Запрос к VPS
  const vpsResponse = await fetch('http://188.166.61.86:3000/api/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login: 'zarex',
      sender: 'OsonSMS',
      to: normalizedPhone,
      text: `Ваш код подтверждения: ${code}`,
      password: 'a6d5d8b47551199899862d6d768a4cb1'
    })
  });
}
```

### sendSMSNotification (для уведомлений о ставках)
```javascript
async function sendSMSNotification(phoneNumber: string, message: string) {
  // Аналогичная логика с тем же VPS endpoint
}
```

## Fallback режим
- При ошибке VPS сервера система автоматически переходит в демо-режим
- Сообщения логируются в консоль
- Пользователь получает подтверждение об отправке SMS

## Проверка работы
1. SMS коды подтверждения при регистрации/входе
2. SMS уведомления при перебитых ставках на аукционах
3. Логи в консоли сервера показывают статус отправки

## Восстановление после роллбэка
Скопировать эти функции в `server/routes.ts` (строки ~2856-2900 и ~2903-2947):
- `sendSMSCode` - для кодов подтверждения  
- `sendSMSNotification` - для уведомлений о ставках

Система заработает сразу после вставки кода.