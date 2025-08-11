#!/bin/bash

# 🚀 Одна команда для полного развертывания AutoBid.TJ
# Выполните эту команду на вашем компьютере (не в Replit)

echo "🚀 Развертывание AutoBid.TJ на VPS 188.166.61.86..."

# Выполнить развертывание через SSH одной командой
ssh root@188.166.61.86 'bash -s' << 'REMOTE_DEPLOY'
set -e

echo "📁 Создание структуры приложения..."
mkdir -p ~/autobid-tj && cd ~/autobid-tj

echo "📝 Создание основного файла app.js..."
cat > app.js << 'APP_CODE'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'AutoBid.TJ',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AutoBid.TJ - Автомобильные Аукционы</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: white; margin-bottom: 40px; padding: 40px 0; }
        .header h1 { 
            font-size: 3.5rem; 
            margin-bottom: 10px; 
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            font-weight: 700;
        }
        .header p { font-size: 1.3rem; opacity: 0.9; font-weight: 300; }
        .card { 
            background: white; 
            border-radius: 20px; 
            padding: 30px; 
            margin: 20px 0; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        .status-ok { 
            background: linear-gradient(135deg, #4CAF50, #45a049); 
            color: white; 
            text-align: center; 
            border-radius: 15px; 
            padding: 25px; 
            font-size: 1.2rem;
            font-weight: 600;
        }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
        }
        .info-box { 
            background: #f8f9ff; 
            padding: 20px; 
            border-radius: 15px; 
            border-left: 5px solid #667eea;
            transition: transform 0.2s;
        }
        .info-box:hover { transform: translateY(-2px); }
        .info-box h4 { color: #333; margin-bottom: 8px; font-size: 1.1rem; }
        .info-box p { color: #666; font-size: 1rem; }
        .links { margin: 30px 0; text-align: center; }
        .btn { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 50px; 
            margin: 10px; 
            font-weight: 600;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .btn:hover { 
            transform: translateY(-3px); 
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        .footer { 
            text-align: center; 
            color: white; 
            opacity: 0.8; 
            margin-top: 50px; 
            padding: 20px;
        }
        .step { 
            background: #e8f4fd; 
            margin: 10px 0; 
            padding: 15px; 
            border-radius: 10px;
            border-left: 4px solid #2196F3;
        }
        .step.done { background: #e8f5e8; border-left-color: #4CAF50; }
        @media (max-width: 768px) {
            .header h1 { font-size: 2.5rem; }
            .container { padding: 15px; }
            .card { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 AutoBid.TJ</h1>
            <p>Платформа автомобильных аукционов Таджикистана</p>
        </div>
        
        <div class="card">
            <div class="status-ok">
                ✅ Приложение успешно развернуто и работает!
            </div>
            
            <div class="grid">
                <div class="info-box">
                    <h4>🌐 Статус сервера</h4>
                    <p>Работает на порту ${PORT}</p>
                </div>
                <div class="info-box">
                    <h4>⏰ Время запуска</h4>
                    <p>${new Date().toLocaleString('ru-RU', {timeZone: 'Asia/Dushanbe'})}</p>
                </div>
                <div class="info-box">
                    <h4>🔧 Версия</h4>
                    <p>Production v1.0.0</p>
                </div>
                <div class="info-box">
                    <h4>📊 Время работы</h4>
                    <p>${Math.floor(process.uptime() / 60)} минут</p>
                </div>
            </div>
            
            <div class="links">
                <a href="/health" class="btn">🏥 Проверка здоровья</a>
                <a href="http://188.166.61.86:3000/api/health" class="btn" target="_blank">📱 SMS Сервис</a>
            </div>
        </div>
        
        <div class="card">
            <h3 style="margin-bottom: 20px;">🎯 План развертывания</h3>
            <div class="step done">✅ Базовое приложение развернуто</div>
            <div class="step">🔄 Настройка базы данных PostgreSQL</div>
            <div class="step">📱 Подключение SMS уведомлений</div>
            <div class="step">🌐 Настройка доменного имени</div>
            <div class="step">🚀 Запуск полной версии</div>
        </div>
        
        <div class="footer">
            <p><strong>AutoBid.TJ</strong> © 2025 | Разработано в Таджикистане 🇹🇯</p>
            <p>Сервер: 188.166.61.86 | Порт: ${PORT}</p>
        </div>
    </div>
</body>
</html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AutoBid.TJ запущен на http://188.166.61.86:${PORT}`);
  console.log(`🏥 Health: http://188.166.61.86:${PORT}/health`);
});
APP_CODE

echo "📦 Создание package.json..."
cat > package.json << 'PACKAGE_JSON'
{
  "name": "autobid-tj",
  "version": "1.0.0",
  "description": "AutoBid.TJ Car Auction Platform - Production Ready",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "node app.js",
    "restart": "sudo systemctl restart autobid",
    "status": "sudo systemctl status autobid",
    "logs": "sudo journalctl -u autobid -f"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["auction", "cars", "tajikistan", "autobid"],
  "author": "AutoBid.TJ Team",
  "license": "MIT"
}
PACKAGE_JSON

echo "🔧 Создание .env файла..."
cat > .env << 'ENV_FILE'
NODE_ENV=production
PORT=3001
APP_NAME=AutoBid.TJ
APP_URL=http://188.166.61.86
DATABASE_URL=postgresql://autobid_user:secure_password_123@localhost:5432/autobid_db
VPS_PROXY_URL=http://localhost:3000
SMS_LOGIN=zarex
SMS_PASSWORD=a6d5d8b47551199899862d6d768a4cb1
SMS_SENDER=OsonSMS
ENV_FILE

# Проверка и установка Node.js
if ! command -v node &> /dev/null; then
    echo "📥 Установка Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js установлен: $(node --version)"
fi

echo "📦 Установка зависимостей..."
npm install --production --silent

echo "⚙️ Создание systemd службы..."
sudo tee /etc/systemd/system/autobid.service > /dev/null << 'SERVICE_FILE'
[Unit]
Description=AutoBid.TJ Car Auction Platform
Documentation=https://autobid.tj
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/autobid-tj
ExecStart=/usr/bin/node app.js
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
StartLimitInterval=60s
StartLimitBurst=3
Environment=NODE_ENV=production
EnvironmentFile=/root/autobid-tj/.env

# Логирование
StandardOutput=journal
StandardError=journal
SyslogIdentifier=autobid-tj

# Безопасность
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/root/autobid-tj

[Install]
WantedBy=multi-user.target
SERVICE_FILE

echo "🚀 Настройка и запуск службы..."
sudo systemctl daemon-reload
sudo systemctl enable autobid
sudo systemctl stop autobid 2>/dev/null || true
sudo systemctl start autobid

# Ожидание запуска
sleep 3

echo ""
echo "✅ ============================================"
echo "🎉 AutoBid.TJ успешно развернут!"
echo "============================================="
echo "🌐 Основной сайт: http://188.166.61.86"
echo "🏥 Health check:  http://188.166.61.86/health"
echo "📊 Порт:          3001"
echo "⚙️ Служба:        autobid"
echo ""
echo "📋 Полезные команды:"
echo "  sudo systemctl status autobid   # Статус"
echo "  sudo journalctl -u autobid -f   # Логи"
echo "  sudo systemctl restart autobid  # Перезапуск"
echo ""

# Проверка статуса
echo "📊 Статус службы:"
sudo systemctl is-active autobid
sudo systemctl status autobid --no-pager -l | head -10

echo ""
echo "🔍 Тестируем подключение..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Сервер отвечает на http://localhost:3001"
else
    echo "⚠️  Сервер пока не отвечает, проверьте логи"
fi

echo ""
echo "🎯 Развертывание завершено! Откройте http://188.166.61.86"
REMOTE_DEPLOY

echo ""
echo "✅ Развертывание завершено!"
echo "🌐 Откройте в браузере: http://188.166.61.86"