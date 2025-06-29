#!/bin/bash

# Скрипт развертывания AUTOBID.TJ на VPS
# Использование: ./deploy-vps.sh

set -e

echo "🚀 Развертывание AUTOBID.TJ на VPS"

# Проверяем права sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Запустите скрипт с sudo: sudo ./deploy-vps.sh"
    exit 1
fi

# Обновляем систему
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# Устанавливаем Node.js 18
echo "📦 Установка Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Устанавливаем PostgreSQL
echo "🗄️ Установка PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Устанавливаем Nginx
echo "🌐 Установка Nginx..."
apt install -y nginx

# Устанавливаем PM2 для управления процессами
echo "⚙️ Установка PM2..."
npm install -g pm2

# Создаем пользователя для приложения
echo "👤 Создание пользователя autobid..."
useradd -m -s /bin/bash autobid || echo "Пользователь уже существует"

# Настраиваем PostgreSQL
echo "🗄️ Настройка базы данных..."
sudo -u postgres psql -c "CREATE USER autobid WITH PASSWORD 'secure_password_2024';" || echo "Пользователь уже существует"
sudo -u postgres psql -c "CREATE DATABASE autoauction OWNER autobid;" || echo "База данных уже существует"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE autoauction TO autobid;"

# Создаем директорию приложения
echo "📁 Создание директории приложения..."
mkdir -p /var/www/autobid
chown autobid:autobid /var/www/autobid

# Клонируем репозиторий (замените на ваш репозиторий)
echo "📥 Скачивание кода приложения..."
cd /var/www/autobid

# Если у вас есть Git репозиторий:
# git clone https://github.com/your-username/autobid-app.git .

# Или скопируйте файлы вручную и раскомментируйте:
echo "⚠️  Скопируйте файлы приложения в /var/www/autobid"
echo "⚠️  Затем выполните: chown -R autobid:autobid /var/www/autobid"

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
sudo -u autobid npm install

# Собираем приложение
echo "🔨 Сборка приложения..."
sudo -u autobid npm run build

# Создаем файл окружения
echo "⚙️ Создание файла окружения..."
cat > /var/www/autobid/.env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://autobid:secure_password_2024@localhost:5432/autoauction
EOF

chown autobid:autobid /var/www/autobid/.env
chmod 600 /var/www/autobid/.env

# Создаем конфигурацию PM2
echo "⚙️ Создание конфигурации PM2..."
cat > /var/www/autobid/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'autobid-app',
    script: 'dist/index.js',
    cwd: '/var/www/autobid',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/autobid/error.log',
    out_file: '/var/log/autobid/out.log',
    log_file: '/var/log/autobid/combined.log',
    time: true
  }]
};
EOF

# Создаем директорию для логов
mkdir -p /var/log/autobid
chown autobid:autobid /var/log/autobid

# Запускаем приложение через PM2
echo "🚀 Запуск приложения..."
sudo -u autobid pm2 start /var/www/autobid/ecosystem.config.js
sudo -u autobid pm2 save
sudo -u autobid pm2 startup

# Настраиваем Nginx
echo "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/autobid << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активируем сайт
ln -sf /etc/nginx/sites-available/autobid /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Тестируем и перезапускаем Nginx
nginx -t && systemctl restart nginx

# Настраиваем автозапуск
systemctl enable nginx
systemctl enable postgresql

# Настраиваем файрвол
echo "🔥 Настройка файрвола..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo "✅ Развертывание завершено!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Обновите домен в /etc/nginx/sites-available/autobid"
echo "2. Установите SSL сертификат: sudo certbot --nginx"
echo "3. Создайте таблицы БД: cd /var/www/autobid && npm run db:push"
echo "4. Проверьте статус: sudo -u autobid pm2 status"
echo ""
echo "🌐 Приложение доступно по адресу: http://your-domain.com"