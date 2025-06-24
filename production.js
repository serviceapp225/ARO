#!/usr/bin/env node

// Production deployment for Replit
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Запуск продакшн деплоя...');

try {
  // Сборка приложения
  console.log('📦 Сборка приложения...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Проверка собранных файлов
  const distPath = join(process.cwd(), 'dist', 'index.js');
  if (!existsSync(distPath)) {
    throw new Error('Собранные файлы не найдены');
  }
  
  console.log('✅ Сборка завершена успешно');
  
  // Запуск продакшн сервера
  console.log('🚀 Запуск продакшн сервера...');
  process.env.NODE_ENV = 'production';
  process.env.PORT = '5000';
  
  // Импорт и запуск сервера
  const serverModule = await import('./dist/index.js');
  
  console.log('✅ Продакшн сервер запущен на порту 5000');
  
} catch (error) {
  console.error('❌ Ошибка деплоя:', error.message);
  process.exit(1);
}