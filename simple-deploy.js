#!/usr/bin/env node

// Simple production deployment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('🚀 Запуск продакшн сервера на порту 3000...');

// Import the built server
import('./dist/index.js')
  .then(() => {
    console.log('✅ Продакшн сервер запущен успешно на порту 3000');
    console.log('🌐 Доступ: http://localhost:3000');
  })
  .catch((error) => {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  });