# 🚀 Ручное развертывание на VPS (без скачивания файлов)

Если скачивание не работает, можно развернуть приложение прямо на VPS, создав файлы вручную.

## Подключение к VPS

```bash
ssh root@188.166.61.86
```

## Выполнить на VPS одной командой:

```bash
# Создать директорию и файлы
mkdir -p ~/autobid-tj && cd ~/autobid-tj

# Создать основной файл приложения (скопируйте код ниже)
cat > app.js << 'APP_EOF'
#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'production'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>AutoBid.TJ - Car Auction Platform</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial; margin: 0; padding: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .status { background: #4CAF50; color: white; padding: 10px; border-radius: 5px; text-align: center; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚗 AutoBid.TJ</h1>
                <p>Платформа автомобильных аукционов</p>
            </div>
            
            <div class="status">
                ✅ Приложение успешно развернуто и работает!
            </div>
            
            <div class="info">
                <h3>📊 Информация о сервере:</h3>
                <ul>
                    <li><strong>Порт:</strong> ${PORT}</li>
                    <li><strong>Статус:</strong> Работает</li>
                    <li><strong>Время запуска:</strong> ${new Date().toLocaleString('ru-RU')}</li>
                    <li><strong>Среда:</strong> ${process.env.NODE_ENV || 'production'}</li>
                </ul>
            </div>
            
            <div class="info">
                <h3>🔗 Полезные ссылки:</h3>
                <ul>
                    <li><a href="/health">Health Check</a></li>
                    <li><strong>SMS API:</strong> <a href="http://188.166.61.86:3000/api/health" target="_blank">http://188.166.61.86:3000/api/health</a></li>
                </ul>
            </div>
            
            <div class="info">
                <p><strong>Следующий шаг:</strong> Загрузить полную версию приложения из архива autobid-tj-build-final.tar.gz</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AutoBid.TJ Server запущен на порту ${PORT}`);
  console.log(`🌐 Доступен по адресу: http://188.166.61.86:${PORT === 80 ? '' : ':' + PORT}`);
  console.log(`🏥 Health check: http://188.166.61.86:${PORT === 80 ? '' : ':' + PORT}/health`);
});

APP_EOF

# Создать package.json
cat > package.json << 'PACKAGE_EOF'
{
  "name": "autobid-tj",
  "version": "1.0.0",
  "description": "AutoBid.TJ Car Auction Platform",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
PACKAGE_EOF

# Создать переменные окружения
cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://autobid_user:secure_password_123@localhost:5432/autobid_db
VPS_PROXY_URL=http://localhost:3000
SMS_LOGIN=zarex
SMS_PASSWORD=a6d5d8b47551199899862d6d768a4cb1
SMS_SENDER=OsonSMS
ENV_EOF

# Установить зависимости
npm install

# Создать systemd service
sudo tee /etc/systemd/system/autobid.service > /dev/null << 'SERVICE_EOF'
[Unit]
Description=AutoBid.TJ Car Auction Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/autobid-tj
ExecStart=/usr/bin/node app.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/root/autobid-tj/.env

StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=autobid

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Запустить службу
sudo systemctl daemon-reload
sudo systemctl enable autobid
sudo systemctl start autobid

echo "✅ AutoBid.TJ развернут!"
echo "🌐 Проверьте: http://188.166.61.86"
echo "🏥 Health: http://188.166.61.86/health"
sudo systemctl status autobid
```

## Проверка результата

После выполнения команд проверьте:
- http://188.166.61.86 - должна открыться страница приложения
- http://188.166.61.86/health - JSON с информацией о статусе

## Полезные команды

```bash
# Просмотр логов
sudo journalctl -u autobid -f

# Перезапуск
sudo systemctl restart autobid

# Остановка
sudo systemctl stop autobid

# Статус
sudo systemctl status autobid
```

## Следующий шаг

После успешного развертывания базовой версии, можно:
1. Попробовать скачать полный архив другим способом
2. Или вручную загрузить файлы через SFTP/SCP
3. Или запросить помощь в скачивании файлов

Это решение даст рабочее приложение на VPS, которое можно потом обновить полной версией.