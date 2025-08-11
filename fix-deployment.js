#!/usr/bin/env node

// Скрипт исправления развертывания AutoBid.TJ
// Анализирует проблемы и создает правильные файлы

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление развертывания AutoBid.TJ\n');

// Проверим, что нужно исправить в dist/index.js
const distPath = './dist/index.js';
if (fs.existsSync(distPath)) {
  const content = fs.readFileSync(distPath, 'utf8');
  
  console.log('📦 Анализ серверного файла:');
  console.log(`   Размер: ${Math.round(fs.statSync(distPath).size/1024)}KB`);
  
  // Проверим основные проблемы
  const issues = [];
  
  if (!content.includes('express')) {
    issues.push('❌ Express не найден');
  } else {
    console.log('   ✅ Express найден');
  }
  
  if (!content.includes('DATABASE_URL')) {
    issues.push('❌ DATABASE_URL не найден');
  } else {
    console.log('   ✅ DATABASE_URL найден');
  }
  
  // Проверим наличие health endpoint
  if (!content.includes('/api/health') && !content.includes('/health')) {
    issues.push('❌ Health endpoint не найден');
  } else {
    console.log('   ✅ Health endpoint найден');
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️ Найденные проблемы:');
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
} else {
  console.log('❌ dist/index.js не найден - требуется пересборка');
}

// Создаем исправленный .env для VPS
const correctEnv = `NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_URL=postgresql://autobid_user:AutoBid2025@localhost:5432/autobid_db

# SMS API Configuration
SMS_API_URL=https://oson.tj/smsservice.php
SMS_USERNAME=your_username
SMS_PASSWORD=your_password

# Session Secret
SESSION_SECRET=7f8d9e6c4a2b1f8e7c9d3a5b8f2e6c4a9d7f5e3b8c6a4f2e9d7b5c3f8a6e4c2d1f9

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/autobid/uploads

# Cache Settings
CACHE_TTL=3600
ENABLE_CACHE=true

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/autobid/app.log
`;

fs.writeFileSync('.env.production', correctEnv);
console.log('✅ Создан исправленный .env.production');

// Создаем исправленный systemd сервис
const correctService = `[Unit]
Description=AutoBid.TJ Full Application
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/autobid
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=HOST=0.0.0.0
EnvironmentFile=/var/www/autobid/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=autobid-full

# Resource limits
LimitNOFILE=65536
LimitNPROC=32768

# Security
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/autobid/uploads /var/log/autobid

[Install]
WantedBy=multi-user.target
`;

fs.writeFileSync('autobid-full.service', correctService);
console.log('✅ Создан исправленный autobid-full.service');

// Создаем команды для исправления
const fixCommands = `#!/bin/bash

# Скрипт исправления развертывания AutoBid.TJ

echo "🔧 Исправление развертывания..."

# 1. Остановим сервис
sudo systemctl stop autobid-full 2>/dev/null || true

# 2. Копируем исправленные файлы
sudo cp dist/index.js /var/www/autobid/dist/
sudo cp -r dist/public /var/www/autobid/dist/
sudo cp .env.production /var/www/autobid/.env
sudo cp autobid-full.service /etc/systemd/system/

# 3. Устанавливаем права
sudo chown -R www-data:www-data /var/www/autobid
sudo chmod 644 /var/www/autobid/.env

# 4. Перезагружаем systemd
sudo systemctl daemon-reload

# 5. Проверяем конфигурацию
echo "=== Проверка файлов ==="
ls -la /var/www/autobid/dist/index.js
ls -la /var/www/autobid/.env

# 6. Запускаем сервис
echo "=== Запуск сервиса ==="
sudo systemctl enable autobid-full
sudo systemctl start autobid-full

# 7. Ждем 5 секунд и проверяем
sleep 5

# 8. Статус
echo "=== Статус сервиса ==="
sudo systemctl status autobid-full --no-pager

# 9. Проверяем порт
echo "=== Проверка порта 3001 ==="
sudo netstat -tlnp | grep :3001 || echo "Порт 3001 не слушается"

# 10. Тестируем API
echo "=== Тест API ==="
curl -v http://localhost:3001/api/health 2>&1 | head -10

# 11. Перезагружаем nginx
sudo nginx -t && sudo systemctl reload nginx

# 12. Финальная проверка
echo "=== Финальная проверка ==="
curl -I http://localhost/ 2>/dev/null | head -1

echo "🏁 Исправление завершено"
`;

fs.writeFileSync('fix-deployment.sh', fixCommands);
fs.chmodSync('fix-deployment.sh', 0o755);
console.log('✅ Создан скрипт исправления fix-deployment.sh');

console.log('\n🚀 Команды для исправления на VPS:');
console.log('1. Скопируйте файлы на VPS:');
console.log('   scp dist/index.js root@188.166.61.86:/root/');
console.log('   scp .env.production root@188.166.61.86:/root/');
console.log('   scp autobid-full.service root@188.166.61.86:/root/');
console.log('   scp fix-deployment.sh root@188.166.61.86:/root/');
console.log('');
console.log('2. Выполните на VPS:');
console.log('   chmod +x fix-deployment.sh');
console.log('   ./fix-deployment.sh');
console.log('');
console.log('3. Проверка логов:');
console.log('   journalctl -u autobid-full -f');
`;

console.log('\n📋 Возможные причины ошибки 500:');
console.log('1. ❌ Файлы не скопированы на VPS');
console.log('2. ❌ Node.js процесс не запущен');
console.log('3. ❌ База данных недоступна');
console.log('4. ❌ Неправильные права доступа');
console.log('5. ❌ Отсутствуют зависимости node_modules');