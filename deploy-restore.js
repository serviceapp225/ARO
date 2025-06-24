#!/usr/bin/env node

// Полное восстановление из продакшн деплоя
import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('Полное восстановление AutoBid из деплоя...');

try {
  // Остановка всех процессов
  console.log('Остановка всех процессов...');
  execSync('pkill -f "node.*dist" || true', { stdio: 'ignore' });
  execSync('pkill -f "tsx.*server" || true', { stdio: 'ignore' });
  
  // Проверка продакшн файлов
  if (!existsSync('./dist/index.js')) {
    console.log('Пересборка приложения...');
    execSync('npm run build', { stdio: 'inherit' });
  }
  
  // Установка продакшн окружения
  process.env.NODE_ENV = 'production';
  process.env.PORT = '5000';
  
  console.log('Запуск восстановленного приложения...');
  
  // Импорт и запуск
  const server = await import('./dist/index.js');
  
  console.log('Приложение восстановлено и работает на порту 5000');
  console.log('URL: https://workspace.serviceapp225.repl.co');
  
} catch (error) {
  console.error('Ошибка восстановления:', error.message);
  process.exit(1);
}