# БЫСТРОЕ ОБНОВЛЕНИЕ VPS ДО ВЕРСИИ 5 - ПРАВИЛЬНЫЙ АЛГОРИТМ ХЕШИРОВАНИЯ

## Команды для SSH подключения к VPS:

```bash
# 1. Подключение к VPS
ssh root@188.166.61.86

# 2. Остановка старого сервера
pm2 stop all
pm2 delete all

# 3. Создание нового server-v5.js (скопировать содержимое из файла server-v5.js)
nano server-v5.js
```

## Содержимое server-v5.js (вставить в nano):

```javascript
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

const port = 3000;

// CORS headers helper
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
}

// Parse JSON body helper
function parseJSON(req, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      callback(null, data);
    } catch (error) {
      callback(error);
    }
  });
}

// Правильный алгоритм хеширования для OSON SMS
function generateOsonHash(txn_id, login, sender, phone_number, password) {
  const hashString = `${txn_id};${login};${sender};${phone_number};${password}`;
  console.log('🔐 Строка для хеширования:', hashString);
  const hash = crypto.createHash('sha256').update(hashString).digest('hex');
  console.log('🔑 SHA256 хеш:', hash);
  return hash;
}

// Main server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  setCORSHeaders(res);

  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health endpoint
  if (method === 'GET' && pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'VPS SMS Proxy v5 - ПРАВИЛЬНЫЙ АЛГОРИТМ',
      time: new Date().toISOString(),
      server: 'DigitalOcean 188.166.61.86',
      hash_format: 'txn_id;login;sender;phone_number;password',
      hash_algorithm: 'SHA256'
    }));
    return;
  }

  // SMS API endpoint
  if (method === 'POST' && pathname === '/api/send-sms') {
    parseJSON(req, (err, data) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Ошибка парсинга JSON'
        }));
        return;
      }

      console.log('📞 VPS v5: Получен запрос на отправку SMS');
      
      const { login, sender, to, text, password } = data;
      
      if (!login || !sender || !to || !text || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Отсутствуют обязательные параметры: login, sender, to, text, password'
        }));
        return;
      }

      const cleanPhone = to.replace(/^\+?992/, '').replace(/[^0-9]/g, '');
      const txn_id = `autobid_${Date.now()}`;
      
      // Генерируем правильный хеш
      const str_hash = generateOsonHash(txn_id, login, sender, cleanPhone, password);
      
      const params = querystring.stringify({
        from: sender,
        phone_number: cleanPhone,
        msg: text,
        str_hash: str_hash,
        txn_id: txn_id,
        login: login
      });

      const apiUrl = `https://api.osonsms.com/sendsms_v1.php?${params}`;
      console.log('🌐 GET URL:', apiUrl);

      const request = https.get(apiUrl, {
        headers: {
          'User-Agent': 'AUTOBID.TJ VPS Proxy v5'
        }
      }, (response) => {
        let responseData = '';
        
        response.on('data', (chunk) => {
          responseData += chunk;
        });
        
        response.on('end', () => {
          console.log(`📡 OSON SMS ответ (${response.statusCode}):`, responseData);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'SMS отправлен через правильный алгоритм хеширования',
            osonsms_response: responseData,
            status_code: response.statusCode,
            used_hash: str_hash
          }));
        });
      });

      request.on('error', (error) => {
        console.error('❌ Ошибка запроса:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Ошибка запроса',
          error: error.message
        }));
      });
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Endpoint не найден',
    available: ['/health', '/api/send-sms']
  }));
});

server.listen(port, '0.0.0.0', () => {
  console.log('🚀 VPS SMS Proxy v5 запущен с правильным алгоритмом хеширования');
  console.log('✅ Формат хеша: txn_id;login;sender;phone_number;password');
  console.log('🔐 Алгоритм: SHA256');
});
```

## После вставки кода:

```bash
# 4. Сохранить и выйти из nano
Ctrl+X, Y, Enter

# 5. Запустить новый сервер
pm2 start server-v5.js --name sms-proxy-v5

# 6. Проверить статус
pm2 status

# 7. Посмотреть логи
pm2 logs sms-proxy-v5 --lines 10
```

## Проверка работы:

```bash
# 8. Тест health endpoint
curl -X GET http://localhost:3000/health

# 9. Тест SMS (замените номер на ваш)
curl -X POST http://localhost:3000/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "login": "zarex",
    "password": "a6d5d8b47551199899862d6d768a4cb1",
    "sender": "OsonSMS", 
    "to": "992903331332",
    "text": "✅ VPS v5 работает с правильным хешем!"
  }'
```

## Ожидаемый результат health check:
```json
{
  "status": "VPS SMS Proxy v5 - ПРАВИЛЬНЫЙ АЛГОРИТМ",
  "time": "2025-07-27T15:20:00.000Z",
  "server": "DigitalOcean 188.166.61.86",
  "hash_format": "txn_id;login;sender;phone_number;password",
  "hash_algorithm": "SHA256"
}
```

После обновления VPS можно будет протестировать реальную отправку SMS через приложение!