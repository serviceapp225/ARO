#!/bin/bash
# Скрипт автоматической настройки production на DigitalOcean VPS

set -e

echo "🚀 Начинаем настройку production окружения на VPS..."

# Переменные
APP_DIR="/root/autobid-tj"
SERVICE_NAME="autobid"
DOMAIN="autobid.tj"

# Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# Принудительное обновление Node.js до версии 20
echo "⚙️ Принудительное обновление Node.js до версии 20..."
# Удаляем старую версию Node.js
apt-get remove -y nodejs npm
apt-get autoremove -y

# Очищаем кэш
apt-get clean
rm -rf /usr/local/lib/node_modules
rm -rf /usr/local/bin/node
rm -rf /usr/local/bin/npm

# Устанавливаем Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs git nginx certbot python3-certbot-nginx

# Проверяем что установлена правильная версия
echo "🔍 Проверка версии Node.js..."
node_version=$(node --version)
if [[ $node_version == v20* ]]; then
    echo "✅ Node.js 20 успешно установлен: $node_version"
else
    echo "❌ Ошибка: Node.js версия $node_version не соответствует требуемой 20.x"
    exit 1
fi

# Проверка версий
echo "✅ Версии установленного ПО:"
node --version
npm --version
git --version

# Клонирование или обновление репозитория
if [ -d "$APP_DIR" ]; then
    echo "📁 Обновление существующего репозитория..."
    cd $APP_DIR
    git pull origin main
else
    echo "📥 Клонирование репозитория..."
    git clone $REPOSITORY_URL $APP_DIR
    cd $APP_DIR
fi

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

# Настройка переменных окружения
echo "⚙️ Настройка переменных окружения..."
if [ ! -f .env ]; then
    cp .env.production.do .env
    echo "❗ Отредактируйте файл .env с вашими данными подключения"
    echo "❗ Затем запустите: systemctl start $SERVICE_NAME"
    exit 1
fi

# Тестирование подключений
echo "🧪 Тестирование инфраструктуры..."
node server/scripts/testInfrastructure.js

if [ $? -ne 0 ]; then
    echo "❌ Тесты инфраструктуры не прошли. Проверьте .env файл"
    exit 1
fi

# Инициализация базы данных
echo "🗄️ Инициализация базы данных..."
npm run db:push

# Миграция изображений
echo "📸 Миграция изображений в Spaces..."
if [ -d "uploads" ]; then
    node server/scripts/migrateToSpaces.js
fi

# Сборка приложения
echo "🔨 Сборка приложения..."
npm run build

# Создание systemd сервиса
echo "⚙️ Создание systemd сервиса..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=AutoBid.TJ Car Auction Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

# Логирование
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOF

# Перезагрузка systemd и запуск сервиса
echo "🔄 Запуск сервиса..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# Настройка Nginx
echo "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket поддержка
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Активация конфигурации Nginx
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Получение SSL сертификата
echo "🔒 Получение SSL сертификата..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Проверка статуса сервисов
echo "✅ Проверка статуса сервисов..."
systemctl status $SERVICE_NAME --no-pager -l
systemctl status nginx --no-pager -l

echo "🎉 Настройка завершена!"
echo ""
echo "📋 Полезные команды:"
echo "  Логи приложения: journalctl -u $SERVICE_NAME -f"
echo "  Перезапуск: systemctl restart $SERVICE_NAME"
echo "  Статус: systemctl status $SERVICE_NAME"
echo ""
echo "🌐 Сайт доступен: https://$DOMAIN"