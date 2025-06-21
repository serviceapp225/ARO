# SMS Integration Guide for AUTOBID.TJ

## Overview
Инфраструктура для отправки SMS-кодов подтверждения готова. Система включает API endpoints для отправки и проверки SMS-кодов с защитой от злоупотреблений.

## Current Status
- ✅ SMS API endpoints созданы (`/api/auth/send-sms`, `/api/auth/verify-sms`)
- ✅ Система генерации и хранения 6-значных кодов
- ✅ Защита от спама (ограничение попыток, TTL кодов)
- ✅ Кэширование кодов в памяти сервера
- ⏳ Готово к интеграции с реальными SMS-провайдерами

## API Endpoints

### POST /api/auth/send-sms
Отправляет SMS-код на указанный номер телефона.

**Request:**
```json
{
  "phoneNumber": "+992 (22) 222-22-22"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "SMS код отправлен",
  "code": "123456" // Только в development режиме
}
```

### POST /api/auth/verify-sms
Проверяет введенный SMS-код.

**Request:**
```json
{
  "phoneNumber": "+992 (22) 222-22-22",
  "code": "123456"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Код подтвержден",
  "phoneNumber": "+992 (22) 222-22-22"
}
```

## Security Features
- **TTL кодов**: 5 минут с момента генерации
- **Ограничение попыток**: максимум 3 попытки ввода кода
- **Кэширование**: коды хранятся в памяти сервера
- **Защита от спама**: можно добавить rate limiting

## SMS Providers for Tajikistan

### Recommended Providers:

1. **Tcell SMS API**
   - Основной мобильный оператор Таджикистана
   - Высокая скорость доставки
   - Требует контракт с оператором

2. **Beeline SMS Gateway**
   - Второй по величине оператор
   - Хорошее покрытие
   - API-интеграция доступна

3. **Megafon SMS API**
   - Третий оператор на рынке
   - Стандартная интеграция

4. **Twilio (International)**
   - Международный провайдер
   - Простая интеграция
   - Может быть дороже

## Integration Steps

### 1. Получение API ключей
```bash
# Добавить в переменные окружения:
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Или для локального провайдера:
SMS_GATEWAY_URL=http://localhost:8080
SMS_GATEWAY_API_KEY=your_api_key
```

### 2. Установка зависимостей
```bash
# Для Twilio:
npm install twilio

# Для других провайдеров обычно достаточно fetch
```

### 3. Обновление sendSMSCode функции
В файле `server/routes.ts` раскомментируйте и настройте нужную интеграцию:

```typescript
// Пример для Twilio:
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const message = await client.messages.create({
  body: `Ваш код подтверждения AUTOBID.TJ: ${code}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phoneNumber
});
```

### 4. Обновление Frontend
В `client/src/pages/Login.tsx` обновите handleSubmit для использования SMS API:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch('/api/auth/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });

    const data = await response.json();
    
    if (data.success) {
      // Перейти на страницу ввода кода
      navigate('/verify-code', { state: { phoneNumber } });
    } else {
      alert(data.error || 'Ошибка отправки SMS');
    }
  } catch (error) {
    alert('Ошибка сети');
  } finally {
    setIsLoading(false);
  }
};
```

## Testing

### Development Mode
В режиме разработки коды выводятся в консоль сервера:
```
[SMS DEMO] Отправка SMS на +992 (22) 222-22-22: 123456
```

### Production Testing
1. Проверьте работу с тестовым номером
2. Убедитесь в корректности форматирования номеров
3. Проверьте TTL и ограничения попыток
4. Мониторьте логи отправки

## Cost Considerations
- **Tcell/Beeline**: ~0.01-0.05 сомони за SMS
- **Twilio**: ~$0.05-0.10 за SMS
- **Объем**: при 1000 регистраций в месяц = ~10-50 сомони

## Next Steps
1. Выбрать SMS-провайдера
2. Получить API ключи
3. Обновить функцию sendSMSCode
4. Создать страницу ввода кода
5. Протестировать интеграцию
6. Добавить мониторинг и логирование

## Support
При возникновении вопросов по интеграции SMS обращайтесь к документации выбранного провайдера или к разработчикам системы.