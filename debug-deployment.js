#!/usr/bin/env node

// Диагностика развертывания AutoBid.TJ на VPS
// Запуск: node debug-deployment.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Диагностика развертывания AutoBid.TJ\n');

// Проверка файловой структуры
const vpsPath = '/var/www/autobid';
const requiredFiles = [
  'dist/index.js',
  'dist/public/index.html', 
  '.env',
  'package.json'
];

console.log('📁 Проверка файловой структуры:');
requiredFiles.forEach(file => {
  const fullPath = path.join(vpsPath, file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Проверка .env файла
const envPath = path.join(vpsPath, '.env');
if (fs.existsSync(envPath)) {
  console.log('\n⚙️ Проверка конфигурации .env:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['NODE_ENV', 'PORT', 'DATABASE_URL'];
  
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(`${varName}=`);
    console.log(`   ${hasVar ? '✅' : '❌'} ${varName}`);
  });
}

// Проверка основного файла сервера
const serverPath = path.join(vpsPath, 'dist/index.js');
if (fs.existsSync(serverPath)) {
  console.log('\n📦 Проверка серверного файла:');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  const serverSize = fs.statSync(serverPath).size;
  console.log(`   ✅ Размер файла: ${Math.round(serverSize/1024)}KB`);
  
  // Проверка ключевых импортов
  const checks = [
    { name: 'Express', pattern: /express/ },
    { name: 'Database', pattern: /DATABASE_URL|drizzle/ },
    { name: 'WebSocket', pattern: /WebSocket|ws/ },
    { name: 'Error handling', pattern: /try|catch|error/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(serverContent);
    console.log(`   ${found ? '✅' : '❌'} ${check.name}`);
  });
}

// Информация о запуске
console.log('\n🚀 Команды для диагностики на VPS:');
console.log('systemctl status autobid-full');
console.log('journalctl -u autobid-full --no-pager -l');
console.log('curl -v http://localhost:3001/api/health');
console.log('ps aux | grep node');

console.log('\n🔧 Команды для исправления:');
console.log('systemctl restart autobid-full');
console.log('nginx -t && systemctl reload nginx');
console.log('tail -f /var/log/nginx/error.log');

console.log('\n📋 Проверить на VPS:');
console.log('1. Статус сервиса: systemctl status autobid-full');
console.log('2. Логи приложения: journalctl -u autobid-full -f');
console.log('3. Проверка порта: netstat -tlnp | grep 3001');
console.log('4. Тест API напрямую: curl http://localhost:3001/api/health');
console.log('5. Nginx логи: tail -f /var/log/nginx/error.log');