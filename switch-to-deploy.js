#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

try {
  // Резервная копия текущего .replit
  if (fs.existsSync('.replit')) {
    fs.copyFileSync('.replit', '.replit.dev.backup');
    console.log('✅ Создана резервная копия .replit.dev.backup');
  }

  // Копируем deployment конфигурацию
  if (fs.existsSync('.replit.deployment')) {
    fs.copyFileSync('.replit.deployment', '.replit');
    console.log('✅ Включена deployment конфигурация (только 1 порт)');
    console.log('🚀 Теперь можно запускать деплой!');
    console.log('');
    console.log('📋 Команды для деплоя:');
    console.log('   Build: npm install && npm run build');
    console.log('   Run: npm start');
    console.log('   Type: Reserved VM');
  } else {
    console.log('❌ Файл .replit.deployment не найден');
  }
} catch (error) {
  console.error('❌ Ошибка:', error.message);
}