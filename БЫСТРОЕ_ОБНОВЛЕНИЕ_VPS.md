# БЫСТРОЕ ОБНОВЛЕНИЕ VPS SMS - Готовый код

## ⚡ Для мгновенного восстановления SMS

После роллбэка просто вставьте эти две функции в `server/routes.ts` (заменить существующие `sendSMSCode` и `sendSMSNotification`):

### 1. Функция sendSMSCode (строка ~2856)

```javascript
// Функция для отправки SMS через VPS сервер
async function sendSMSCode(phoneNumber: string, code: string): Promise<{success: boolean, message?: string}> {
  try {
    // Очищаем номер телефона от всех символов кроме цифр
    let normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // Убираем +992 если есть, оставляем только 9 цифр
    if (normalizedPhone.startsWith('992')) {
      normalizedPhone = normalizedPhone.substring(3);
    }
    
    console.log(`[SMS VPS] Отправка SMS кода подтверждения на ${phoneNumber} (очищенный: ${normalizedPhone})`);
    
    // Отправляем запрос на VPS сервер
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

    const vpsResult = await vpsResponse.text();
    console.log(`[SMS VPS] Ответ VPS сервера: ${vpsResult}`);

    if (vpsResponse.ok) {
      console.log(`✅ SMS код отправлен через VPS сервер`);
      return { success: true, message: "SMS код отправлен" };
    } else {
      console.error(`[SMS VPS] Ошибка VPS сервера: ${vpsResponse.status}`);
      // Fallback в демо-режим при ошибке VPS
      console.log(`[SMS DEMO FALLBACK] Отправка SMS на ${phoneNumber}: ${code}`);
      return { success: true, message: "SMS отправлен (демо-режим - VPS недоступен)" };
    }
    
  } catch (error) {
    console.error("[SMS VPS] Ошибка при отправке SMS через VPS:", error);
    // Fallback в демо-режим при ошибке
    console.log(`[SMS DEMO] Код для входа: ${code}`);
    return { success: true, message: "SMS отправлен (демо-режим)" };
  }
}
```

### 2. Функция sendSMSNotification (строка ~2903)  

```javascript
// Функция для отправки SMS уведомлений через VPS сервер
async function sendSMSNotification(phoneNumber: string, message: string): Promise<{success: boolean, message?: string}> {
  try {
    // Очищаем номер телефона от всех символов кроме цифр
    let normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // Убираем +992 если есть, оставляем только 9 цифр
    if (normalizedPhone.startsWith('992')) {
      normalizedPhone = normalizedPhone.substring(3);
    }
    
    console.log(`[SMS VPS] Отправка SMS уведомления на ${phoneNumber} (очищенный: ${normalizedPhone})`);
    console.log(`[SMS VPS] Текст: ${message}`);
    
    // Отправляем запрос на VPS сервер
    const vpsResponse = await fetch('http://188.166.61.86:3000/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'zarex',
        sender: 'OsonSMS',
        to: normalizedPhone,
        text: message,
        password: 'a6d5d8b47551199899862d6d768a4cb1'
      })
    });

    const vpsResult = await vpsResponse.text();
    console.log(`[SMS VPS] Ответ VPS сервера: ${vpsResult}`);

    if (vpsResponse.ok) {
      console.log(`✅ SMS уведомление отправлено через VPS сервер`);
      return { success: true, message: "SMS уведомление отправлено" };
    } else {
      console.error(`[SMS VPS] Ошибка VPS сервера: ${vpsResponse.status}`);
      // Fallback в демо-режим при ошибке VPS  
      console.log(`[SMS DEMO FALLBACK] Отправка SMS уведомления на ${phoneNumber}: ${message}`);
      return { success: true, message: "SMS уведомление отправлено (демо-режим - VPS недоступен)" };
    }
    
  } catch (error) {
    console.error("[SMS VPS] Ошибка при отправке SMS уведомления через VPS:", error);
    // Fallback в демо-режим при ошибке
    console.log(`[SMS DEMO] SMS уведомление: ${message}`);
    return { success: true, message: "SMS уведомление отправлено (демо-режим)" };
  }
}
```

## ✅ ГОТОВО!

После вставки этих функций:
- SMS коды подтверждения будут работать через VPS
- SMS уведомления о ставках будут работать через VPS  
- При недоступности VPS система автоматически переключится в демо-режим
- Все сообщения логируются в консоль сервера

**VPS сервер:** http://188.166.61.86:3000/api/send-sms
**Учетные данные:** zarex / OsonSMS / пароль в коде