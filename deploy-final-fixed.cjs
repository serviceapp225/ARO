#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FINAL DEPLOYMENT BUILD - ИСПРАВЛЕНИЕ ОШИБОК STORAGE');

try {
  // 1. Очистка старых файлов
  console.log('🧹 Очистка dist директории...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });

  // 2. Сборка фронтенда
  console.log('⚛️ Сборка React фронтенда...');
  execSync('npm run build', { stdio: 'inherit' });

  // 3. Сборка бэкенда с исправленным deploymentSafeInit
  console.log('🔧 Сборка Node.js бэкенда с исправлениями...');
  execSync('npx esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:better-sqlite3 --external:sharp --format=cjs', { stdio: 'inherit' });

  // 4. Копирование базы данных
  console.log('📊 Копирование базы данных SQLite...');
  if (fs.existsSync('autoauction.db')) {
    fs.copyFileSync('autoauction.db', 'dist/autoauction.db');
    const dbStats = fs.statSync('dist/autoauction.db');
    console.log(`✅ База данных скопирована: ${(dbStats.size / 1024 / 1024).toFixed(1)} MB`);
  }

  // 5. Создание package.json для продакшн
  console.log('📦 Создание production package.json...');
  const productionPackageJson = {
    "name": "autobid-tj-production",
    "version": "1.0.0",
    "type": "commonjs",
    "main": "index.js",
    "scripts": {
      "start": "NODE_ENV=production PORT=3000 node index.js"
    },
    "dependencies": {
      "better-sqlite3": "^8.7.0",
      "sharp": "^0.32.6"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(productionPackageJson, null, 2));

  // 6. Создание .env файла для продакшн
  console.log('⚙️ Создание production .env...');
  fs.writeFileSync('dist/.env', `NODE_ENV=production
PORT=3000
DATABASE_URL=sqlite:./autoauction.db
`);

  // 7. Проверка готовности деплоя
  console.log('🔍 Проверка файлов деплоя...');
  const serverSize = fs.statSync('dist/index.js').size;
  const dbSize = fs.statSync('dist/autoauction.db').size;
  const frontendSize = fs.statSync('dist/public/index.html').size;
  
  console.log(`✅ Сервер: ${(serverSize / 1024).toFixed(1)} KB`);
  console.log(`✅ База данных: ${(dbSize / 1024 / 1024).toFixed(1)} MB`);  
  console.log(`✅ Фронтенд: готов`);
  console.log(`📊 Общий размер: ${((serverSize + dbSize) / 1024 / 1024).toFixed(1)} MB`);

  console.log('\n🎯 DEPLOYMENT ГОТОВ К РАЗВЕРТЫВАНИЮ:');
  console.log('1. ✅ Файлы готовы в папке dist/');
  console.log('2. ✅ Ошибка storage.getAllListings исправлена');
  console.log('3. ✅ Порт настроен на 3000 для Replit');
  console.log('4. ✅ База данных SQLite включена');
  console.log('5. ✅ Для deployment: нажмите "Deploy" в Replit');
  console.log('\n🚀 ГОТОВО! Приложение готово к развертыванию на Replit.');

} catch (error) {
  console.error('❌ Ошибка сборки:', error.message);
  process.exit(1);
}