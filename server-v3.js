// SMS Прокси сервер v3 для DigitalOcean VPS (188.166.61.86)
// Исправлен POST запрос к OSON SMS API v1

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Настройки CORS и парсинг
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "OK",
    service: "SMS Proxy v3 for AUTOBID.TJ",
    ip: "188.166.61.86",
    timestamp: new Date().toISOString(),
    api: "OSON SMS v1 (POST method)"
  });
});

// SMS прокси endpoint - исправленный POST метод
app.post('/api/send-sms', async (req, res) => {
  console.log('📥 Получен запрос от Replit:', req.body);
  
  const { login, hash, sender, to, text } = req.body;
  
  // Проверка обязательных параметров
  if (!login || !hash || !sender || !to || !text) {
    console.error('❌ Отсутствуют параметры:', { login: !!login, hash: !!hash, sender: !!sender, to: !!to, text: !!text });
    return res.status(400).json({
      success: false,
      message: 'Отсутствуют обязательные параметры: login, hash, sender, to, text'
    });
  }

  // Очистка номера телефона
  let cleanPhone = to.toString().replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('992')) {
    cleanPhone = cleanPhone.substring(3);
  }
  
  console.log(`📱 Очищенный номер: ${to} → ${cleanPhone}`);

  try {
    const txn_id = `autobid_${Date.now()}`;
    
    // Подготавливаем данные для POST запроса
    const formData = new URLSearchParams();
    formData.append('from', sender);
    formData.append('phone_number', cleanPhone);
    formData.append('msg', text);
    formData.append('str_hash', hash);
    formData.append('txn_id', txn_id);
    formData.append('login', login);

    console.log(`📋 Отправляем данные:`, Object.fromEntries(formData));

    // POST запрос к OSON SMS API v1
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.osonsms.com/sendsms_v1.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'AUTOBID.TJ VPS Proxy v3'
      },
      body: formData
    });

    const result = await response.text();
    console.log(`📨 Ответ OSON SMS:`, result);
    
    if (response.ok) {
      console.log('✅ SMS отправлен успешно');
      res.json({
        success: true,
        message: 'SMS отправлен успешно',
        osonsms_response: result,
        txn_id: txn_id
      });
    } else {
      console.error('❌ HTTP ошибка:', response.status, result);
      res.status(500).json({
        success: false,
        message: `HTTP ошибка OSON SMS API: ${response.status}`,
        osonsms_response: result
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка отправки SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: error.message
    });
  }
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMS Прокси сервер v3 запущен на порту ${PORT}`);
  console.log(`🌐 http://188.166.61.86:${PORT}`);
  console.log(`🔗 Health: http://188.166.61.86:${PORT}/health`);
  console.log(`📱 SMS API: http://188.166.61.86:${PORT}/api/send-sms`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));