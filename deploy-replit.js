#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, copyFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Запуск Replit deployment процесса...');

// Проверяем, есть ли уже собранные файлы
if (!existsSync('dist')) {
  console.log('📦 Запуск стандартной сборки...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Стандартная сборка завершена');
  } catch (error) {
    console.error('❌ Ошибка при сборке:', error.message);
    process.exit(1);
  }
}

// Проверяем, есть ли база данных в папке dist
if (!existsSync('dist/autoauction.db')) {
  console.log('📦 Копирование базы данных...');
  try {
    execSync('node build-production.js', { stdio: 'inherit' });
    console.log('✅ База данных скопирована');
  } catch (error) {
    console.error('❌ Ошибка при копировании базы данных:', error.message);
    process.exit(1);
  }
}

// Проверяем, что все файлы готовы
const requiredFiles = [
  'dist/index.js',
  'dist/autoauction.db',
  'dist/public/index.html'
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`❌ Отсутствует файл: ${file}`);
    process.exit(1);
  }
}

// Создаем файл для указания Replit правильного порта
const replitEnv = `NODE_ENV=production
PORT=3000
`;

writeFileSync('.env.production', replitEnv);
console.log('✅ Создан .env.production файл');

console.log('🎉 Deployment готов!');
console.log('📋 Инструкции для Replit:');
console.log('1. Нажмите кнопку "Deploy" в интерфейсе Replit');
console.log('2. Выберите "Autoscale" deployment');
console.log('3. Replit автоматически использует команды из .replit файла');
console.log('');
console.log('🌐 После deployment приложение будет доступно по адресу:');
console.log('   https://[your-repl-name].[your-username].repl.co');
console.log('');
console.log('📊 Файлы готовы для deployment:');
console.log('   - dist/index.js (259KB)');
console.log('   - dist/autoauction.db (16MB)');
console.log('   - dist/public/ (фронтенд)');