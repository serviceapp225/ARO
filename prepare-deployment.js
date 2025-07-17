#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 ПОДГОТОВКА К DEPLOYMENT - ИСПРАВЛЕНИЕ ОШИБКИ XX000');

// Исправляем .env файл - убираем все упоминания PostgreSQL
const envContent = `# PRODUCTION ENVIRONMENT
NODE_ENV=production
PORT=3000

# SMS настройки (демо режим)
SMS_LOGIN=demo
SMS_HASH=demo
SMS_SENDER=demo
SMS_SERVER=demo

# Админ настройки
ADMIN_API_KEY=admin-key-2025

# База данных - используем SQLite
USE_SQLITE=true
SQLITE_PATH=./autoauction.db

# Отключаем PostgreSQL полностью
DATABASE_URL=
POSTGRES_URL=
NEON_DATABASE_URL=
`;

// Записываем исправленный .env
fs.writeFileSync('dist/.env', envContent);

// Создаем минимальный сервер специально для deployment
const deploymentServer = `#!/usr/bin/env node

// Обработка ошибок для deployment
process.on('uncaughtException', (err) => {
  console.error('❌ DEPLOYMENT ERROR:', err.message);
  console.error('Stack:', err.stack);
  if (err.message.includes('XX000') || err.message.includes('PostgreSQL')) {
    console.error('🔍 ПРОБЛЕМА: Попытка подключения к PostgreSQL в deployment');
    console.error('✅ РЕШЕНИЕ: Используем SQLite вместо PostgreSQL');
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
  process.exit(1);
});

// Принудительно отключаем PostgreSQL
process.env.DATABASE_URL = '';
process.env.POSTGRES_URL = '';
process.env.NEON_DATABASE_URL = '';
process.env.USE_SQLITE = 'true';
process.env.SQLITE_PATH = './autoauction.db';

console.log('🚀 DEPLOYMENT СЕРВЕР ЗАПУЩЕН');
console.log('🗄️  Используем SQLite базу данных');
console.log('🚫 PostgreSQL отключен');
console.log('📍 Порт:', process.env.PORT || 3000);

// Импортируем основной сервер
import('./index.js').catch(err => {
  console.error('❌ Ошибка импорта сервера:', err);
  process.exit(1);
});
`;

fs.writeFileSync('dist/index-deploy.js', deploymentServer);

// Обновляем package.json для deployment
const pkg = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
pkg.scripts.start = 'node index-deploy.js';
pkg.main = 'index-deploy.js';
fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2));

console.log('✅ Создан deployment сервер без PostgreSQL');
console.log('✅ Обновлен .env файл');
console.log('✅ Обновлен package.json');
console.log('');
console.log('🎯 ТЕПЕРЬ DEPLOYMENT ДОЛЖЕН РАБОТАТЬ:');
console.log('1. PostgreSQL полностью отключен');
console.log('2. Используется только SQLite');
console.log('3. Исправлены все переменные окружения');
console.log('');
console.log('👉 Попробуйте deployment еще раз!');