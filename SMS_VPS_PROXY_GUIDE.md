# РЕШЕНИЕ ПРОБЛЕМЫ IP БЕЛОГО СПИСКА OSON SMS

## Проблема
IP адрес Replit (34.47.187.162) не в белом списке OSON SMS, поэтому SMS не отправляются.

## Решение: Мини VPS для SMS прокси

### Архитектура
```
Приложение Replit → VPS прокси (статический IP) → OSON SMS API
```

### Преимущества
- ✅ Основное приложение остается на Replit (удобная разработка)
- ✅ Минимальная стоимость VPS ($3-5/месяц)
- ✅ Один раз настроили IP - забыли о проблеме
- ✅ Если VPS упадет, приложение работает в демо-режиме
- ✅ Простое обслуживание (один файл на VPS)

## ПОШАГОВАЯ ИНСТРУКЦИЯ

### Шаг 1: Аренда VPS
Выберите любого провайдера с дешевыми VPS:
- **DigitalOcean** ($4/месяц): https://digitalocean.com
- **Vultr** ($3.5/месяц): https://vultr.com  
- **Linode** ($5/месяц): https://linode.com
- **Hetzner** (€3.29/месяц): https://hetzner.com

**Требования:**
- Ubuntu 20.04 или 22.04
- 1GB RAM (минимум)
- Статический IP адрес

### Шаг 2: Настройка VPS

Подключитесь к VPS через SSH:
```bash
ssh root@YOUR_VPS_IP
```

Установите Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

Создайте директорию для прокси:
```bash
mkdir /opt/sms-proxy
cd /opt/sms-proxy
```

### Шаг 3: Создайте файл SMS прокси

Создайте файл `sms-proxy.js`:
```javascript
const http = require('http');
const https = require('https');
const url = require('url');

// Конфигурация
const PORT = 3000;
const OSON_SMS_URL = 'http://api.osonsms.com/sendsms.php';

// Логирование
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// SMS прокси сервер
const server = http.createServer((req, res) => {
  // CORS заголовки для Replit
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/send-sms') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const smsData = JSON.parse(body);
        log(`📱 SMS запрос: ${smsData.phone} - ${smsData.text.substring(0, 50)}...`);
        
        // Подготовка данных для OSON SMS
        const postData = new URLSearchParams({
          login: smsData.login,
          password: smsData.password,
          phone: smsData.phone,
          text: smsData.text,
          sender: smsData.sender || 'AutoBid'
        }).toString();
        
        // Отправка запроса к OSON SMS
        const options = {
          hostname: 'api.osonsms.com',
          path: '/sendsms.php',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
          }
        };
        
        const osonReq = http.request(options, (osonRes) => {
          let responseData = '';
          
          osonRes.on('data', chunk => {
            responseData += chunk;
          });
          
          osonRes.on('end', () => {
            log(`📨 OSON ответ: ${responseData}`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              osonResponse: responseData,
              timestamp: new Date().toISOString()
            }));
          });
        });
        
        osonReq.on('error', (error) => {
          log(`❌ Ошибка OSON: ${error.message}`);
          
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          }));
        });
        
        osonReq.write(postData);
        osonReq.end();
        
      } catch (error) {
        log(`❌ Ошибка парсинга: ${error.message}`);
        
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON data',
          timestamp: new Date().toISOString()
        }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  log(`🚀 SMS прокси сервер запущен на порту ${PORT}`);
  log(`🌐 Готов принимать запросы от Replit`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('📴 Получен сигнал SIGTERM, завершаем работу...');
  server.close(() => {
    log('💤 SMS прокси сервер остановлен');
    process.exit(0);
  });
});
```

### Шаг 4: Создайте systemd сервис

Создайте файл `/etc/systemd/system/sms-proxy.service`:
```ini
[Unit]
Description=SMS Proxy Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sms-proxy
ExecStart=/usr/bin/node sms-proxy.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Запустите сервис:
```bash
systemctl daemon-reload
systemctl enable sms-proxy
systemctl start sms-proxy
systemctl status sms-proxy
```

### Шаг 5: Настройка Firewall

```bash
ufw allow 3000/tcp
ufw allow ssh
ufw --force enable
```

### Шаг 6: Добавление IP в белый список OSON SMS

Свяжитесь с поддержкой OSON SMS и попросите добавить IP вашего VPS в белый список.

### Шаг 7: Обновление кода в Replit

В файле `server/sms.ts` измените URL на ваш VPS:
```typescript
const SMS_PROXY_URL = 'http://YOUR_VPS_IP:3000/send-sms';
```

## Тестирование

### Проверка работы VPS:
```bash
curl http://YOUR_VPS_IP:3000/health
```

### Проверка SMS (после добавления IP в белый список):
```bash
curl -X POST http://YOUR_VPS_IP:3000/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "login": "your_login",
    "password": "your_password", 
    "phone": "+992901234567",
    "text": "Test SMS from proxy",
    "sender": "AutoBid"
  }'
```

## Стоимость решения

- **VPS**: $3-5/месяц
- **Настройка**: одноразово 30 минут
- **Обслуживание**: практически не требуется

## Мониторинг

Проверка логов VPS:
```bash
journalctl -u sms-proxy -f
```

Проверка состояния:
```bash
systemctl status sms-proxy
```

## Backup план

Если VPS недоступен, приложение автоматически переключается в демо-режим и показывает коды в консоли Replit.

## Следующие шаги

1. Арендуйте VPS
2. Настройте SMS прокси по инструкции
3. Свяжитесь с OSON SMS для добавления IP
4. Обновите код в Replit
5. Протестируйте отправку SMS

Готово! Проблема с IP белым списком решена навсегда.