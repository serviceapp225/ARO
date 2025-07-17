#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

console.log('🔍 ДИАГНОСТИКА DEPLOYMENT');

// Проверка всех файлов
const checkFile = (filepath, name) => {
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    console.log(`✅ ${name}: ${stats.size} bytes`);
    return true;
  } else {
    console.log(`❌ ${name}: ОТСУТСТВУЕТ`);
    return false;
  }
};

console.log('\n📋 ПРОВЕРКА ФАЙЛОВ:');
checkFile('dist/index.js', 'Сервер');
checkFile('dist/package.json', 'Package.json');
checkFile('dist/autoauction.db', 'База данных');
checkFile('dist/public/index.html', 'Фронтенд');
checkFile('dist/.env', 'Env файл');

// Проверка содержимого package.json
console.log('\n📄 PACKAGE.JSON:');
if (fs.existsSync('dist/package.json')) {
  const pkg = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
  console.log('Start script:', pkg.scripts?.start || 'ОТСУТСТВУЕТ');
  console.log('Dependencies:', Object.keys(pkg.dependencies || {}).length);
  console.log('Type:', pkg.type || 'ОТСУТСТВУЕТ');
}

// Проверка запуска сервера
console.log('\n🚀 ТЕСТ ЗАПУСКА СЕРВЕРА:');
const testServer = spawn('node', ['index.js'], { 
  cwd: 'dist',
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'production', PORT: '3000' }
});

let serverOutput = '';
let serverStarted = false;

testServer.stdout.on('data', (data) => {
  serverOutput += data.toString();
  if (data.toString().includes('serving on port')) {
    serverStarted = true;
    console.log('✅ Сервер запустился успешно');
    testServer.kill();
  }
});

testServer.stderr.on('data', (data) => {
  console.log('❌ ОШИБКА:', data.toString());
});

// Таймаут для теста
setTimeout(() => {
  if (!serverStarted) {
    console.log('❌ Сервер не запустился в течение 5 секунд');
    console.log('📋 Вывод сервера:');
    console.log(serverOutput);
    testServer.kill();
  }
  
  console.log('\n🎯 РЕКОМЕНДАЦИИ:');
  if (serverStarted) {
    console.log('✅ Приложение готово к deployment');
    console.log('👉 Можете нажать кнопку Deploy в Replit');
  } else {
    console.log('❌ Есть проблемы с запуском');
    console.log('👉 Проверьте ошибки выше');
  }
}, 5000);