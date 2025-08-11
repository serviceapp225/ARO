#!/bin/bash

# Настройка nginx для AutoBid.TJ на порту 80

echo "🔧 Настраиваю nginx для AutoBid.TJ..."

ssh root@188.166.61.86 << 'NGINX_SETUP'
# Установка nginx если не установлен
if ! command -v nginx &> /dev/null; then
    echo "📦 Установка nginx..."
    apt update && apt install -y nginx
fi

# Создание конфигурации nginx
cat > /etc/nginx/sites-available/autobid << 'NGINX_CONF'
server {
    listen 80;
    server_name 188.166.61.86;

    # Логи
    access_log /var/log/nginx/autobid.access.log;
    error_log /var/log/nginx/autobid.error.log;

    # Проксирование на приложение
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы (если будут)
    location /static/ {
        alias /root/autobid-tj/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONF

# Включение сайта
ln -sf /etc/nginx/sites-available/autobid /etc/nginx/sites-enabled/

# Отключение дефолтного сайта
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
nginx -t

# Перезапуск nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx настроен!"
echo "🌐 Сайт доступен на: http://188.166.61.86"

# Проверка статуса
systemctl status nginx --no-pager -l | head -5
systemctl status autobid --no-pager -l | head -5
NGINX_SETUP