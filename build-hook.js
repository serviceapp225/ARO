#!/usr/bin/env node

// Этот скрипт запускается автоматически после npm run build
// Он копирует базу данных в папку dist для production deployment

import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔄 Запуск build-hook для Replit deployment...');

// Проверяем, что база данных существует
if (!existsSync('autoauction.db')) {
  console.error('❌ База данных autoauction.db не найдена');
  process.exit(1);
}

// Копируем базу данных в папку dist
try {
  copyFileSync('autoauction.db', 'dist/autoauction.db');
  console.log('✅ База данных скопирована в dist/autoauction.db');
} catch (error) {
  console.error('❌ Ошибка при копировании базы данных:', error.message);
  process.exit(1);
}

// Создаем build-info.json
const buildInfo = {
  timestamp: new Date().toISOString(),
  mode: 'production',
  files: ['index.js', 'autoauction.db', 'public/']
};

try {
  import('fs').then(({ writeFileSync }) => {
    writeFileSync('dist/build-info.json', JSON.stringify(buildInfo, null, 2));
    console.log('✅ Создан dist/build-info.json');
  });
} catch (error) {
  console.error('❌ Ошибка при создании build-info.json:', error.message);
}

console.log('🎉 Build-hook завершен успешно!');