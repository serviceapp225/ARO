#!/bin/bash

# 🚀 Быстрое развертывание AutoBid.TJ на VPS
# Версия: Полная автоматизация

set -e  # Остановиться при ошибке

echo "🚀 Начинаем развертывание AutoBid.TJ..."
echo "📍 VPS: 188.166.61.86"
echo "⏰ $(date)"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для логирования
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка подключения к VPS
check_vps_connection() {
    log_info "Проверяем подключение к VPS..."
    if ssh -o ConnectTimeout=10 -o BatchMode=yes root@188.166.61.86 'echo "VPS доступен"' 2>/dev/null; then
        log_info "✅ VPS доступен"
        return 0
    else
        log_error "❌ Не удалось подключиться к VPS"
        log_warn "Убедитесь что:"
        log_warn "1. VPS запущен и доступен"
        log_warn "2. SSH ключи настроены"
        log_warn "3. Используйте: ssh root@188.166.61.86"
        return 1
    fi
}

# Развертывание базовой версии
deploy_basic_version() {
    log_info "Развертываем базовую версию через SSH..."
    
    # Команда для создания и запуска приложения на VPS
    ssh root@188.166.61.86 'bash -s' << 'REMOTE_SCRIPT'
        set -e
        
        echo "📁 Создаем директорию приложения..."
        mkdir -p ~/autobid-tj && cd ~/autobid-tj
        
        echo "📝 Создаем основной файл приложения..."
        cat > app.js << 'APP_EOF'
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'AutoBid.TJ',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Main route
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>AutoBid.TJ - Автомобильные Аукционы</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; color: white; margin-bottom: 40px; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .card { background: white; border-radius: 15px; padding: 30px; margin: 20px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .status { background: linear-gradient(45deg, #4CAF50, #45a049); color: white; text-align: center; border-radius: 10px; padding: 20px; font-size: 1.1rem; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
        .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
        .info-item h4 { color: #333; margin-bottom: 5px; }
        .info-item p { color: #666; }
        .links { margin-top: 20px; }
        .link { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 5px; transition: all 0.3s; }
        .link:hover { background: #5a67d8; transform: translateY(-2px); }
        .footer { text-align: center; color: white; opacity: 0.8; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 AutoBid.TJ</h1>
            <p>Платформа автомобильных аукционов Таджикистана</p>
        </div>
        
        <div class="card">
            <div class="status">
                ✅ Приложение успешно развернуто и работает!
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <h4>🌐 Статус сервера</h4>
                    <p>Работает на порту ${PORT}</p>
                </div>
                <div class="info-item">
                    <h4>⏰ Время запуска</h4>
                    <p>${new Date().toLocaleString('ru-RU')}</p>
                </div>
                <div class="info-item">
                    <h4>🔧 Версия</h4>
                    <p>Базовая версия v1.0</p>
                </div>
                <div class="info-item">
                    <h4>📊 Среда</h4>
                    <p>Production</p>
                </div>
            </div>
            
            <div class="links">
                <a href="/health" class="link">🏥 Health Check</a>
                <a href="http://188.166.61.86:3000/api/health" class="link" target="_blank">📱 SMS API</a>
            </div>
        </div>
        
        <div class="card">
            <h3>🎯 Следующие шаги</h3>
            <ol style="margin: 20px 0; line-height: 1.8;">
                <li>✅ Базовое приложение развернуто</li>
                <li>🔄 Загрузить полную версию с базой данных</li>
                <li>🚀 Настроить доменное имя</li>
                <li>📱 Подключить мобильное приложение</li>
            </ol>
        </div>
        
        <div class="footer">
            <p>AutoBid.TJ © 2025 | Сделано с ❤️ в Таджикистане</p>
        </div>
    </div>
</body>
</html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AutoBid.TJ запущен на порту ${PORT}`);
  console.log(`🌐 URL: http://188.166.61.86:${PORT}`);
  console.log(`🏥 Health: http://188.166.61.86:${PORT}/health`);
});
APP_EOF

        echo "📦 Создаем package.json..."
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
  }
}
PACKAGE_EOF

        echo "🔧 Создаем переменные окружения..."
        cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://autobid_user:secure_password_123@localhost:5432/autobid_db
VPS_PROXY_URL=http://localhost:3000
ENV_EOF

        # Проверяем наличие Node.js
        if ! command -v node &> /dev/null; then
            echo "📥 Устанавливаем Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi

        echo "📦 Устанавливаем зависимости..."
        npm install --production

        echo "⚙️ Создаем systemd службу..."
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

[Install]
WantedBy=multi-user.target
SERVICE_EOF

        echo "🚀 Запускаем службу..."
        sudo systemctl daemon-reload
        sudo systemctl enable autobid
        sudo systemctl start autobid

        echo "✅ Развертывание завершено!"
        echo "🌐 Приложение доступно: http://188.166.61.86"
        echo "🏥 Health check: http://188.166.61.86/health"
        
        # Показываем статус
        sudo systemctl status autobid --no-pager -l
REMOTE_SCRIPT
}

# Основная функция
main() {
    log_info "=== AutoBid.TJ Быстрое Развертывание ==="
    
    if ! check_vps_connection; then
        log_error "Не удалось подключиться к VPS. Прерываем развертывание."
        exit 1
    fi
    
    log_info "Начинаем развертывание базовой версии..."
    if deploy_basic_version; then
        log_info "✅ Базовое развертывание завершено успешно!"
        log_info ""
        log_info "🌐 Проверьте результат:"
        log_info "   Основной сайт: http://188.166.61.86"
        log_info "   Health check:  http://188.166.61.86/health"
        log_info ""
        log_info "📋 Полезные команды для VPS:"
        log_info "   ssh root@188.166.61.86"
        log_info "   sudo journalctl -u autobid -f  # Просмотр логов"
        log_info "   sudo systemctl status autobid  # Статус службы"
        log_info ""
        log_info "🔄 Следующий шаг: Загрузить полную версию с архивом"
    else
        log_error "❌ Ошибка при развертывании"
        exit 1
    fi
}

# Запуск
main "$@"