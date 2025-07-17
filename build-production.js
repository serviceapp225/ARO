#!/usr/bin/env node

/**
 * Скрипт для сборки приложения для продакшн развертывания
 * Автоматически копирует базу данных и настраивает окружение
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Начинаем сборку для продакшн развертывания...');

// 1. Сборка фронтенда и бэкенда
console.log('📦 Сборка фронтенда и бэкенда...');
try {
  execSync('vite build', { stdio: 'inherit' });
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Ошибка при сборке:', error.message);
  process.exit(1);
}

// 2. Копирование базы данных
console.log('📂 Копирование базы данных...');
try {
  if (fs.existsSync('autoauction.db')) {
    fs.copyFileSync('autoauction.db', 'dist/autoauction.db');
    console.log('✅ База данных скопирована в dist/');
  } else {
    console.log('⚠️  База данных не найдена, будет создана при первом запуске');
  }
} catch (error) {
  console.error('❌ Ошибка при копировании базы данных:', error.message);
}

// 3. Создание info файла
const buildInfo = {
  buildDate: new Date().toISOString(),
  nodeVersion: process.version,
  buildCommand: 'npm run build:production'
};

fs.writeFileSync('dist/build-info.json', JSON.stringify(buildInfo, null, 2));

console.log('🎉 Сборка завершена успешно!');
console.log('📁 Файлы готовы в папке dist/');
console.log('🚀 Для запуска используйте: PORT=3000 NODE_ENV=production node dist/index.js');