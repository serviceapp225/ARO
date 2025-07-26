// SMS Прокси сервер для DigitalOcean VPS (188.166.61.86)
// Этот файл нужно загрузить на VPS и запустить там

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Настройки CORS и парсинг JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (уже работает)
app.get('/health', (req, res) => {
  res.json({
    status: "OK",
    service: "SMS Proxy for AUTOBID.TJ",
    ip: "188.166.61.86",
    timestamp: new Date().toISOString()
  });
});

// SMS прокси endpoint - ГЛАВНЫЙ ENDPOINT
app.post('/api/send-sms', async (req, res) => {
  console.log('📥 Получен запрос на отправку SMS:', req.body);
  
  const { phoneNumber, message } = req.body;
  
  if (!phoneNumber || !message) {
    console.error('❌ Отсутствуют обязательные параметры');
    return res.status(400).json({
      success: false,
      message: 'Отсутствуют phoneNumber или message'
    });
  }

  try {
    // Параметры для OSON SMS API (нужно настроить в переменных окружения)
    const SMS_LOGIN = process.env.SMS_LOGIN || 'your_login';
    const SMS_HASH = process.env.SMS_HASH || 'your_password';
    const SMS_SENDER = process.env.SMS_SENDER || 'AUTOBID';
    
    console.log(`📤 Отправка SMS через OSON API: ${phoneNumber}`);
    
    // Подготовка данных для OSON SMS
    const smsData = new URLSearchParams({
      'login': SMS_LOGIN,
      'password': SMS_HASH,
      'data': JSON.stringify([{
        'phone': phoneNumber,
        'text': message,
        'sender': SMS_SENDER
      }])
    });

    // Отправка запроса к OSON SMS API
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.osonsms.com/sendsms.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: smsData
    });

    const result = await response.text();
    console.log(`📨 Ответ OSON SMS API: ${result}`);
    
    // Проверка успешности отправки
    if (result.includes('success') || result.includes('OK') || result.includes('"status":"success"')) {
      console.log('✅ SMS успешно отправлен через OSON API');
      res.json({
        success: true,
        message: 'SMS отправлен успешно',
        osonsms_response: result
      });
    } else {
      console.error('❌ Ошибка OSON SMS API:', result);
      res.status(500).json({
        success: false,
        message: 'Ошибка OSON SMS API',
        osonsms_response: result
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка при отправке SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: error.message
    });
  }
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMS Прокси сервер запущен на порту ${PORT}`);
  console.log(`🌐 Доступен по адресу: http://188.166.61.86:${PORT}`);
  console.log(`📱 SMS endpoint: http://188.166.61.86:${PORT}/api/send-sms`);
  console.log(`🏥 Health check: http://188.166.61.86:${PORT}/health`);
});