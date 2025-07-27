const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

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
      status: 'VPS SMS Proxy v5 работает',
      time: new Date().toISOString(),
      server: 'DigitalOcean 188.166.61.86',
      method: 'Native Node.js HTTP без зависимостей'
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
      
      const { login, hash, sender, to, text } = data;
      
      if (!login || !hash || !sender || !to || !text) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Отсутствуют обязательные параметры'
        }));
        return;
      }

      const cleanPhone = to.replace(/^\+?992/, '').replace(/[^0-9]/g, '');
      const txn_id = `autobid_${Date.now()}`;
      
      const params = querystring.stringify({
        from: sender,
        phone_number: cleanPhone,
        msg: text,
        str_hash: hash,
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
            message: 'SMS отправлен',
            osonsms_response: responseData,
            status_code: response.statusCode
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
  console.log('🚀 VPS SMS Proxy v5 запущен на порту 3000');
  console.log('✅ Используется только встроенные модули Node.js');
});