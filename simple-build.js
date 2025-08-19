#!/usr/bin/env node

// Упрощенный скрипт для деплоя без лишних зависимостей
import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Simple production build starting...');

try {
  // Проверяем что нужные файлы есть
  if (!existsSync('./server/index.ts')) {
    throw new Error('Server file not found');
  }

  console.log('✅ All files ready');
  console.log('🎯 Starting production server directly...');
  
  // Запускаем сервер напрямую
  process.env.NODE_ENV = 'production';
  execSync('tsx server/index.ts', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}