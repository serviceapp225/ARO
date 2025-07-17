#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 ПОДГОТОВКА К DEPLOYMENT НА REPLIT...');

// Очистка предыдущих сборок
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('✅ Очищена предыдущая сборка');
}

// Создаем директорию dist
fs.mkdirSync('dist', { recursive: true });

// Создаем правильный package.json для Replit deployment
const deploymentPackageJson = {
  name: "autoauction-production",
  version: "1.0.0",
  type: "module",
  engines: {
    node: ">=18.0.0"
  },
  scripts: {
    start: "node index.js"
  },
  dependencies: {
    "express": "^4.21.2",
    "ws": "^8.13.0", 
    "better-sqlite3": "^12.1.1",
    "sharp": "^0.32.6",
    "compression": "^1.8.0"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(deploymentPackageJson, null, 2));
console.log('✅ Создан package.json для deployment');

// Создаем .env файл для production
const envContent = `NODE_ENV=production
PORT=3000
SMS_LOGIN=login
SMS_HASH=hash
SMS_SENDER=AUTOBID
SMS_SERVER=https://api.osonsms.com
ADMIN_API_KEY=admin-key-2024
DATABASE_URL=./autoauction.db
`;

fs.writeFileSync('dist/.env', envContent);
console.log('✅ Создан .env файл');

// Копируем базу данных
if (fs.existsSync('autoauction.db')) {
  fs.copyFileSync('autoauction.db', 'dist/autoauction.db');
  console.log('✅ База данных скопирована');
}

console.log('\n🎯 ИНСТРУКЦИИ ДЛЯ DEPLOYMENT:');
console.log('1. Запустите: npm run build');
console.log('2. Нажмите кнопку "Deploy" в Replit');
console.log('3. Выберите "Autoscale deployment"');
console.log('4. Дождитесь завершения deployment');
console.log('\n✅ Подготовка завершена! Готов к deployment.');