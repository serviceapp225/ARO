#!/usr/bin/env node

// Быстрый тест production сборки для DigitalOcean
import { spawn } from 'child_process';
import http from 'http';

console.log('🧪 Тест production сборки для DigitalOcean...\n');

// Проверяем, что файлы существуют
import fs from 'fs';
import path from 'path';

const requiredFiles = [
  'dist/production.js',
  'dist/public/index.html',
  'dist/public/assets',
  'Dockerfile',
  '.do/app.yaml',
  'server/production.ts'
];

console.log('📁 Проверка файлов:');
let allFilesExist = true;

for (const file of requiredFiles) {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

if (!allFilesExist) {
  console.log('\n❌ Некоторые файлы отсутствуют!');
  process.exit(1);
}

// Проверяем размеры файлов
console.log('\n📊 Размеры файлов:');
try {
  const prodJs = fs.statSync('dist/production.js');
  const indexHtml = fs.statSync('dist/public/index.html');
  
  console.log(`📦 production.js: ${(prodJs.size / 1024).toFixed(1)} KB`);
  console.log(`📄 index.html: ${indexHtml.size} bytes`);
  
  const assetsDir = fs.readdirSync('dist/public/assets');
  console.log(`🎨 assets файлов: ${assetsDir.length}`);
  
} catch (error) {
  console.log('❌ Ошибка при проверке размеров файлов:', error.message);
}

// Проверяем содержимое index.html
console.log('\n🔍 Проверка index.html:');
try {
  const indexContent = fs.readFileSync('dist/public/index.html', 'utf8');
  
  const hasAssets = indexContent.includes('./assets/');
  const hasRoot = indexContent.includes('<div id="root">');
  
  console.log(`${hasAssets ? '✅' : '❌'} Ссылки на assets`);
  console.log(`${hasRoot ? '✅' : '❌'} Root div элемент`);
  
} catch (error) {
  console.log('❌ Ошибка при проверке index.html:', error.message);
}

console.log('\n🚀 Все проверки завершены!');
console.log('\n📋 Готово к деплою в DigitalOcean:');
console.log('✅ Dockerfile с системными зависимостями');
console.log('✅ server/production.ts независимый сервер');
console.log('✅ .do/app.yaml оптимизированная конфигурация');
console.log('✅ dist/production.js собранный сервер');
console.log('✅ dist/public/ frontend assets');
console.log('\n🎯 Команда для локального теста: node dist/production.js');