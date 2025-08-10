#!/bin/bash

# Скрипт автоматического развертывания AutoBid.TJ на DigitalOcean VPS
# IP: 188.166.61.86

echo "🚀 Начинаем развертывание AutoBid.TJ на DigitalOcean..."

# 1. Проверка подключения к VPS
echo "📡 Проверяем подключение к VPS..."
if ! ping -c 3 188.166.61.86 > /dev/null 2>&1; then
    echo "❌ Не удается подключиться к VPS 188.166.61.86"
    exit 1
fi

# 2. Копирование файлов на VPS
echo "📦 Копируем файлы на VPS..."
scp autobid-tj-build-final.tar.gz root@188.166.61.86:~/

# 3. Выполнение команд на VPS
echo "🔧 Выполняем развертывание на VPS..."
ssh root@188.166.61.86 << 'EOF'
cd ~/

# Остановить службу
echo "⏹️ Останавливаем службу..."
sudo systemctl stop autobid

# Backup текущей версии
echo "💾 Создаем backup..."
if [ -d "autobid-tj/dist" ]; then
    cp -r autobid-tj/dist autobid-tj/dist_backup_$(date +%Y%m%d_%H%M%S)
fi

# Создать директорию если не существует
mkdir -p autobid-tj
cd autobid-tj

# Извлечь новые файлы
echo "📂 Извлекаем новые файлы..."
tar -xzf ../autobid-tj-build-final.tar.gz

# Настроить переменные окружения
echo "🔑 Настраиваем переменные окружения..."
cat > .env << ENVEOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://autobid_user:secure_password_123@localhost:5432/autobid_db
VPS_PROXY_URL=http://localhost:3000
SMS_LOGIN=zarex
SMS_PASSWORD=a6d5d8b47551199899862d6d768a4cb1
SMS_SENDER=OsonSMS
ENVEOF

# Установить права доступа
echo "🔒 Устанавливаем права доступа..."
chmod +x dist/index.js

# Создать systemd service если не существует
if [ ! -f "/etc/systemd/system/autobid.service" ]; then
    echo "📋 Создаем systemd service..."
    sudo tee /etc/systemd/system/autobid.service > /dev/null << SERVICEEOF
[Unit]
Description=AutoBid.TJ Auction Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/autobid-tj
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/root/autobid-tj/.env

# Output to syslog
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=autobid

[Install]
WantedBy=multi-user.target
SERVICEEOF

    sudo systemctl daemon-reload
    sudo systemctl enable autobid
fi

# Запустить службу
echo "▶️ Запускаем службу..."
sudo systemctl start autobid

# Проверить статус
echo "📊 Проверяем статус..."
sleep 5
sudo systemctl status autobid --no-pager

# Проверить health endpoint
echo "🏥 Проверяем health endpoint..."
sleep 10
curl -f http://localhost:3001/health || echo "⚠️ Health check failed"

echo "✅ Развертывание завершено!"
echo "🌐 Приложение доступно по адресу: http://188.166.61.86"
echo "📋 Проверить логи: sudo journalctl -u autobid -f"
EOF

echo "🎉 Развертывание на DigitalOcean завершено!"
echo ""
echo "📝 Для проверки работы:"
echo "   🌐 Основной сайт: http://188.166.61.86"
echo "   🏥 Health check: http://188.166.61.86/health"
echo "   📱 SMS прокси: http://188.166.61.86:3000/api/health"
echo ""
echo "📋 Полезные команды на VPS:"
echo "   Логи приложения: sudo journalctl -u autobid -f"
echo "   Статус службы: sudo systemctl status autobid"
echo "   Перезапуск: sudo systemctl restart autobid"