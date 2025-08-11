#!/bin/bash

# AutoBid.TJ - Полное развертывание на VPS 188.166.61.86
# Этот скрипт заменяет тестовое приложение полной версией AutoBid.TJ

echo "🚀 Начинаем развертывание полной версии AutoBid.TJ..."

# Остановка текущего сервиса
echo "⏹️  Остановка текущего сервиса..."
sudo systemctl stop autobid-3001.service || true

# Создание резервной копии текущего приложения
echo "💾 Создание резервной копии..."
sudo cp -r /var/www/autobid /var/www/autobid-backup-$(date +%Y%m%d-%H%M%S) || true

# Создание основных директорий
echo "📁 Создание структуры директорий..."
sudo mkdir -p /var/www/autobid/{dist,uploads,node_modules}
sudo mkdir -p /var/log/autobid

# Копирование собранного приложения
echo "📦 Копирование файлов приложения..."
sudo cp dist/index.js /var/www/autobid/dist/
sudo cp -r dist/public /var/www/autobid/dist/
sudo cp package.json /var/www/autobid/
sudo cp -r node_modules /var/www/autobid/
sudo cp -r uploads /var/www/autobid/ 2>/dev/null || true

# Создание .env файла для production
echo "⚙️  Настройка конфигурации..."
sudo tee /var/www/autobid/.env > /dev/null <<EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_URL=postgresql://autobid_user:AutoBid2025@localhost:5432/autobid_db

# SMS API Configuration
SMS_API_URL=https://oson.tj/smsservice.php
SMS_USERNAME=your_username
SMS_PASSWORD=your_password

# Session Secret
SESSION_SECRET=$(openssl rand -hex 32)

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/autobid/uploads

# Cache Settings
CACHE_TTL=3600
ENABLE_CACHE=true

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/autobid/app.log
EOF

# Установка правильных разрешений
echo "🔐 Установка разрешений..."
sudo chown -R www-data:www-data /var/www/autobid
sudo chmod -R 755 /var/www/autobid
sudo chmod 644 /var/www/autobid/.env

# Создание systemd сервиса для полного приложения
echo "🔧 Создание systemd сервиса..."
sudo tee /etc/systemd/system/autobid-full.service > /dev/null <<EOF
[Unit]
Description=AutoBid.TJ Full Application
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/autobid
Environment=NODE_ENV=production
Environment=PORT=3001
EnvironmentFile=/var/www/autobid/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=autobid-full

# Лимиты ресурсов
LimitNOFILE=65536
LimitNPROC=32768

# Безопасность
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/autobid/uploads /var/log/autobid

[Install]
WantedBy=multi-user.target
EOF

# Обновление Nginx конфигурации для полного приложения
echo "🌐 Обновление Nginx конфигурации..."
sudo tee /etc/nginx/sites-available/autobid > /dev/null <<EOF
server {
    listen 80;
    server_name 188.166.61.86;
    
    # Увеличенные лимиты для загрузки файлов
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Корневая директория для статических файлов
    root /var/www/autobid/dist/public;
    index index.html;
    
    # Обработка статических файлов
    location /assets/ {
        alias /var/www/autobid/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip on;
        gzip_types text/css application/javascript image/svg+xml;
    }
    
    # API запросы
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # WebSocket соединения
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # Загруженные изображения
    location /uploads/ {
        alias /var/www/autobid/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Все остальные запросы - SPA
    location / {
        try_files \$uri \$uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Логирование
    access_log /var/log/nginx/autobid.access.log;
    error_log /var/log/nginx/autobid.error.log;
}
EOF

# Перезагрузка systemd и запуск сервисов
echo "🔄 Перезагрузка сервисов..."
sudo systemctl daemon-reload
sudo systemctl enable autobid-full.service
sudo systemctl start autobid-full.service

# Перезагрузка Nginx
sudo nginx -t && sudo systemctl reload nginx

# Проверка статуса сервисов
echo "📊 Проверка статуса сервисов..."
echo "=== PostgreSQL ==="
sudo systemctl status postgresql --no-pager -l

echo "=== AutoBid Application ==="
sudo systemctl status autobid-full --no-pager -l

echo "=== Nginx ==="
sudo systemctl status nginx --no-pager -l

# Проверка доступности приложения
echo "🔍 Проверка доступности..."
sleep 5

# Проверка основных endpoints
echo "Проверка главной страницы:"
curl -I http://localhost/ 2>/dev/null | head -1

echo "Проверка API health:"
curl -s http://localhost/api/health 2>/dev/null || echo "API недоступно"

echo "Проверка через внешний IP:"
curl -I http://188.166.61.86/ 2>/dev/null | head -1

# Показать логи в случае проблем
if ! systemctl is-active --quiet autobid-full; then
    echo "❌ Сервис не запустился. Логи:"
    sudo journalctl -u autobid-full --no-pager -l --since "5 minutes ago"
fi

echo "✅ Развертывание завершено!"
echo ""
echo "📍 Доступ к приложению:"
echo "   - Основной URL: http://188.166.61.86"
echo "   - Прямой доступ: http://188.166.61.86:3001"
echo ""
echo "📋 Полезные команды:"
echo "   - Проверка статуса: sudo systemctl status autobid-full"
echo "   - Просмотр логов: sudo journalctl -u autobid-full -f"
echo "   - Перезапуск: sudo systemctl restart autobid-full"
echo ""
echo "🗄️ База данных: PostgreSQL autobid_db (пользователь: autobid_user)"
echo ""