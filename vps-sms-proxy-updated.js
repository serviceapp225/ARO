// Обновленный SMS Прокси сервер для DigitalOcean VPS (188.166.61.86)
// Использует новый API OSON SMS v1

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Настройки CORS и парсинг JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Загрузка переменных окружения из .env файла
require('dotenv').config();

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "OK",
    service: "SMS Proxy v2 for AUTOBID.TJ",
    ip: "188.166.61.86",
    timestamp: new Date().toISOString(),
    api: "OSON SMS v1"
  });
});

// SMS прокси endpoint - обновленный для OSON SMS v1
app.post('/api/send-sms', async (req, res) => {
  console.log('📥 Получен запрос от Replit:', req.body);
  
  const { login, hash, sender, to, text } = req.body;
  
  // Проверка обязательных параметров
  if (!login || !hash || !sender || !to || !text) {
    console.error('❌ Отсутствуют обязательные параметры:', { login: !!login, hash: !!hash, sender: !!sender, to: !!to, text: !!text });
    return res.status(400).json({
      success: false,
      message: 'Отсутствуют обязательные параметры: login, hash, sender, to, text'
    });
  }

  // Очистка номера телефона (убираем +992 если есть)
  let cleanPhone = to.toString();
  if (cleanPhone.startsWith('+992')) {
    cleanPhone = cleanPhone.substring(4); // Убираем +992
  } else if (cleanPhone.startsWith('992')) {
    cleanPhone = cleanPhone.substring(3); // Убираем 992
  }
  
  console.log(`📱 Очищенный номер телефона: ${to} → ${cleanPhone}`);

  try {
    // Генерируем уникальный txn_id для каждого SMS
    const txn_id = `autobid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    console.log(`📤 Отправка SMS через OSON API v1:`, {
      login: login,
      sender: sender,
      phone: cleanPhone,
      txn_id: txn_id,
      text: text.substring(0, 20) + '...'
    });
    
    // Создаем URL с параметрами для OSON SMS v1
    const apiUrl = new URL('https://api.osonsms.com/sendsms_v1.php');
    apiUrl.searchParams.append('from', sender);
    apiUrl.searchParams.append('phone_number', cleanPhone);
    apiUrl.searchParams.append('msg', encodeURIComponent(text));
    apiUrl.searchParams.append('str_hash', hash);
    apiUrl.searchParams.append('txn_id', txn_id);
    apiUrl.searchParams.append('login', login);

    console.log(`🌐 URL запроса: ${apiUrl.toString()}`);

    // Отправка запроса к OSON SMS API v1
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'AUTOBID.TJ VPS Proxy'
      }
    });

    const result = await response.text();
    console.log(`📨 Ответ OSON SMS API:`, result);
    
    // Проверка успешности отправки
    if (response.ok) {
      console.log('✅ SMS успешно отправлен через OSON API v1');
      res.json({
        success: true,
        message: 'SMS отправлен успешно',
        osonsms_response: result,
        txn_id: txn_id
      });
    } else {
      console.error('❌ HTTP ошибка OSON SMS API:', response.status, result);
      res.status(500).json({
        success: false,
        message: `HTTP ошибка OSON SMS API: ${response.status}`,
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
  console.log(`🚀 SMS Прокси сервер v2 запущен на порту ${PORT}`);
  console.log(`🌐 Доступен по адресу: http://188.166.61.86:${PORT}`);
  console.log(`🔗 Health check: http://188.166.61.86:${PORT}/health`);
  console.log(`📱 SMS endpoint: http://188.166.61.86:${PORT}/api/send-sms`);
  console.log(`📋 Переменные окружения: SMS_LOGIN=${process.env.SMS_LOGIN ? 'установлен' : 'НЕ УСТАНОВЛЕН'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Получен сигнал SIGTERM, завершаем работу...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Получен сигнал SIGINT, завершаем работу...');
  process.exit(0);
});