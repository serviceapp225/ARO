# ВРЕМЕННОЕ РЕШЕНИЕ - NGROK ТУННЕЛЬ

## 🎯 Быстрое решение SMS проблемы через Ngrok

Пока ищем подходящий VPS, можем временно использовать ngrok для создания публичного IP:

### Установка Ngrok:
1. Регистрация: https://ngrok.com (бесплатно)
2. Скачивание: https://ngrok.com/download
3. Аутентификация с токеном

### Создание SMS прокси локально:

```bash
# Создание простого SMS прокси
mkdir sms-proxy-local
cd sms-proxy-local

# Создание package.json
cat > package.json << 'EOF'
{
  "name": "sms-proxy-local",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# Создание сервера
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'SMS Proxy Local' });
});

app.post('/api/send-sms', async (req, res) => {
  try {
    const { login, hash, sender, to, text } = req.body;
    console.log('SMS запрос:', { sender, to, text });
    
    const params = new URLSearchParams({ login, hash, sender, to, text });
    
    const response = await fetch('http://api.osonsms.com/sendsms.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    
    const result = await response.text();
    console.log('OSON ответ:', result);
    res.status(response.status).send(result);
    
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('SMS Proxy запущен на порту 3001');
});
EOF

# Установка зависимостей
npm install

# Запуск сервера
node server.js
```

### Создание туннеля Ngrok:
```bash
# В другом терминале
ngrok http 3001
```

Ngrok покажет публичный URL типа: `https://abc123.ngrok.io`

### Интеграция с Replit:
Обновить SMS_PROXY_URL в коде на ngrok URL.

## Преимущества:
- Моментальная настройка (5 минут)
- Бесплатно для тестирования
- Статический IP для OSON белого списка

## Недостатки:
- Временное решение
- URL меняется при перезапуске (бесплатная версия)
- Нужно держать компьютер включенным

Это поможет протестировать SMS пока ищем постоянный VPS.