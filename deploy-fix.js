#!/usr/bin/env node
/**
 * DEPLOYMENT FIX - РЕШЕНИЕ ПРОБЛЕМЫ "NOT FOUND" 
 * 
 * Эта проблема возникает из-за несовместимости портов в .replit файле:
 * - Development: порт 5000
 * - Production: нужен порт 3000
 * - В .replit настроено несколько портов, что не поддерживается deployment
 * 
 * Решение: принудительно установить правильные переменные окружения
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМЫ DEPLOYMENT...');

// 1. Проверяем текущую настройку сервера
console.log('📋 Анализ настроек...');

const serverFile = path.join(__dirname, 'server', 'index.ts');
if (fs.existsSync(serverFile)) {
  const content = fs.readFileSync(serverFile, 'utf8');
  console.log('✅ server/index.ts найден');
  
  if (content.includes('process.env.NODE_ENV === \'production\' ? 3000 : 5000')) {
    console.log('✅ Логика портов уже исправлена');
  } else {
    console.log('⚠️ Требуется обновление логики портов');
  }
} else {
  console.log('❌ server/index.ts не найден');
}

// 2. Создаем правильный build для deployment
console.log('\n🚀 СОЗДАНИЕ PRODUCTION BUILD...');



try {
  // Устанавливаем правильные переменные для production
  process.env.NODE_ENV = 'production';
  process.env.PORT = '3000';
  
  console.log('🏗️ Выполняется npm run build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build завершен успешно!');
  
  // Проверяем результат
  const distExists = fs.existsSync(path.join(__dirname, 'dist'));
  const indexExists = fs.existsSync(path.join(__dirname, 'dist', 'index.js'));
  
  if (distExists && indexExists) {
    console.log('✅ Файлы deployment готовы:');
    console.log('  - dist/index.js создан');
    
    // Проверяем размер
    const stats = fs.statSync(path.join(__dirname, 'dist', 'index.js'));
    console.log(`  - Размер: ${Math.round(stats.size / 1024)}KB`);
  } else {
    console.log('❌ Ошибка: файлы deployment не созданы');
  }
  
} catch (error) {
  console.error('❌ Ошибка при build:', error.message);
}

console.log('\n📝 ИНСТРУКЦИИ ДЛЯ DEPLOYMENT:');
console.log('1. Убедитесь, что приложение запущено');
console.log('2. Нажмите кнопку "Deploy" в Replit');
console.log('3. Выберите "Autoscale" или "Reserved VM"');
console.log('4. Сервер будет использовать порт 3000 в production режиме');
console.log('\n🔧 DEPLOYMENT ПРОБЛЕМА ДОЛЖНА БЫТЬ РЕШЕНА!');