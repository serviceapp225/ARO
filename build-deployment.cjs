const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаем сборку deployment версии...');

// Очистка dist директории
if (fs.existsSync('dist')) {
  console.log('🧹 Очистка dist директории...');
  fs.rmSync('dist', { recursive: true, force: true });
}

// Создание dist директории
fs.mkdirSync('dist', { recursive: true });

// Сборка фронтенда
console.log('🔨 Сборка фронтенда...');
execSync('npm run build', { stdio: 'inherit' });

// Сборка deployment сервера (SQLite-только)
console.log('🔧 Сборка deployment сервера...');
execSync('npx esbuild server/index-deploy.ts --bundle --platform=node --target=node18 --format=cjs --outfile=dist/index.cjs --external:sqlite3 --external:better-sqlite3', { stdio: 'inherit' });

// Копирование базы данных
console.log('📋 Копирование базы данных...');
if (fs.existsSync('autoauction.db')) {
  fs.copyFileSync('autoauction.db', 'dist/autoauction.db');
  console.log('✅ База данных скопирована');
} else {
  console.log('⚠️  База данных не найдена');
}

// Создание production .env файла
console.log('⚙️  Создание .env.production файла...');
fs.writeFileSync('dist/.env.production', 'NODE_ENV=production\nPORT=3000\n');

// Проверка размеров
const stats = fs.statSync('dist/index.cjs');
console.log(`📊 Размер сервера: ${(stats.size / 1024).toFixed(1)}KB`);

if (fs.existsSync('dist/autoauction.db')) {
  const dbStats = fs.statSync('dist/autoauction.db');
  console.log(`📊 Размер базы данных: ${(dbStats.size / 1024 / 1024).toFixed(1)}MB`);
}

// Проверка сборки
console.log('🔍 Проверка сборки...');
if (fs.existsSync('dist/index.cjs') && fs.existsSync('dist/public/index.html')) {
  console.log('✅ Сборка завершена успешно!');
  console.log('📁 Файлы готовы для deployment:');
  console.log('  - dist/index.cjs (сервер)');
  console.log('  - dist/public/ (фронтенд)');
  console.log('  - dist/autoauction.db (база данных)');
} else {
  console.log('❌ Ошибка сборки!');
  process.exit(1);
}

console.log('\n🎉 DEPLOYMENT ГОТОВ!');
console.log('🚀 Нажмите кнопку "Deploy" в Replit');