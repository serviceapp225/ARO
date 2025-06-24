#!/usr/bin/env node

// Восстановление приложения из продакшн сборки
import { execSync } from 'child_process';

console.log('🔄 Восстановление AutoBid приложения...');

try {
  // Остановка текущих процессов
  console.log('⏹️ Остановка текущих процессов...');
  try {
    execSync('pkill -f "tsx.*server"', { stdio: 'ignore' });
    execSync('pkill -f "node.*dist/index"', { stdio: 'ignore' });
  } catch (e) {
    // Процессы могут не существовать
  }
  
  // Запуск на порту 3000
  console.log('🚀 Запуск восстановленного приложения на порту 3000...');
  process.env.NODE_ENV = 'production';
  process.env.PORT = '3000';
  
  const serverModule = await import('./dist/index.js');
  console.log('✅ Приложение успешно восстановлено на http://localhost:3000');
  
} catch (error) {
  console.error('❌ Ошибка восстановления:', error.message);
  process.exit(1);
}