const express = require('express');
const app = express();
const port = 3000;

// Добавляем парсинг JSON для POST запросов от Replit
app.use(express.json());

// CORS для приема запросов от Replit
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'VPS SMS Proxy v4 работает', 
    time: new Date().toISOString(),
    server: 'DigitalOcean 188.166.61.86',
    method: 'GET для OSON SMS API v1'
  });
});

// SMS отправка через OSON SMS API v1 (GET метод)
app.post('/api/send-sms', async (req, res) => {
  console.log('📞 VPS v4: Получен запрос на отправку SMS');
  console.log('📋 Данные запроса:', req.body);

  const { login, hash, sender, to, text } = req.body;
  
  // Проверка обязательных параметров
  if (!login || !hash || !sender || !to || !text) {
    console.error('❌ Отсутствуют параметры:', { login: !!login, hash: !!hash, sender: !!sender, to: !!to, text: !!text });
    return res.status(400).json({
      success: false,
      message: 'Отсутствуют обязательные параметры: login, hash, sender, to, text'
    });
  }

  // Очистка номера телефона (убираем +992 и оставляем только цифры)
  const cleanPhone = to.replace(/^\+?992/, '').replace(/[^0-9]/g, '');
  console.log(`📱 Очищенный номер: ${to} → ${cleanPhone}`);

  try {
    const txn_id = `autobid_${Date.now()}`;
    
    // Создаем GET URL для OSON SMS API v1 по образцу рабочего URL
    const apiUrl = new URL('https://api.osonsms.com/sendsms_v1.php');
    apiUrl.searchParams.append('from', sender);
    apiUrl.searchParams.append('phone_number', cleanPhone);
    apiUrl.searchParams.append('msg', encodeURIComponent(text));
    apiUrl.searchParams.append('str_hash', hash);
    apiUrl.searchParams.append('txn_id', txn_id);
    apiUrl.searchParams.append('login', login);

    console.log(`🌐 GET URL:`, apiUrl.toString());

    // GET запрос к OSON SMS API v1
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'AUTOBID.TJ VPS Proxy v4'
      }
    });

    const responseText = await response.text();
    console.log(`📡 OSON SMS ответ (${response.status}):`, responseText);

    if (response.ok) {
      // Проверяем, содержит ли ответ ошибку
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.error) {
          console.error('❌ OSON SMS API вернул ошибку:', jsonResponse.error);
          return res.status(422).json({
            success: false,
            message: `OSON SMS API ошибка: ${jsonResponse.error.msg}`,
            osonsms_response: responseText
          });
        }
      } catch (e) {
        // Если ответ не JSON, возможно это успешная отправка
        console.log('✅ Ответ не JSON, возможно успешная отправка');
      }

      console.log('✅ SMS отправлен успешно');
      res.json({
        success: true,
        message: 'SMS отправлен успешно',
        osonsms_response: responseText
      });
    } else {
      console.error(`❌ HTTP ошибка OSON SMS API: ${response.status}`);
      res.status(response.status).json({
        success: false,
        message: `HTTP ошибка OSON SMS API: ${response.status}`,
        osonsms_response: responseText
      });
    }

  } catch (error) {
    console.error('❌ Ошибка при отправке SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при отправке SMS',
      error: error.message
    });
  }
});

// Запуск сервера
app.listen(port, '0.0.0.0', () => {
  console.log('🚀 VPS SMS Proxy v4 запущен на порту 3000');
  console.log('📡 Метод: GET запросы к OSON SMS API v1');
  console.log('🔗 Образец рабочего URL использован для форматирования');
  console.log(`⏰ Время запуска: ${new Date().toISOString()}`);
});